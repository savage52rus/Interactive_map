function setEditMode(mode) {
  editMode = mode;
  const viewport = $("viewport");
  if (mode === "place") {
    viewport.classList.remove("move-mode");
    setHint(placingType ? "Кликните по карте, чтобы поставить: " + TYPES[placingType].label
                        : "Режим размещения: выберите тип в палитре");
  } else if (mode === "move") {
    viewport.classList.add("move-mode");
    placingType = null;
    $("adminPalette").querySelectorAll(".pal-item").forEach(x => x.classList.remove("active"));
    setHint("Перетаскивайте маркеры мышью или пальцем");
  } else if (mode === "road") {
    viewport.classList.remove("move-mode");
    placingType = null;
    $("adminPalette").querySelectorAll(".pal-item").forEach(x => x.classList.remove("active"));
    if (!roadDraft && !roadEditing) {
      setHint("Кликните по карте, чтобы добавить точку дороги. Двойной клик / Enter — завершить.");
    }
  } else {
    viewport.classList.remove("move-mode");
    placingType = null;
    $("adminPalette").querySelectorAll(".pal-item").forEach(x => x.classList.remove("active"));
    setHint("");
    if (typeof roadDraft !== "undefined") roadDraft = null;
    if (typeof roadEditing !== "undefined") roadEditing = null;
    if (typeof drawRoads === "function") drawRoads();
  }
  $("modePlaceBtn").classList.toggle("mode-on", mode === "place");
  $("modeMoveBtn").classList.toggle("mode-on", mode === "move");
  const rb = $("modeRoadBtn");
  if (rb) rb.classList.toggle("mode-on", mode === "road");
  updateModeLabel();
}

function updateModeLabel() {
  const name =
    editMode === "place" ? "размещение" :
    editMode === "move"  ? "перетаскивание" :
    editMode === "road"  ? "дорога" :
    "просмотр";
  $("abModeLabel").innerHTML = "Режим: <b>" + name + "</b>";
}

function toggleAdminMode() {
  if (!isAdmin) return;
  
  if (adminMode) {
    if (hasUnsaved) {
      if (!confirm("Есть несохранённые изменения. Выйти без сохранения?")) {
        return; 
      }
    }
    adminMode = false;
    $("adminBar").classList.remove("show");
    setEditMode("view");
    setHint("");
    draft = null; clearDirty(); renderMarkers(); drawRoads();
  } else {
    adminMode = true;
    $("adminBar").classList.add("show");
    drawRoads();
  }
}

function exitAdmin() {
  if (hasUnsaved) {
    if (!confirm("Есть несохранённые изменения. Выйти без сохранения?")) return;
  }
  draft = null; clearDirty();
  isAdmin = false; adminMode = false;
  $("adminBar").classList.remove("show");
  setEditMode("view");
  renderMarkers();
  drawRoads();
}