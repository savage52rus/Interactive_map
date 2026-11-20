let editingId = null;

function openEdit(m) {
  editingId = m.id;
  const typeSel = $("editType");
  typeSel.innerHTML = Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join("");
  typeSel.value = m.type;
  $("editName").value = m.name;
  $("editDesc").value = m.desc || "";
  $("editColor").value = m.color || "#c9a227";
  $("editOverlay").classList.add("show");
}

function closeEdit() { $("editOverlay").classList.remove("show"); editingId = null; }

async function saveEdit() {
  ensureDraft();
  const m = draft.markers.find(x => x.id === editingId);
  if (!m) { closeEdit(); return; }

  // Считываем данные из формы
  m.type = $("editType").value;
  m.name = $("editName").value.trim() || (TYPES[m.type] ? TYPES[m.type].label : "Без названия");
  m.desc = $("editDesc").value;
  m.color = $("editColor").value;
  
  // НА ВСЯКИЙ СЛУЧАЙ проверяем, что id не потерялся
  if (!m.id) {
    m.id = draft.nextId++;
  }

  // Отправляем на сервер
  const result = await apiUpsertMarker(m);
  if (result.status !== "ok") {
    alert("Не удалось сохранить маркер на сервере: " + (result.message || "ошибка"));
    return;
  }

  // Обновляем локальное состояние
  state.markers = draft.markers;
  persistState();
  renderMarkers();
  draft = null;
  clearDirty();
  scheduleAutosaveSnapshot("save");
  closeEdit();
}

async function deleteEdit() {
  if (!confirm("Удалить маркер?")) return;
  ensureDraft();

  const result = await apiDeleteMarker(editingId);
  if (result.status !== "ok") {
    alert("Не удалось удалить маркер на сервере: " + (result.message || "ошибка"));
    return;
  }

  draft.markers = draft.markers.filter(x => x.id !== editingId);
  state.markers = draft.markers;
  persistState();
  renderMarkers();
  draft = null;
  clearDirty();
  scheduleAutosaveSnapshot("save");
  closeEdit();
}
