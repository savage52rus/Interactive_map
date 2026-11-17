/* Синхронизация с Google Sheets через Apps Script */

async function apiFetchAll() {
  try {
    const res = await fetch(CONFIG.API_URL, { method: "GET", mode: "cors" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) {
      if (data && data.error) throw new Error(data.error);
      throw new Error("Неожиданный ответ сервера");
    }
    // нормализуем типы
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
    console.error("apiFetchAll:", err);
    return null;
  }
}

async function apiUpsertMarker(marker) {
  return apiPost({ action: "upsert", marker });
}

async function apiDeleteMarker(id) {
  return apiPost({ action: "delete", id });
}

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
