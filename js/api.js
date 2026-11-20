/* Синхронизация с Google Sheets через Apps Script (JSONP для GET, fetch для POST) */

// Вспомогательная функция для JSONP-запроса
function jsonpRequest(url) {
  return new Promise((resolve, reject) => {
    // Уникальное имя для функции-коллбэка
    const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
    
    // Создаём скрипт
    const script = document.createElement('script');
    
    // Очистка после завершения
    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    };

    // Таймаут на случай, если сервер не ответит
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Таймаут запроса"));
    }, 15000);

    // Определяем глобальную функцию, которую вызовет GAS
    window[callbackName] = (data) => {
      clearTimeout(timeout);
      cleanup();
      resolve(data);
    };

    script.onerror = (err) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error("Ошибка загрузки скрипта"));
    };

    // Добавляем параметр callback к URL
    const separator = url.includes('?') ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    
    document.body.appendChild(script);
  });
}

/* ---------- Маркеры (Чтение) ---------- */
async function apiFetchMarkers() {
  try {
    const data = await jsonpRequest(CONFIG.API_URL + "?kind=markers");
    if (!Array.isArray(data)) {
      if (data && data.error) throw new Error(data.error);
      throw new Error("Неожиданный ответ сервера");
    }
    return data.map(m => ({
      id: parseInt(m.id, 10) || 0,
      type: TYPES[m.type] ? m.type : "poi",
      x: Number(m.x) || 0,
      y: Number(m.y) || 0,
      name: String(m.name || ""),
      desc: String(m.desc || ""),
      color: /^#[0-9a-fA-F]{6}$/.test(m.color) ? m.color : "#c9a227"
    }));
  } catch (err) {
    console.error("apiFetchMarkers:", err);
    return null;
  }
}

async function apiFetchAll() {
  return apiFetchMarkers();
}

/* ---------- Дороги (Чтение) ---------- */
async function apiFetchRoads() {
  try {
    const data = await jsonpRequest(CONFIG.API_URL + "?kind=roads");
    if (!Array.isArray(data)) {
      if (data && data.error) throw new Error(data.error);
      throw new Error("Неожиданный ответ сервера");
    }
    return data
      .map(r => {
        const pts = Array.isArray(r.points)
          ? r.points.map(p => ({ x: Number(p.x), y: Number(p.y) }))
              .filter(p => isFinite(p.x) && isFinite(p.y))
          : [];
        return {
          id: parseInt(r.id, 10) || 0,
          weeks: parseInt(r.weeks, 10) || 1,
          points: pts
        };
      })
      .filter(r => r.points.length >= 2);
  } catch (err) {
    console.error("apiFetchRoads:", err);
    return null;
  }
}

/* ---------- Запись (POST работает как раньше) ---------- */
async function apiUpsertMarker(marker) {
  return apiPost({ kind: "marker", action: "upsert", marker });
}

async function apiDeleteMarker(id) {
  return apiPost({ kind: "marker", action: "delete", id });
}

async function apiUpsertRoad(road) {
  return apiPost({ kind: "road", action: "upsert", road });
}

async function apiDeleteRoad(id) {
  return apiPost({ kind: "road", action: "delete", id });
}

async function apiPost(body) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...body, token: CONFIG.SECRET_TOKEN })
    });
    const data = await res.json();
    if (data.status !== "ok") throw new Error(data.message || "Ошибка сервера");
    return data;
  } catch (err) {
    console.error("apiPost:", err);
    return { status: "error", message: err.toString() };
  }
}