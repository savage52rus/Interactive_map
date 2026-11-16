function showScaleOverlay() {
  $("scaleOverlay").classList.add("show");
  scalePickMode = true;
  scalePickPts = [];
  updateScalePickInfo();
  const sc = draftScale();
  $("scaleWalk").value = sc.walk || CONFIG.DEFAULT_WALK;
  $("scaleCart").value = sc.cart || CONFIG.DEFAULT_CART;
  setHint("Кликните по карте в двух точках с известным расстоянием");
}

function updateScalePickInfo() {
  const info = $("scalePickInfo");
  const saveBtn = $("scaleSave");
  if (scalePickPts.length < 2) {
    info.textContent = `Точки: выбрано ${scalePickPts.length} из 2`;
    saveBtn.disabled = true;
  } else {
    info.textContent = "Две точки выбраны. Укажите известное расстояние и сохраните.";
    saveBtn.disabled = false;
  }
}

function saveScale() {
  if (scalePickPts.length < 2) return;
  const [a, b] = scalePickPts;
  const px = Math.hypot(b.x - a.x, b.y - a.y);
  const walk = parseFloat($("scaleWalk").value);
  const cart = parseFloat($("scaleCart").value);
  if (!(walk > 0) || !(cart > 0)) { alert("Введите положительные значения."); return; }
  const newScale = { walk, cart, refPx: px };
  if (isAdmin && adminMode) {
    ensureDraft(); draft.scale = newScale; markDirty();
  } else {
    state.scale = newScale; persistState();
  }
  $("scaleOverlay").classList.remove("show");
  scalePickMode = false; scalePickPts = [];
  drawMeasure(); setHint("");
}
