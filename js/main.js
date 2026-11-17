function init() {
  loadState();
  buildLegend();
  buildAdminPalette();
  updateAdminButtons();
  updateModeLabel();
  updateAutosaveUI();
  startAutosaveTimer();

  const mapImg = $("mapImg");
  mapImg.onload = () => {
    imgSize.w = mapImg.naturalWidth;
    imgSize.h = mapImg.naturalHeight;
    $("measureSvg").setAttribute("width", imgSize.w);
    $("measureSvg").setAttribute("height", imgSize.h);
    $("roadsSvg").setAttribute("width", imgSize.w);
    $("roadsSvg").setAttribute("height", imgSize.h);
    $("roadsSvg").setAttribute("viewBox", `0 0 ${imgSize.w} ${imgSize.h}`);
    $("world").style.width = imgSize.w + "px";
    $("world").style.height = imgSize.h + "px";
    fitMap();
    renderMarkers();
    drawRoads();
  };
  mapImg.onerror = () => {
    const c = document.createElement("canvas");
    c.width = 1600; c.height = 900;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 1600, 900);
    g.addColorStop(0, "#2b2419"); g.addColorStop(1, "#14100b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1600, 900);
    ctx.strokeStyle = "#4a3f33"; ctx.lineWidth = 2;
    for (let x = 0; x <= 1600; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 900); ctx.stroke(); }
    for (let y = 0; y <= 900; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke(); }
    ctx.fillStyle = "#a89880"; ctx.font = "28px Georgia"; ctx.textAlign = "center";
    ctx.fillText("Карта мира (замените assets/map.jpg)", 800, 450);
    mapImg.src = c.toDataURL();
  };
  mapImg.src = CONFIG.MAP_SRC;

  // кнопки
  $("zoomIn").onclick  = () => zoomAt(1.3);
  $("zoomOut").onclick = () => zoomAt(1 / 1.3);
  $("legendBtn").onclick = () => $("legendPanel").classList.toggle("show");
  $("rulerBtn").onclick = toggleRuler;

  $("adminBtn").onclick = () => {
    if (window.innerWidth < CONFIG.MIN_ADMIN_WIDTH) {
      alert("Админ-панель доступна только с компьютера (ширина окна > " + CONFIG.MIN_ADMIN_WIDTH + "px).");
      return;
    }
    if (isAdmin) toggleAdminMode(); else openLogin();
  };
  $("loginCancel").onclick = closeLogin;
  $("loginSubmit").onclick = tryLogin;
  $("loginPass").addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });

  $("adminExit").onclick = exitAdmin;
  $("adminSaveBtn").onclick = applyDraft;
  $("adminRevertBtn").onclick = revertDraft;
  $("modePlaceBtn").onclick = () => setEditMode("place");
  $("modeMoveBtn").onclick = () => setEditMode("move");
  $("modeRoadBtn").onclick = () => {
    if (roadDraft || roadEditing) {
      roadDraft = null; roadEditing = null; setEditMode("view"); drawRoads();
    } else {
      startNewRoad();
    }
  };

  $("editCancel").onclick = closeEdit;
  $("editSave").onclick = saveEdit;
  $("editDelete").onclick = deleteEdit;

  $("scaleCancel").onclick = () => {
    $("scaleOverlay").classList.remove("show");
    scalePickMode = false; scalePickPts = []; drawMeasure();
  };
  $("scaleSave").onclick = saveScale;

  $("mpClose").onclick = closePopup;
  document.addEventListener("mousedown", e => {
    if (!$("markerPopup").contains(e.target) && !e.target.closest(".marker")) closePopup();
  });

  $("exportBtn").onclick = exportJSON;
  $("importBtn").onclick = () => $("importFile").click();
  $("importFile").addEventListener("change", onImportFileSelected);
  $("importCancel").onclick = closeImport;
  $("importApply").onclick = applyImport;
  $("importMode").addEventListener("change", updateImportModeHint);

  $("autoDownloadBtn").onclick = downloadAutosave;
  $("autoRestoreBtn").onclick = openRestoreAutosave;
  $("autosaveCancel").onclick = () => { $("autosaveOverlay").classList.remove("show"); pendingAutosave = null; };
  $("autosaveApply").onclick = applyRestoreAutosave;

  $("weeksConfirm").onclick = confirmWeeks;
  $("weeksCancel").onclick = cancelWeeks;
  $("weeksInput").addEventListener("keydown", e => { if (e.key === "Enter") confirmWeeks(); });

  ensureContextMenu();
  setupMapEvents();

  window.addEventListener("beforeunload", e => {
    if (hasUnsaved) { e.preventDefault(); e.returnValue = ""; }
  });
}

init();