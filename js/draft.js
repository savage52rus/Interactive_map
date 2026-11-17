let draft = null;
let hasUnsaved = false;

function cloneState() { return JSON.parse(JSON.stringify(state)); }
function ensureDraft() { if (!draft) draft = cloneState(); return draft; }

function draftMarkers() { return draft ? draft.markers : state.markers; }
function draftRoads()   { return draft ? draft.roads   : state.roads; }
function draftScale()   { return draft ? draft.scale   : state.scale; }

function markDirty() { hasUnsaved = true; updateAdminButtons(); }
function clearDirty() { hasUnsaved = false; updateAdminButtons(); }

function updateAdminButtons() {
  const bar = $("adminBar");
  bar.classList.toggle("dirty", hasUnsaved);
  $("adminSaveBtn").disabled = !hasUnsaved;
  $("adminRevertBtn").disabled = !hasUnsaved;
}

async function applyDraft() {
  if (!draft) return;
  // Отправляем на сервер все маркеры, которых коснулись изменения,
  // проще: отправляем все маркеры по одному (для небольшой карты это ок).
  // На больших картах лучше отправлять только изменённые.
  let ok = true;
  for (const m of draft.markers) {
    const res = await apiUpsertMarker(m);
    if (res.status !== "ok") { ok = false; console.error("upsert failed:", m, res); }
  }
  if (!ok) {
    if (!confirm("Не все маркеры удалось отправить на сервер. Применить локально?")) return;
  }
  state.markers = draft.markers;
  state.roads = draft.roads;
  state.scale = draft.scale;
  state.nextId = draft.nextId;
  state.nextRoadId = draft.nextRoadId;
  persistState();
  draft = null;
  clearDirty();
  renderMarkers();
  drawRoads();
  drawMeasure();
  scheduleAutosaveSnapshot("save");
}

function revertDraft() {
  if (!hasUnsaved) return;
  if (!confirm("Отменить все несохранённые изменения?")) return;
  draft = null;
  clearDirty();
  renderMarkers();
  drawRoads();
  drawMeasure();
}
