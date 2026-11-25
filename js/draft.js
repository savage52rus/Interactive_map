let draft = null;
let hasUnsaved = false;

function cloneState() {
  const copy = JSON.parse(JSON.stringify(state));
  copy.markers = normalizeMarkers(copy.markers);
  copy.roads = normalizeRoads(copy.roads);
  copy.nextId = Math.max(Number(copy.nextId) || 1, computeNextId(copy.markers));
  copy.nextRoadId = Math.max(Number(copy.nextRoadId) || 1, computeNextId(copy.roads));
  return copy;
}

function ensureDraft() {
  if (!draft) draft = cloneState();
  return draft;
}

function draftMarkers()   { return draft ? draft.markers   : state.markers; }
function draftRoads()     { return draft ? draft.roads     : state.roads; }
function draftScale()     { return draft ? draft.scale     : state.scale; }
function draftTypeIcons() { return (draft && draft.typeIcons) ? draft.typeIcons : state.typeIcons; }

function markDirty() { hasUnsaved = true; updateAdminButtons(); }
function clearDirty() { hasUnsaved = false; updateAdminButtons(); }

function updateAdminButtons() {
  const bar = $("adminBar");
  if (!bar) return;
  bar.classList.toggle("dirty", hasUnsaved);
  $("adminSaveBtn").disabled = !hasUnsaved;
  $("adminRevertBtn").disabled = !hasUnsaved;
}

function isMarkerEqual(a, b) {
  if (!a || !b) return false;
  return Number(a.id) === Number(b.id) &&
    a.type === b.type &&
    roundCoord(Number(a.x)) === roundCoord(Number(b.x)) &&
    roundCoord(Number(a.y)) === roundCoord(Number(b.y)) &&
    String(a.name || "") === String(b.name || "") &&
    String(a.desc || "") === String(b.desc || "") &&
    String(a.color || "") === String(b.color || "");
}

function isRoadEqual(a, b) {
  if (!a || !b) return false;
  if (Number(a.id) !== Number(b.id) || Number(a.weeks) !== Number(b.weeks)) return false;
  const pa = a.points || [];
  const pb = b.points || [];
  if (pa.length !== pb.length) return false;
  for (let i = 0; i < pa.length; i++) {
    if (roundCoord(Number(pa[i].x)) !== roundCoord(Number(pb[i].x)) ||
        roundCoord(Number(pa[i].y)) !== roundCoord(Number(pb[i].y))) return false;
  }
  return true;
}

function isScaleEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return Number(a.walk) === Number(b.walk) &&
    Number(a.cart) === Number(b.cart) &&
    Number(a.refPx || 0) === Number(b.refPx || 0);
}

function isTypeIconsEqual(a, b) {
  const sa = sanitizeTypeIcons(a);
  const sb = sanitizeTypeIcons(b);
  return Object.keys(TYPES).every(k => sa[k] === sb[k]);
}

async function applyDraft() {
  if (!draft) return;
  const saveBtn = $("adminSaveBtn");
  const oldText = saveBtn.textContent;
  saveBtn.textContent = "⏳ Сохранение...";
  saveBtn.disabled = true;

  try {
    draft.markers = normalizeMarkers(draft.markers);
    draft.roads = normalizeRoads(draft.roads);

    const stateMarkerMap = new Map(state.markers.map(m => [m.id, m]));
    const stateRoadMap = new Map(state.roads.map(r => [r.id, r]));
    const draftMarkerIds = new Set(draft.markers.map(m => m.id));
    const draftRoadIds = new Set(draft.roads.map(r => r.id));

    const deletedMarkerIds = state.markers.filter(m => !draftMarkerIds.has(m.id)).map(m => m.id);
    const deletedRoadIds = state.roads.filter(r => !draftRoadIds.has(r.id)).map(r => r.id);

    const upsertedMarkers = draft.markers.filter(m => !isMarkerEqual(m, stateMarkerMap.get(m.id)));
    const upsertedRoads = draft.roads.filter(r => !isRoadEqual(r, stateRoadMap.get(r.id)));
    const scaleChanged = !isScaleEqual(draft.scale, state.scale);
    const typeIconsChanged = !isTypeIconsEqual(draft.typeIcons, state.typeIcons);

    const syncRes = await apiSyncChanges({
      deletedMarkerIds,
      upsertedMarkers,
      allMarkers: draft.markers,
      deletedRoadIds,
      upsertedRoads,
      allRoads: draft.roads,
      scale: scaleChanged ? draft.scale : null,
      typeIcons: typeIconsChanged ? sanitizeTypeIcons(draft.typeIcons) : null
    });

    if (!syncRes.ok) {
      if (!confirm("Были ошибки при синхронизации:\n" + syncRes.errors.join("\n") + "\n\nПрименить локально?")) {
        return;
      }
    }

    state.markers = normalizeMarkers(draft.markers);
    state.roads = normalizeRoads(draft.roads);
    state.scale = sanitizeScale(draft.scale);
    state.typeIcons = sanitizeTypeIcons(draft.typeIcons);
    state.nextId = Math.max(Number(draft.nextId) || 1, computeNextId(state.markers));
    state.nextRoadId = Math.max(Number(draft.nextRoadId) || 1, computeNextId(state.roads));
    persistState();

    draft = null;
    clearDirty();
    refreshTypeIconUI();
    drawRoads();
    drawMeasure();
    scheduleAutosaveSnapshot("save");

    if (syncRes.usedLegacyApi && (typeIconsChanged || scaleChanged)) {
      setHint("Сохранено! (Обновите код Apps Script для синхронизации настроек между устройствами)");
      setTimeout(() => setHint(""), 4500);
    } else {
      setHint("Успешно сохранено!");
      setTimeout(() => setHint(""), 3000);
    }

  } catch (err) {
    console.error(err);
    alert("Критическая ошибка при сохранении: " + err.message);
  } finally {
    saveBtn.textContent = oldText;
    updateAdminButtons();
  }
}

function revertDraft() {
  if (!hasUnsaved) return;
  if (!confirm("Отменить все несохранённые изменения?")) return;
  if (typeof resetMarkerDrag === "function") resetMarkerDrag();
  draft = null;
  if (typeof roadDraft !== "undefined") roadDraft = null;
  if (typeof roadEditing !== "undefined") roadEditing = null;
  clearDirty();
  refreshTypeIconUI();
  drawRoads();
  drawMeasure();
}
