/* Синхронизация с Google Sheets через Apps Script */

/* ---------- Маркеры ---------- */
async function apiFetchMarkers() {
  try {
    const res = await fetch(CONFIG.API_URL + "?kind=markers", { method: "GET", mode: "cors" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
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

// Совместимость со старым именем (используется в main.js)
async function apiFetchAll() {
  return apiFetchMarkers();
}

async function apiUpsertMarker(marker) {
  return apiPost({ kind: "marker", action: "upsert", marker });
}

async function apiDeleteMarker(id) {
  return apiPost({ kind: "marker", action: "delete", id });
}

/* ---------- Дороги ---------- */
async function apiFetchRoads() {
  try {
    const res = await fetch(CONFIG.API_URL + "?kind=roads", { method: "GET", mode: "cors" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
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

async function apiUpsertRoad(road) {
  return apiPost({ kind: "road", action: "upsert", road });
}

async function apiDeleteRoad(id) {
  return apiPost({ kind: "road", action: "delete", id });
}

/* ---------- Универсальный POST ---------- */
async function apiPost(body) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
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
