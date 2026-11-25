/* Синхронизация с Google Sheets через Apps Script (JSONP для GET, fetch для POST) */

let jsonpSeq = 0;
let serverApiVersion = 0;
let serverApiStatus = "pending"; // "pending" | "v2" | "legacy" | "offline"
let serverNeedsSheetCleanup = false;

function jsonpRequest(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_cb_" + Date.now() + "_" + (++jsonpSeq);
    const script = document.createElement("script");
    const cleanup = () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    };
    const timeout = setTimeout(() => { cleanup(); reject(new Error("Таймаут GET запроса")); }, timeoutMs);
    window[callbackName] = (data) => { clearTimeout(timeout); cleanup(); resolve(data); };
    script.onerror = () => { clearTimeout(timeout); cleanup(); reject(new Error("Ошибка загрузки скрипта")); };
    const separator = url.includes("?") ? "&" : "?";
    script.src = url + separator + "callback=" + callbackName + "&_t=" + Date.now();
    document.body.appendChild(script);
  });
}

/* ---------- Загрузка всех данных ---------- */
async function apiFetchAll() {
  try {
    const data = await jsonpRequest(CONFIG.API_URL);
    if (!data || data.error) throw new Error((data && data.error) || "Неверный ответ");

    serverApiVersion = Number(data.apiVersion) || 0;
    serverApiStatus = serverApiVersion >= 2 ? "v2" : "legacy";
    if (typeof updateGasVersionWarning === "function") updateGasVersionWarning();

    const rawMarkers = Array.isArray(data) ? data : (data.markers || []);
    const rawRoads = Array.isArray(data) ? [] : (data.roads || []);

    const normM = normalizeMarkersWithMeta(rawMarkers);
    const normR = normalizeRoadsWithMeta(rawRoads);
    serverNeedsSheetCleanup = normM.hadInvalidIds || normR.hadInvalidIds;

    const scale = (data.scale && typeof data.scale === "object") ? sanitizeScale(data.scale) : null;
    const typeIcons = (data.typeIcons && typeof data.typeIcons === "object") ? sanitizeTypeIcons(data.typeIcons) : null;

    return {
      markers: normM.items,
      roads: normR.items,
      scale,
      typeIcons,
      apiVersion: serverApiVersion
    };
  } catch (err) {
    console.error("apiFetchAll:", err);
    serverApiStatus = "offline";
    if (typeof updateGasVersionWarning === "function") updateGasVersionWarning();
    return null;
  }
}

function cleanMarkerForApi(marker) {
  const rawId = parseInt(marker && marker.id, 10);
  const id = (Number.isFinite(rawId) && rawId > 0) ? rawId : Date.now();
  const x = parseCoord(marker && marker.x);
  const y = parseCoord(marker && marker.y);
  return {
    id,
    type: (marker && TYPES[marker.type]) ? marker.type : "poi",
    x: Number.isFinite(x) ? roundCoord(x) : 0,
    y: Number.isFinite(y) ? roundCoord(y) : 0,
    name: String((marker && marker.name) ?? ""),
    desc: String((marker && marker.desc) ?? ""),
    color: /^#[0-9a-fA-F]{6}$/.test(String((marker && marker.color) || "")) ? String(marker.color) : "#c9a227",
    icon: (typeof sanitizeMarkerIcon === "function") ? sanitizeMarkerIcon(marker && marker.icon) : ""
  };
}

function withLegacyMarkerHeaderAliases(clean) {
  return {
    ...clean,
    ID: clean.id,
    Id: clean.id,
    iD: clean.id,
    "id ": clean.id,
    " id": clean.id,
    "ID ": clean.id,
    " ID": clean.id,
    "ид": clean.id,
    "ИД": clean.id,
    "Ид": clean.id,
    "№": clean.id,
    "#": clean.id,
    num: clean.id,
    Num: clean.id,
    NUM: clean.id,
    "номер": clean.id,
    "Номер": clean.id,
    "код": clean.id,
    "Код": clean.id,
    "id маркера": clean.id,
    "ID маркера": clean.id,
    "": clean.id,
    Type: clean.type,
    TYPE: clean.type,
    "тип": clean.type,
    "Тип": clean.type,
    X: clean.x,
    "х": clean.x,
    "Х": clean.x,
    Y: clean.y,
    "у": clean.y,
    "У": clean.y,
    Name: clean.name,
    NAME: clean.name,
    "название": clean.name,
    "Название": clean.name,
    Desc: clean.desc,
    DESC: clean.desc,
    Description: clean.desc,
    "описание": clean.desc,
    "Описание": clean.desc,
    Color: clean.color,
    COLOR: clean.color,
    "цвет": clean.color,
    "Цвет": clean.color,
    Icon: clean.icon,
    ICON: clean.icon,
    "иконка": clean.icon,
    "Иконка": clean.icon
  };
}

function cleanRoadForApi(road) {
  const rawId = parseInt(road && road.id, 10);
  const id = (Number.isFinite(rawId) && rawId > 0) ? rawId : Date.now();
  const weeksRaw = parseInt(road && road.weeks, 10);
  const weeks = (Number.isFinite(weeksRaw) && weeksRaw > 0) ? weeksRaw : 1;
  const points = Array.isArray(road && road.points)
    ? road.points
        .map(p => ({ x: parseCoord(p && p.x), y: parseCoord(p && p.y) }))
        .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
        .map(p => ({ x: roundCoord(p.x), y: roundCoord(p.y) }))
    : [];
  return { id, weeks, points };
}

