let pendingImport = null;

function exportJSON() {
  const src = draft ? draft : state;
  const markers = normalizeMarkers(src.markers);
  const roads = normalizeRoads(src.roads);
  const payload = {
    app: "fantasy-map",
    version: CONFIG.EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    scale: sanitizeScale(src.scale),
    typeIcons: sanitizeTypeIcons(src.typeIcons),
    nextId: Math.max(Number(src.nextId) || 1, computeNextId(markers)),
    nextRoadId: Math.max(Number(src.nextRoadId) || 1, computeNextId(roads)),
    markers,
    roads
  };
  downloadBlob(JSON.stringify(payload, null, 2),
    `fantasy-map-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`);
  setHint("Экспорт готов: файл скачан");
  setTimeout(() => setHint(""), 2000);
}

function onImportFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const result = validateImport(data);
      if (!result.ok) {
        pendingImport = null;
        $("importInfo").textContent = "Файл: " + file.name;
        $("importErr").textContent = "Ошибка: " + result.error;
        $("importApply").disabled = true;
        $("importModeBlock").style.display = "none";
        $("importOverlay").classList.add("show");
        return;
      }
      pendingImport = result.clean;
      renderImportPreview(file.name);
    } catch (err) {
      pendingImport = null;
      $("importInfo").textContent = "Файл: " + file.name;
      $("importErr").textContent = "Не удалось разобрать JSON: " + err.message;
      $("importApply").disabled = true;
      $("importModeBlock").style.display = "none";
      $("importOverlay").classList.add("show");
    }
  };
  reader.onerror = () => {
    $("importErr").textContent = "Ошибка чтения файла.";
  };
  reader.readAsText(file);
}

function renderImportPreview(fileName) {
  if (!pendingImport) return;
  $("importMode").value = "replace";
  updateImportModeHint();
  const cur = draft || state;
  const curMarkerIds = new Set(cur.markers.map(m => m.id));
  const curRoadIds = new Set(cur.roads.map(r => r.id));

  let updMarkers = 0;
  pendingImport.markers.forEach(m => { if (m.id != null && curMarkerIds.has(m.id)) updMarkers++; });
  const addMarkers = pendingImport.markers.length - updMarkers;

  let updRoads = 0;
  pendingImport.roads.forEach(r => { if (r.id != null && curRoadIds.has(r.id)) updRoads++; });
  const addRoads = pendingImport.roads.length - updRoads;

  $("importInfo").innerHTML = `Файл: <b>${escapeHtml(fileName)}</b><br>
    Маркеров в файле: <b>${pendingImport.markers.length}</b>, дорог: <b>${pendingImport.roads.length}</b><br>
    Масштаб: ${pendingImport.scale.refPx ? "задан" : "не задан"}, иконки типов: ${pendingImport.hasTypeIcons ? "заданы" : "по умолчанию"}<br>
    <span class="hint">Сейчас на карте: ${cur.markers.length} марк., ${cur.roads.length} дорог<br>
    При слиянии: маркеров обновится ${updMarkers}, добавится ${addMarkers}; дорог обновится ${updRoads}, добавится ${addRoads}.</span>`;
  $("importErr").textContent = "";
  $("importModeBlock").style.display = "block";
  $("importApply").disabled = false;
  $("importOverlay").classList.add("show");
}

function updateImportModeHint() {
  const hint = $("importMergeHint");
  if (!hint) return;
  hint.textContent = $("importMode").value === "merge"
    ? "Слияние: совпадающие по id обновляются, новые добавляются, остальные остаются."
    : "Замена: текущие данные полностью замещаются данными из файла (исходные id сохраняются).";
}

