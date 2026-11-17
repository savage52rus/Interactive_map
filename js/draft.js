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

function applyDraft() {
  if (!draft) return;
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