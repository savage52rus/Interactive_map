let editingId = null;
let pendingNewMarker = null;

function openEdit(m, isNew = false) {
  if (!m) return;
  const typeSel = $("editType");
  typeSel.innerHTML = Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join("");
  typeSel.value = TYPES[m.type] ? m.type : "poi";

  if (isNew) {
    editingId = null;
    pendingNewMarker = {
      type: TYPES[m.type] ? m.type : "poi",
      x: roundCoord(Number(m.x) || 0),
      y: roundCoord(Number(m.y) || 0),
      name: m.name || "",
      desc: m.desc || "",
      color: m.color || "#c9a227"
    };
    $("editModalTitle").textContent = "Создание маркера";
    $("editDelete").style.display = "none";
  } else {
    editingId = m.id;
    pendingNewMarker = null;
    $("editModalTitle").textContent = "Редактирование маркера";
    $("editDelete").style.display = "";
  }

  $("editName").value = m.name || "";
  $("editDesc").value = m.desc || "";
  $("editColor").value = /^#[0-9a-fA-F]{6}$/.test(m.color || "") ? m.color : "#c9a227";
  $("editOverlay").classList.add("show");
  setTimeout(() => $("editName").focus(), 50);
}

function closeEdit() {
  $("editOverlay").classList.remove("show");
  editingId = null;
  pendingNewMarker = null;
}

function saveEdit() {
  ensureDraft();
  draft.markers = normalizeMarkers(draft.markers);

  const type = TYPES[$("editType").value] ? $("editType").value : "poi";
  const name = $("editName").value.trim() || (TYPES[type] ? TYPES[type].label : "Без названия");
  const desc = $("editDesc").value;
  const color = /^#[0-9a-fA-F]{6}$/.test($("editColor").value) ? $("editColor").value : "#c9a227";

  if (pendingNewMarker) {
    draft.nextId = Math.max(Number(draft.nextId) || 1, computeNextId(draft.markers));
    const newId = draft.nextId++;
    draft.markers.push({
      id: newId,
      type,
      x: roundCoord(Number(pendingNewMarker.x) || 0),
      y: roundCoord(Number(pendingNewMarker.y) || 0),
      name,
      desc,
      color
    });
  } else {
    const m = draft.markers.find(x => x.id === editingId);
    if (!m) { closeEdit(); return; }
    m.type = type;
    m.name = name;
    m.desc = desc;
    m.color = color;
    if (!(parseInt(m.id, 10) > 0)) {
      draft.nextId = Math.max(Number(draft.nextId) || 1, computeNextId(draft.markers));
      m.id = draft.nextId++;
    }
  }

  renderMarkers();
  markDirty();
  closeEdit();
}

function deleteEdit() {
  if (editingId == null) { closeEdit(); return; }
  if (!confirm("Удалить маркер? (изменение попадёт в черновик)")) return;
  ensureDraft();
  draft.markers = draft.markers.filter(x => x.id !== editingId);
  if (activePopupMarker && activePopupMarker.id === editingId) closePopup();
  renderMarkers();
  markDirty();
  closeEdit();
}