function validateImport(data) {
  if (!data || typeof data !== "object") return { ok: false, error: "ожидался объект" };
  if (!Array.isArray(data.markers)) return { ok: false, error: "поле markers отсутствует или не массив" };

  const cleanMarkers = [];
  for (const m of data.markers) {
    if (!m || typeof m !== "object") continue;
    const type = TYPES[m.type] ? m.type : "poi";
    const x = parseCoord(m.x), y = parseCoord(m.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const id = Number.isFinite(Number(m.id)) && Number(m.id) > 0 ? Math.floor(Number(m.id)) : null;
    cleanMarkers.push({
      id, type, x: roundCoord(x), y: roundCoord(y),
      name: typeof m.name === "string" && m.name.trim() ? m.name.trim().slice(0, 200) : TYPES[type].label,
      desc: typeof m.desc === "string" ? m.desc.slice(0, 5000) : "",
      color: /^#[0-9a-fA-F]{6}$/.test(m.color || "") ? m.color : "#c9a227"
    });
  }

  const cleanRoads = [];
  if (Array.isArray(data.roads)) {
    for (const r of data.roads) {
      if (!r || typeof r !== "object") continue;
      if (!Array.isArray(r.points) || r.points.length < 2) continue;
      const pts = r.points
        .map(p => ({ x: parseCoord(p && p.x), y: parseCoord(p && p.y) }))
        .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
        .map(p => ({ x: roundCoord(p.x), y: roundCoord(p.y) }));
      if (pts.length < 2) continue;
      const id = Number.isFinite(Number(r.id)) && Number(r.id) > 0 ? Math.floor(Number(r.id)) : null;
      const weeks = Number.isFinite(Number(r.weeks)) && Number(r.weeks) > 0 ? Math.floor(Number(r.weeks)) : 1;
      cleanRoads.push({ id, weeks, points: pts });
    }
  }

  const scale = sanitizeScale(data.scale);
  const hasTypeIcons = Boolean(data.typeIcons && typeof data.typeIcons === "object");
  const typeIcons = sanitizeTypeIcons(data.typeIcons);

  return { ok: true, clean: { markers: cleanMarkers, scale, roads: cleanRoads, typeIcons, hasTypeIcons } };
}

function applyImport() {
  if (!pendingImport) return;
  const mode = $("importMode").value;
  ensureDraft();

  if (mode === "replace") {
    draft.markers = normalizeMarkers(pendingImport.markers);
    draft.nextId = computeNextId(draft.markers);

    draft.roads = normalizeRoads(pendingImport.roads);
    draft.nextRoadId = computeNextId(draft.roads);

    draft.scale = sanitizeScale(pendingImport.scale);
    draft.typeIcons = sanitizeTypeIcons(pendingImport.typeIcons);
  } else {
    draft.markers = normalizeMarkers(draft.markers);
    const byId = new Map(draft.markers.map(m => [m.id, m]));
    let maxId = Math.max(Number(draft.nextId) || 1, computeNextId(draft.markers));
    pendingImport.markers.forEach(m => {
      let id = m.id;
      if (id == null || id <= 0 || !Number.isFinite(id)) {
        while (byId.has(maxId)) maxId++;
        id = maxId++;
      } else if (!byId.has(id) && id >= maxId) {
        maxId = id + 1;
      }
      const existing = byId.get(id);
      if (existing) {
        existing.type = m.type; existing.x = m.x; existing.y = m.y;
        existing.name = m.name; existing.desc = m.desc; existing.color = m.color;
      } else {
        const nm = { ...m, id };
        draft.markers.push(nm); byId.set(id, nm);
      }
    });
    draft.nextId = Math.max(maxId, computeNextId(draft.markers));

    draft.roads = normalizeRoads(draft.roads);
    const byIdR = new Map(draft.roads.map(r => [r.id, r]));
    let maxR = Math.max(Number(draft.nextRoadId) || 1, computeNextId(draft.roads));
    pendingImport.roads.forEach(r => {
      let id = r.id;
      if (id == null || id <= 0 || !Number.isFinite(id)) {
        while (byIdR.has(maxR)) maxR++;
        id = maxR++;
      } else if (!byIdR.has(id) && id >= maxR) {
        maxR = id + 1;
      }
      const existing = byIdR.get(id);
      if (existing) {
        existing.weeks = r.weeks;
        existing.points = r.points.map(p => ({ x: p.x, y: p.y }));
      } else {
        const nr = { ...r, id, points: r.points.map(p => ({ x: p.x, y: p.y })) };
        draft.roads.push(nr); byIdR.set(id, nr);
      }
    });
    draft.nextRoadId = Math.max(maxR, computeNextId(draft.roads));

    if (pendingImport.scale.refPx) draft.scale = sanitizeScale(pendingImport.scale);
    if (pendingImport.hasTypeIcons) draft.typeIcons = sanitizeTypeIcons(pendingImport.typeIcons);
  }

  refreshTypeIconUI();
  drawRoads();
  drawMeasure();
  markDirty();
  closeImport();
  setHint(`Импорт (${mode === "replace" ? "замена" : "слияние"}) загружен в черновик. Нажмите «💾 Сохранить».`);
  setTimeout(() => setHint(""), 3000);
}

function closeImport() {
  $("importOverlay").classList.remove("show");
  pendingImport = null;
}
