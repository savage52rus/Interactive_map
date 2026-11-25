function parseCoord(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : NaN;
  if (typeof v === "string") {
    const trimmed = v.trim().replace(",", ".");
    if (!trimmed) return NaN;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function roundCoord(n) {
  return Math.round(n * 100) / 100;
}

function computeNextId(items) {
  if (!Array.isArray(items) || !items.length) return 1;
  let max = 0;
  for (const item of items) {
    const id = parseInt(item && item.id, 10);
    if (Number.isFinite(id) && id > max) max = id;
  }
  return max + 1;
}

function isGhostMarkerRow(m) {
  if (!m || typeof m !== "object") return true;
  const rawId = parseInt(m.id, 10);
  const hasValidId = Number.isFinite(rawId) && rawId > 0;
  const name = String(m.name ?? "").trim();
  const desc = String(m.desc ?? "").trim();
  const x = parseCoord(m.x);
  const y = parseCoord(m.y);
  const coordsZeroOrMissing = (!Number.isFinite(x) || x === 0) && (!Number.isFinite(y) || y === 0);
  // Пустая строка-призрак без id, имени и описания с координатами 0;0 (или пустыми)
  if (!hasValidId && !name && !desc && coordsZeroOrMissing) return true;
  return false;
}

function normalizeMarkersWithMeta(rawList) {
  if (!Array.isArray(rawList)) return { items: [], hadInvalidIds: false };
  const usedIds = new Set();
  let maxId = 0;
  let hadInvalidIds = false;
  const prepared = [];

  for (const m of rawList) {
    if (isGhostMarkerRow(m)) {
      hadInvalidIds = true;
      continue;
    }
    const x = parseCoord(m.x);
    const y = parseCoord(m.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      hadInvalidIds = true;
      continue;
    }
    const rawId = parseInt(m.id, 10);
    let id = null;
    if (Number.isFinite(rawId) && rawId > 0 && !usedIds.has(rawId)) {
      id = rawId;
      usedIds.add(id);
      if (id > maxId) maxId = id;
    } else {
      hadInvalidIds = true;
    }
    const type = (typeof TYPES !== "undefined" && TYPES[m.type]) ? m.type : "poi";
    const color = /^#[0-9a-fA-F]{6}$/.test(String(m.color || "")) ? String(m.color) : "#c9a227";
    prepared.push({
      id,
      type,
      x: roundCoord(x),
      y: roundCoord(y),
      name: String(m.name ?? ""),
      desc: String(m.desc ?? ""),
      color
    });
  }

  for (const item of prepared) {
    if (item.id == null) {
      maxId += 1;
      while (usedIds.has(maxId)) maxId += 1;
      item.id = maxId;
      usedIds.add(item.id);
    }
  }

  return { items: prepared, hadInvalidIds };
}

function normalizeMarkers(rawList) {
  return normalizeMarkersWithMeta(rawList).items;
}

function normalizeRoadsWithMeta(rawList) {
  if (!Array.isArray(rawList)) return { items: [], hadInvalidIds: false };
  const usedIds = new Set();
  let maxId = 0;
  let hadInvalidIds = false;
  const prepared = [];

  for (const r of rawList) {
    if (!r || typeof r !== "object" || !Array.isArray(r.points)) continue;
    const pts = r.points
      .map(p => ({ x: parseCoord(p && p.x), y: parseCoord(p && p.y) }))
      .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
      .map(p => ({ x: roundCoord(p.x), y: roundCoord(p.y) }));
    if (pts.length < 2) continue;

    const rawId = parseInt(r.id, 10);
    let id = null;
    if (Number.isFinite(rawId) && rawId > 0 && !usedIds.has(rawId)) {
      id = rawId;
      usedIds.add(id);
      if (id > maxId) maxId = id;
    } else {
      hadInvalidIds = true;
    }
    const weeksRaw = parseInt(r.weeks, 10);
    const weeks = (Number.isFinite(weeksRaw) && weeksRaw > 0) ? weeksRaw : 1;
    prepared.push({ id, weeks, points: pts });
  }

  for (const item of prepared) {
    if (item.id == null) {
      maxId += 1;
      while (usedIds.has(maxId)) maxId += 1;
      item.id = maxId;
      usedIds.add(item.id);
    }
  }

  return { items: prepared, hadInvalidIds };
}

function normalizeRoads(rawList) {
  return normalizeRoadsWithMeta(rawList).items;
}

function sanitizeScale(raw) {
  const scale = {
    walk: CONFIG.DEFAULT_WALK,
    cart: CONFIG.DEFAULT_CART
  };
  if (raw && typeof raw === "object") {
    const w = parseCoord(raw.walk);
    const c = parseCoord(raw.cart);
    const r = parseCoord(raw.refPx);
    if (Number.isFinite(w) && w > 0) scale.walk = w;
    if (Number.isFinite(c) && c > 0) scale.cart = c;
    if (Number.isFinite(r) && r > 0) scale.refPx = r;
  }
  return scale;
}

function sanitizeTypeIcons(raw) {
  const result = { ...DEFAULT_TYPE_ICONS };
  if (raw && typeof raw === "object") {
    Object.keys(TYPES).forEach(k => {
      const variants = (typeof ICON_VARIANTS !== "undefined" && ICON_VARIANTS[k]) ? ICON_VARIANTS[k] : [];
      const maxIdx = Math.max(0, variants.length - 1);
      const val = Number(raw[k]);
      if (Number.isInteger(val) && val >= 0 && val <= maxIdx) {
        result[k] = val;
      }
    });
  }
  return result;
}

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d && Array.isArray(d.markers)) {
      state.markers = normalizeMarkers(d.markers);
      state.roads = normalizeRoads(d.roads);
      if (d.scale && typeof d.scale === "object") {
        state.scale = sanitizeScale(d.scale);
      }
      if (d.typeIcons && typeof d.typeIcons === "object") {
        state.typeIcons = sanitizeTypeIcons(d.typeIcons);
      }
      state.nextId = Math.max(Number(d.nextId) || 1, computeNextId(state.markers));
      state.nextRoadId = Math.max(Number(d.nextRoadId) || 1, computeNextId(state.roads));
    }
  } catch (e) { console.warn("loadState", e); }
}

function persistState() {
  try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn("persistState", e); }
}
