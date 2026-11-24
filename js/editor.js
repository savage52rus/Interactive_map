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

function saveEdit() {
  ensureDraft();
  const m = draft.markers.find(x => x.id === editingId);
  if (!m) { closeEdit(); return; }

  m.type = $("editType").value;
  m.name = $("editName").value.trim() || (TYPES[m.type] ? TYPES[m.type].label : "Без названия");
  m.desc = $("editDesc").value;
  m.color = $("editColor").value;

  if (!m.id || isNaN(m.id)) m.id = Date.now();

  renderMarkers();
  markDirty();  // <-- Помечаем, что есть несохранённые изменения
  closeEdit();
}

function deleteEdit() {
  if (!confirm("Удалить маркер? (изменение попадёт в черновик)")) return;
  ensureDraft();
  draft.markers = draft.markers.filter(x => x.id !== editingId);
  renderMarkers();
  markDirty();  // <-- Не шлем на сервер
  closeEdit();
}