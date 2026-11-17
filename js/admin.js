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
  } else if (mode === "curve") {
    viewport.classList.remove("move-mode");
    placingType = null;
    $("adminPalette").querySelectorAll(".pal-item").forEach(x => x.classList.remove("active"));
    if (!curveDraft && !curveEditing) {
      setHint("Кликните по карте, чтобы добавить точку кривой. Двойной клик / Enter — завершить.");
    }
  } else {
    viewport.classList.remove("move-mode");
    placingType = null;
    $("adminPalette").querySelectorAll(".pal-item").forEach(x => x.classList.remove("active"));
    setHint("");
    // выход из режима кривой — отменить черновики
    if (typeof curveDraft !== "undefined") curveDraft = null;
    if (typeof curveEditing !== "undefined") curveEditing = null;
    if (typeof drawCurves === "function") drawCurves();
  }
  $("modePlaceBtn").classList.toggle("mode-on", mode === "place");
  $("modeMoveBtn").classList.toggle("mode-on", mode === "move");
  const cb = $("modeCurveBtn");
  if (cb) cb.classList.toggle("mode-on", mode === "curve");
  updateModeLabel();
}

function updateModeLabel() {
  const name =
    editMode === "place" ? "размещение" :
    editMode === "move"  ? "перетаскивание" :
    editMode === "curve" ? "кривая" :
    "просмотр";
  $("abModeLabel").innerHTML = "Режим: <b>" + name + "</b>";
}

function toggleAdminMode() {
  if (!isAdmin) return;
  adminMode = !adminMode;
  $("adminBar").classList.toggle("show", adminMode);
  if (!adminMode) {
    setEditMode("view");
    setHint("");
    if (hasUnsaved && !confirm("Есть несохранённые изменения. Выйти без сохранения?")) {
      adminMode = true; $("adminBar").classList.add("show"); return;
    }
    draft = null; clearDirty(); renderMarkers();
  }
}

function exitAdmin() {
  if (hasUnsaved && !confirm("Есть несохранённые изменения. Выйти без сохранения?")) return;
  draft = null; clearDirty();
  isAdmin = false; adminMode = false;
  $("adminBar").classList.remove("show");
  setEditMode("view");
  renderMarkers();
}
