let draft = null;
let hasUnsaved = false;

function cloneState() { return JSON.parse(JSON.stringify(state)); }
function ensureDraft() { if (!draft) draft = cloneState(); return draft; }

function draftMarkers() { return draft ? draft.markers : state.markers; }
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
  state.scale = draft.scale;
  state.nextId = draft.nextId;
  persistState();
  draft = null;
  clearDirty();
  renderMarkers();
  drawMeasure();
  scheduleAutosaveSnapshot("save");
}

function revertDraft() {
  if (!hasUnsaved) return;
  if (!confirm("Отменить все несохранённые изменения?")) return;
  draft = null;
  clearDirty();
  renderMarkers();
  drawMeasure();
}

function applyDraft() {
  if (!draft) return;
  state.markers = draft.markers;
  state.curves = draft.curves;
  state.nextId = draft.nextId;
  state.nextCurveId = draft.nextCurveId;
  state.scale = draft.scale;
  persistState();
  draft = null;
  clearDirty();
  renderMarkers();
  drawCurves();       // ← новое
  drawMeasure();
  scheduleAutosaveSnapshot("save");
}
