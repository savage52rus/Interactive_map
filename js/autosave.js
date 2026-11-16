let autosaveTimer = null;

function loadAutosaves() {
  try {
    const raw = localStorage.getItem(CONFIG.AUTOSAVE_KEY);
    if (!raw) return [];
    const d = JSON.parse(raw);
    return Array.isArray(d.snapshots) ? d.snapshots : [];
  } catch { return []; }
}

function saveAutosaves(list) {
  try {
    localStorage.setItem(CONFIG.AUTOSAVE_KEY, JSON.stringify({ snapshots: list.slice(0, CONFIG.AUTOSAVE_MAX) }));
  } catch (e) { console.warn("autosave", e); }
}

function makeSnapshot(reason) {
  const src = draft ? draft : state;
  return {
    at: new Date().toISOString(),
    reason: reason || "auto",
    scale: JSON.parse(JSON.stringify(src.scale)),
    nextId: src.nextId,
    markers: JSON.parse(JSON.stringify(src.markers)),
    markerCount: src.markers.length
  };
}

function scheduleAutosaveSnapshot(reason) {
  const snap = makeSnapshot(reason);
  const list = loadAutosaves();
  list.unshift(snap);
  saveAutosaves(list);
  updateAutosaveUI();
}

function startAutosaveTimer() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(() => scheduleAutosaveSnapshot("auto"), CONFIG.AUTOSAVE_INTERVAL_MS);
}

function updateAutosaveUI() {
  const list = loadAutosaves();
  const el = $("autosaveInfo");
  if (!el) return;
  if (!list.length) { el.innerHTML = "Автосохранение: <b>—</b>"; return; }
  const d = new Date(list[0].at);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  el.innerHTML = `Автосохранение: <b>${hh}:${mm}:${ss}</b> (${list[0].markerCount} марк.)`;
}

function downloadAutosave() {
  const list = loadAutosaves();
  if (!list.length) { alert("Автосохранений пока нет."); return; }
  const snap = list[0];
  const payload = {
    app: "fantasy-map-autosave",
    version: CONFIG.EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    snapshotAt: snap.at,
    reason: snap.reason,
    scale: snap.scale,
    nextId: snap.nextId,
    markers: snap.markers
  };
  downloadBlob(JSON.stringify(payload, null, 2),
    `fantasy-map-autosave-${snap.at.slice(0, 19).replace(/[:T]/g, "-")}.json`);
}

function openRestoreAutosave() {
  const list = loadAutosaves();
  if (!list.length) { alert("Автосохранений пока нет."); return; }
  const snap = list[0];
  const pretty = new Date(snap.at).toLocaleString("ru-RU");
  $("autosaveInfoModal").innerHTML = `Последний снимок: <b>${pretty}</b><br>
    Маркеров: <b>${snap.markerCount}</b><br>
    <span class="hint">Данные будут загружены в <b>черновик</b>. Их можно проверить и нажать «💾 Сохранить».</span>`;
  pendingAutosave = snap;
  $("autosaveOverlay").classList.add("show");
}

function applyRestoreAutosave() {
  if (!pendingAutosave) return;
  ensureDraft();
  draft.markers = JSON.parse(JSON.stringify(pendingAutosave.markers));
  draft.scale = JSON.parse(JSON.stringify(pendingAutosave.scale));
  draft.nextId = pendingAutosave.nextId || (Math.max(0, ...draft.markers.map(m => m.id)) + 1);
  renderMarkers();
  drawMeasure();
  markDirty();
  $("autosaveOverlay").classList.remove("show");
  pendingAutosave = null;
  setHint("Автосейв загружен в черновик. Нажмите «💾 Сохранить».");
  setTimeout(() => setHint(""), 3000);
}

function downloadBlob(text, filename) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
