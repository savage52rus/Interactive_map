let pendingImport = null;

function exportJSON() {
  const src = draft ? draft : state;
  const payload = {
    app: "fantasy-map",
    version: CONFIG.EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    scale: src.scale,
    nextId: src.nextId,
    markers: src.markers
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
  const curIds = new Set(cur.markers.map(m => m.id));
  let updCount = 0;
  pendingImport.markers.forEach(m => { if (m.id != null && curIds.has(m.id)) updCount++; });
  const addCount = pendingImport.markers.length - updCount;

  $("importInfo").innerHTML = `Файл: <b>${escapeHtml(fileName)}</b><br>
    Маркеров в файле: <b>${pendingImport.markers.length}</b><br>
    Масштаб: ${pendingImport.scale.refPx ? "задан" : "не задан"}<br>
    <span class="hint">Сейчас на карте: ${cur.markers.length} марк. (совпадений по id: ${updCount}, новых: ${addCount})</span>`;
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
    : "Замена: текущие данные полностью замещаются данными из файла.";
}

function validateImport(data) {
  if (!data || typeof data !== "object") return { ok: false, error: "ожидался объект" };
  if (!Array.isArray(data.markers)) return { ok: false, error: "поле markers отсутствует или не массив" };

  const cleanMarkers = [];
  for (const m of data.markers) {
    if (!m || typeof m !== "object") continue;
    const type = TYPES[m.type] ? m.type : "poi";
    const x = Number(m.x), y = Number(m.y);
    if (!isFinite(x) || !isFinite(y)) continue;
    const id = Number.isFinite(Number(m.id)) && Number(m.id) > 0 ? Math.floor(Number(m.id)) : null;
    cleanMarkers.push({
      id, type, x, y,
      name: typeof m.name === "string" && m.name.trim() ? m.name.trim().slice(0, 200) : TYPES[type].label,
      desc: typeof m.desc === "string" ? m.desc.slice(0, 5000) : "",
      color: /^#[0-9a-fA-F]{6}$/.test(m.color || "") ? m.color : "#c9a227"
    });
  }

  let scale = { walk: CONFIG.DEFAULT_WALK, cart: CONFIG.DEFAULT_CART };
  if (data.scale && typeof data.scale === "object") {
    const w = Number(data.scale.walk), c = Number(data.scale.cart), r = Number(data.scale.refPx);
    if (isFinite(w) && w > 0) scale.walk = w;
    if (isFinite(c) && c > 0) scale.cart = c;
    if (isFinite(r) && r > 0) scale.refPx = r;
  }
  return { ok: true, clean: { markers: cleanMarkers, scale } };
}

function applyImport() {
  if (!pendingImport) return;
  const mode = $("importMode").value;
  ensureDraft();

  if (mode === "replace") {
    const used = new Set(); let next = 1;
    draft.markers = pendingImport.markers.map(m => {
      while (used.has(next)) next++;
      const id = next++; used.add(id);
      return { ...m, id };
    });
    draft.nextId = next;
    draft.scale = { ...pendingImport.scale };
  } else {
    const byId = new Map(draft.markers.map(m => [m.id, m]));
    let maxId = draft.nextId || 1;
    pendingImport.markers.forEach(m => {
      let id = m.id;
      if (id == null || id <= 0 || !Number.isFinite(id)) id = maxId++;
      else if (!byId.has(id) && id >= maxId) maxId = id + 1;
      const existing = byId.get(id);
      if (existing) {
        existing.type = m.type; existing.x = m.x; existing.y = m.y;
        existing.name = m.name; existing.desc = m.desc; existing.color = m.color;
      } else {
        const nm = { ...m, id };
        draft.markers.push(nm); byId.set(id, nm);
      }
    });
    draft.nextId = maxId;
    if (pendingImport.scale.refPx) draft.scale = { ...pendingImport.scale };
  }

  renderMarkers(); drawMeasure(); markDirty(); closeImport();
  setHint(`Импорт (${mode === "replace" ? "замена" : "слияние"}) загружен в черновик. Нажмите «💾 Сохранить».`);
  setTimeout(() => setHint(""), 3000);
}

function closeImport() {
  $("importOverlay").classList.remove("show");
  pendingImport = null;
}
