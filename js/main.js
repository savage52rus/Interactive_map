let initialSyncPromise = null;

function init() {
  loadState();
  buildLegend();
  buildAdminPalette();
  buildAdminIconPicker();
  setupIconPickerToggle();
  updateAdminButtons();
  updateModeLabel();
  updateAutosaveUI();

  // Настраиваем управление и UI сразу, не дожидаясь ответа сервера
  $("zoomIn").onclick  = () => zoomAt(1.3);
  $("zoomOut").onclick = () => zoomAt(1 / 1.3);
  $("legendBtn").onclick = () => $("legendPanel").classList.toggle("show");

  if (CONFIG.RULER_ENABLED) {
    $("rulerBtn").onclick = toggleRuler;
  } else {
    const rb = $("rulerBtn");
    if (rb) rb.style.display = "none";
    rulerMode = false;
    scalePickMode = false;
    measurePoints = [];
    scalePickPts = [];
  }

  $("adminBtn").onclick = () => {
    if (window.innerWidth < CONFIG.MIN_ADMIN_WIDTH) {
      alert("Админ-панель доступна только с компьютера (ширина окна не менее " + CONFIG.MIN_ADMIN_WIDTH + "px).");
      return;
    }
    if (isAdmin) toggleAdminMode(); else openLogin();
  };
  $("loginCancel").onclick = closeLogin;
  $("loginSubmit").onclick = tryLogin;
  $("loginUser").addEventListener("keydown", e => { if (e.key === "Enter") $("loginPass").focus(); });
  $("loginPass").addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });

  $("adminExit").onclick = exitAdmin;
  $("adminSaveBtn").onclick = applyDraft;
  $("adminRevertBtn").onclick = revertDraft;
  $("modePlaceBtn").onclick = () => setEditMode("place");
  $("modeMoveBtn").onclick = () => setEditMode("move");
  $("modeRoadBtn").onclick = () => {
    if (roadDraft || roadEditing) {
      roadDraft = null;
      roadEditing = null;
      setEditMode("view");
      drawRoads();
    } else {
      startNewRoad();
    }
  };

  $("editCancel").onclick = closeEdit;
  $("editSave").onclick = saveEdit;
  $("editDelete").onclick = deleteEdit;

  $("scaleCancel").onclick = cancelScaleOverlay;
  $("scaleSave").onclick = saveScale;

  $("mpClose").onclick = closePopup;
  document.addEventListener("pointerdown", e => {
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

  window.addEventListener("resize", () => {
    if (typeof updatePopupPosition === "function") updatePopupPosition();
  });

  window.addEventListener("beforeunload", e => {
    if (hasUnsaved) { e.preventDefault(); e.returnValue = ""; }
  });

  // Загружаем изображение карты параллельно с запросом данных
  const mapImg = $("mapImg");
  const loader = $("mapLoader");
  let triedFallbackImg = false;

  if (loader) loader.classList.add("show");

  mapImg.onload = () => {
    if (loader) loader.classList.remove("show");
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
    drawMeasure();
  };

  mapImg.onerror = () => {
    if (!triedFallbackImg && CONFIG.MAP_FALLBACK_SRC && CONFIG.MAP_FALLBACK_SRC !== CONFIG.MAP_SRC) {
      triedFallbackImg = true;
      mapImg.src = CONFIG.MAP_FALLBACK_SRC;
      return;
    }
    if (loader) loader.classList.remove("show");
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
    ctx.fillText("Карта мира (проверьте " + (CONFIG.MAP_FALLBACK_SRC || CONFIG.MAP_SRC) + ")", 800, 450);
    mapImg.src = c.toDataURL();
  };

  mapImg.src = CONFIG.MAP_SRC;

  // Асинхронная синхронизация с сервером в фоне (не блокируя рендер карты)
  initialSyncPromise = apiFetchAll().then(remote => {
    initialSyncPromise = null;
    if (remote) {
      if (remote.apiVersion < 3 && Array.isArray(state.markers) && state.markers.length > 0) {
        // Если серверный скрипт ещё не возвращает колонку icon, сохраняем локально выбранные иконки по id
        const localIconById = new Map(state.markers.filter(m => m.icon).map(m => [m.id, m.icon]));
        remote.markers.forEach(rm => {
          if (!rm.icon && localIconById.has(rm.id)) {
            rm.icon = localIconById.get(rm.id);
          }
        });
      }
      state.markers = remote.markers;
      state.roads = remote.roads;
      if (remote.scale) state.scale = remote.scale;
      if (remote.typeIcons) state.typeIcons = remote.typeIcons;
      state.nextId = computeNextId(state.markers);
      state.nextRoadId = computeNextId(state.roads);
      persistState();

      const dragging = (typeof isDraggingMarker === "function") && isDraggingMarker();
      if (draft && !hasUnsaved && !dragging) {
        draft = cloneState();
      }
      if (!hasUnsaved && !dragging) {
        buildLegend();
        buildAdminPalette();
        buildAdminIconPicker();
        if (imgSize.w > 0) {
          renderMarkers();
          drawRoads();
          drawMeasure();
        }
      }
    } else {
      setHint("Сервер недоступен — показаны локально сохранённые данные");
      setTimeout(() => setHint(""), 3500);
    }
    return remote;
  });
}

init();
