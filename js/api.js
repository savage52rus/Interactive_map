/* Синхронизация с Google Sheets через Apps Script (JSONP для GET, fetch для POST) */

function jsonpRequest(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    };
    const timeout = setTimeout(() => { cleanup(); reject(new Error("Таймаут GET запроса")); }, timeoutMs);
    window[callbackName] = (data) => { clearTimeout(timeout); cleanup(); resolve(data); };
    script.onerror = () => { clearTimeout(timeout); cleanup(); reject(new Error("Ошибка загрузки скрипта")); };
    const separator = url.includes('?') ? '&' : '?';
    script.src = url + separator + 'callback=' + callbackName;
    document.body.appendChild(script);
  });
}

/* ---------- Загрузка всех данных ---------- */
async function apiFetchAll() {
  try {
    const data = await jsonpRequest(CONFIG.API_URL);
    if (!data || data.error) throw new Error(data.error || "Неверный ответ");

    const markers = (data.markers || []).map(m => ({
      id: parseInt(m.id, 10) || 0,
      type: TYPES[m.type] ? m.type : "poi",
      x: Number(m.x) || 0, y: Number(m.y) || 0,
      name: String(m.name || ""), desc: String(m.desc || ""),
      color: /^#[0-9a-fA-F]{6}$/.test(m.color) ? m.color : "#c9a227"
    }));

    const roads = (data.roads || []).map(r => {
      const pts = Array.isArray(r.points) ? r.points.map(p => ({ x: Number(p.x), y: Number(p.y) })).filter(p => isFinite(p.x) && isFinite(p.y)) : [];
      return { id: parseInt(r.id, 10) || 0, weeks: parseInt(r.weeks, 10) || 1, points: pts };
    }).filter(r => r.points.length >= 2);

    return { markers, roads };
  } catch (err) {
    console.error("apiFetchAll:", err);
    return null;
  }
}

/* ---------- Отправка данных ---------- */
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

async function apiPost(body, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...body, token: CONFIG.SECRET_TOKEN }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data.status !== "ok") throw new Error(data.message || "Ошибка сервера");
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("apiPost:", err);
    return { status: "error", message: err.toString() };
  }
}