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
  if (!bar) return;
  bar.classList.toggle("dirty", hasUnsaved);
  $("adminSaveBtn").disabled = !hasUnsaved;
  $("adminRevertBtn").disabled = !hasUnsaved;
}

async function applyDraft() {
  if (!draft) return;
  const saveBtn = $("adminSaveBtn");
  const oldText = saveBtn.textContent;
  saveBtn.textContent = "⏳ Сохранение...";
  saveBtn.disabled = true;

  try {
    // 1. Находим удаленные объекты
    const draftMarkerIds = new Set(draft.markers.map(m => m.id));
    const draftRoadIds = new Set(draft.roads.map(r => r.id));
    
    const deletedMarkers = state.markers.filter(m => !draftMarkerIds.has(m.id));
    const deletedRoads = state.roads.filter(r => !draftRoadIds.has(r.id));

    let errors = [];

    // 2. Удаляем с сервера то, что стерли
    for (const m of deletedMarkers) {
      const res = await apiDeleteMarker(m.id);
      if (res.status !== "ok") errors.push("Не удалось удалить маркер " + m.id);
    }
    for (const r of deletedRoads) {
      const res = await apiDeleteRoad(r.id);
      if (res.status !== "ok") errors.push("Не удалось удалить дорогу " + r.id);
    }

    // 3. Сохраняем/обновляем текущие
    for (const m of draft.markers) {
      const res = await apiUpsertMarker(m);
      if (res.status !== "ok") errors.push("Не удалось сохранить маркер " + m.id);
    }
    for (const r of draft.roads) {
      const res = await apiUpsertRoad(r);
      if (res.status !== "ok") errors.push("Не удалось сохранить дорогу " + r.id);
    }

    if (errors.length > 0) {
      if (!confirm("Были ошибки при синхронизации:\n" + errors.join("\n") + "\n\nПрименить локально?")) {
        saveBtn.textContent = oldText;
        saveBtn.disabled = false;
        return;
      }
    }

    // 4. Применяем локально
    state.markers = JSON.parse(JSON.stringify(draft.markers));
    state.roads = JSON.parse(JSON.stringify(draft.roads));
    state.scale = JSON.parse(JSON.stringify(draft.scale));
    state.nextId = draft.nextId;
    state.nextRoadId = draft.nextRoadId;
    persistState();
    
    draft = null;
    clearDirty();
    renderMarkers();
    drawRoads();
    drawMeasure();
    scheduleAutosaveSnapshot("save");
    
    setHint("Успешно сохранено на сервере!");
    setTimeout(() => setHint(""), 3000);

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
  draft = null;
  clearDirty();
  renderMarkers();
  drawRoads();
  drawMeasure();
}