function withLegacyRoadHeaderAliases(clean) {
  return {
    ...clean,
    ID: clean.id,
    Id: clean.id,
    iD: clean.id,
    "id ": clean.id,
    " id": clean.id,
    "ID ": clean.id,
    "ид": clean.id,
    "ИД": clean.id,
    "№": clean.id,
    "#": clean.id,
    "": clean.id,
    Weeks: clean.weeks,
    WEEKS: clean.weeks,
    "недели": clean.weeks,
    "Недели": clean.weeks,
    Points: clean.points,
    POINTS: clean.points
  };
}

/* ---------- Отправка данных ---------- */
async function apiUpsertMarker(marker) {
  const clean = cleanMarkerForApi(marker);
  const markerPayload = serverApiVersion >= 2 ? clean : withLegacyMarkerHeaderAliases(clean);
  const res = await apiPost({
    kind: "marker",
    action: "upsert",
    ...clean,
    marker: markerPayload,
    item: markerPayload
  });
  if (res && res.status === "ok") {
    const returnedId = parseInt(res.id, 10);
    if (Number.isFinite(returnedId) && returnedId > 0) {
      marker.id = returnedId;
    } else {
      marker.id = clean.id;
    }
  }
  return res;
}

async function apiDeleteMarker(id) {
  return apiPost({ kind: "marker", action: "delete", id });
}

async function apiUpsertRoad(road) {
  const clean = cleanRoadForApi(road);
  const roadPayload = serverApiVersion >= 2 ? clean : withLegacyRoadHeaderAliases(clean);
  const res = await apiPost({
    kind: "road",
    action: "upsert",
    ...clean,
    road: roadPayload,
    item: roadPayload
  });
  if (res && res.status === "ok") {
    const returnedId = parseInt(res.id, 10);
    if (Number.isFinite(returnedId) && returnedId > 0) {
      road.id = returnedId;
    } else {
      road.id = clean.id;
    }
  }
  return res;
}

async function apiDeleteRoad(id) {
  return apiPost({ kind: "road", action: "delete", id });
}

async function apiSyncBatch(diff) {
  return apiPost({ kind: "sync", action: "sync", ...diff }, 45000);
}

/*
 * Синхронизация изменений:
 * - Пакетный запрос (kind: "sync") отправляется ТОЛЬКО если сервер подтвердил apiVersion >= 2 в doGet.
 *   Это исключает запись пустых строк с координатами 0;0 на старых версиях развёрнутого скрипта GAS!
 * - На старых версиях GAS (apiVersion < 2) используются поштучные запросы со всеми вариантами названия колонки ID.
 */
async function apiSyncChanges(diff) {
  const {
    deletedMarkerIds = [],
    upsertedMarkers = [],
    allMarkers = null,
    deletedRoadIds = [],
    upsertedRoads = [],
    allRoads = null,
    scale = null,
    typeIcons = null
  } = diff;

  if (!deletedMarkerIds.length && !upsertedMarkers.length &&
      !deletedRoadIds.length && !upsertedRoads.length &&
      !scale && !typeIcons && !serverNeedsSheetCleanup) {
    return { ok: true, errors: [], usedLegacyApi: serverApiVersion < 2 };
  }

  if (serverApiVersion >= 2) {
    const cleanUpsMarkers = (serverNeedsSheetCleanup && Array.isArray(allMarkers) ? allMarkers : upsertedMarkers)
      .map(cleanMarkerForApi);
    const cleanUpsRoads = (serverNeedsSheetCleanup && Array.isArray(allRoads) ? allRoads : upsertedRoads)
      .map(cleanRoadForApi);

    const batchRes = await apiSyncBatch({
      replaceAllMarkers: Boolean(serverNeedsSheetCleanup && Array.isArray(allMarkers)),
      replaceAllRoads: Boolean(serverNeedsSheetCleanup && Array.isArray(allRoads)),
      deletedMarkerIds,
      upsertedMarkers: cleanUpsMarkers,
      deletedRoadIds,
      upsertedRoads: cleanUpsRoads,
      ...(scale ? { scale } : {}),
      ...(typeIcons ? { typeIcons } : {})
    });

    if (batchRes.status === "ok") {
      serverNeedsSheetCleanup = false;
      return { ok: true, errors: [], usedLegacyApi: false };
    }
    return { ok: false, errors: [String(batchRes.message || "Ошибка пакетной синхронизации")], usedLegacyApi: false };
  }

  // Сервер работает на старой версии GAS (до обновления googleappsapiscript.txt) — НЕ шлём kind:"sync"!
  const errors = [];

  for (const id of deletedMarkerIds) {
    if (!(Number(id) > 0)) continue;
    const res = await apiDeleteMarker(id);
    if (res.status !== "ok" && !/не найден/i.test(String(res.message || ""))) {
      errors.push("Не удалось удалить маркер " + id);
    }
  }
  for (const id of deletedRoadIds) {
    if (!(Number(id) > 0)) continue;
    const res = await apiDeleteRoad(id);
    if (res.status !== "ok" && !/не найден/i.test(String(res.message || ""))) {
      errors.push("Не удалось удалить дорогу " + id);
    }
  }
  for (const m of upsertedMarkers) {
    const res = await apiUpsertMarker(m);
    if (res.status !== "ok") errors.push("Не удалось сохранить маркер «" + (m.name || m.id) + "»");
  }
  for (const r of upsertedRoads) {
    const res = await apiUpsertRoad(r);
    if (res.status !== "ok") errors.push("Не удалось сохранить дорогу " + r.id);
  }

  return { ok: errors.length === 0, errors, usedLegacyApi: true };
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
