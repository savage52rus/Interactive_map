let suppressClickUntil = 0;
let activeMarkerDragReset = null;
let markerDragActive = false;

function suppressNextClick(ms = 350) {
  suppressClickUntil = performance.now() + ms;
}

function consumeSuppressedClick() {
  if (performance.now() < suppressClickUntil) {
    suppressClickUntil = 0;
    return true;
  }
  return false;
}

function resetMarkerDrag() {
  if (typeof activeMarkerDragReset === "function") {
    activeMarkerDragReset();
  }
}

function isDraggingMarker() {
  return markerDragActive;
}

function applyTransform() {
  $("world").style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  if (typeof updatePopupPosition === "function") updatePopupPosition();
}

function fitMap() {
  const vw = $("viewport").clientWidth || window.innerWidth || 1280;
  const vh = $("viewport").clientHeight || window.innerHeight || 800;
  if (!imgSize.w || !imgSize.h) return;
  const s = Math.max(0.05, Math.min(vw / imgSize.w, vh / imgSize.h));
  view.scale = s;
  view.x = (vw - imgSize.w * s) / 2;
  view.y = (vh - imgSize.h * s) / 2;
  applyTransform();
}

function zoomAt(factor, cx, cy) {
  const curScale = (Number.isFinite(view.scale) && view.scale > 0) ? view.scale : 1;
  const newScale = Math.max(0.1, Math.min(8, curScale * factor));
  if (cx == null) { cx = $("viewport").clientWidth / 2; cy = $("viewport").clientHeight / 2; }
  const wx = (cx - view.x) / curScale;
  const wy = (cy - view.y) / curScale;
  view.scale = newScale;
  view.x = cx - wx * view.scale;
  view.y = cy - wy * view.scale;
  applyTransform();
  if (typeof drawRoads === "function") drawRoads();
  if (typeof drawMeasure === "function") drawMeasure();
}

function screenToWorld(cx, cy) {
  const s = (Number.isFinite(view.scale) && view.scale > 0) ? view.scale : 1;
  return {
    x: roundCoord((cx - view.x) / s),
    y: roundCoord((cy - view.y) / s)
  };
}

function isBlockingModalOpen() {
  return document.querySelector(".overlay.show:not(.floating-overlay)") != null;
}

function isUiTarget(target) {
  if (!target || !target.closest) return false;
  return Boolean(
    target.closest(".ui-btn") ||
    target.closest("#adminBar") ||
    target.closest("#legendPanel") ||
    target.closest("#markerPopup") ||
    target.closest("#contextMenu") ||
    target.closest(".modal") ||
    target.closest(".overlay:not(.floating-overlay)")
  );
}

function setupMapEvents() {
  const viewport = $("viewport");
  let panning = false, movedByPan = false, lastX = 0, lastY = 0;
  let touchDist = 0, touchMid = { x: 0, y: 0 };

  let dragMarker = null;
  let dragId = null;
  let dragIndex = -1;
  let dragMoved = false;
  let dragStartScreen = { x: 0, y: 0 };
  let dragOriginMarker = { x: 0, y: 0 };
  let dragOriginPointerWorld = { x: 0, y: 0 };

  activeMarkerDragReset = () => {
    if (dragMarker) dragMarker.classList.remove("dragging");
    dragMarker = null;
    dragId = null;
    dragIndex = -1;
    dragMoved = false;
    markerDragActive = false;
  };

  function resolveDraggedDraftMarker() {
    if (!draft || !Array.isArray(draft.markers)) return null;
    if (dragIndex >= 0 && dragIndex < draft.markers.length) {
      if (!(dragId > 0) || draft.markers[dragIndex].id === dragId) {
        return draft.markers[dragIndex];
      }
    }
    if (dragId > 0) {
      const found = draft.markers.find(x => x.id === dragId);
      if (found) return found;
    }
    if (dragIndex >= 0 && dragIndex < draft.markers.length) {
      return draft.markers[dragIndex];
    }
    return null;
  }

  function beginMarkerDrag(markerEl, clientX, clientY) {
    const resolved = resolveMarkerFromElement(markerEl, draftMarkers());
    if (!resolved || !resolved.marker) return false;
    const m = resolved.marker;
    dragMarker = markerEl;
    dragId = m.id;
    dragIndex = resolved.index;
    dragMoved = false;
    markerDragActive = true;
    dragStartScreen = { x: clientX, y: clientY };
    dragOriginMarker = { x: Number(m.x) || 0, y: Number(m.y) || 0 };
    dragOriginPointerWorld = screenToWorld(clientX, clientY);
    markerEl.classList.add("dragging");
    return true;
  }

  function updateMarkerDrag(clientX, clientY) {
    if (!dragMarker) return false;
    if (!dragMoved && Math.hypot(clientX - dragStartScreen.x, clientY - dragStartScreen.y) > 3) {
      dragMoved = true;
      ensureDraft();
      markDirty();
    }
    if (dragMoved) {
      const curW = screenToWorld(clientX, clientY);
      const dm = resolveDraggedDraftMarker();
      if (dm) {
        dm.x = roundCoord(dragOriginMarker.x + (curW.x - dragOriginPointerWorld.x));
        dm.y = roundCoord(dragOriginMarker.y + (curW.y - dragOriginPointerWorld.y));
        dragMarker.style.left = dm.x + "px";
        dragMarker.style.top = dm.y + "px";
        if (typeof updatePopupPosition === "function") updatePopupPosition();
      }
    }
    return true;
  }

  function finishMarkerDrag() {
    if (!dragMarker) return false;
    const wasMoved = dragMoved;
    activeMarkerDragReset();
    if (wasMoved) {
      markDirty();
      suppressNextClick();
    }
    return true;
  }

  viewport.addEventListener("mousedown", e => {
    if (isUiTarget(e.target)) return;
    if (e.button !== 0 || e.ctrlKey) return;

    if (isAdmin && adminMode && editMode === "road") {
      const ptEl = e.target.closest("circle[data-pt-index]");
      if (ptEl && onRoadPointMouseDown(e, ptEl)) {
        suppressNextClick();
        return;
      }
    }

    const markerEl = e.target.closest(".marker");
    if (isAdmin && adminMode && editMode === "move" && markerEl) {
      if (beginMarkerDrag(markerEl, e.clientX, e.clientY)) {
        e.preventDefault();
        return;
      }
    }

    panning = true;
    movedByPan = false;
    lastX = e.clientX;
    lastY = e.clientY;
    viewport.classList.add("dragging");
  });

  window.addEventListener("mousemove", e => {
    if (isAdmin && adminMode && editMode === "road") {
      const w = screenToWorld(e.clientX, e.clientY);
      if (roadDragPointIndex >= 0) {
        onRoadPointMouseMove(w);
        return;
      }
      if (!panning) {
        onRoadMouseMove(w);
      }
    }

    if (dragMarker) {
      updateMarkerDrag(e.clientX, e.clientY);
      return;
    }

    if (!panning) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) movedByPan = true;
    view.x += dx;
    view.y += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isAdmin && adminMode && editMode === "road") onRoadPointMouseUp();
    if (finishMarkerDrag()) return;
    if (panning) {
      viewport.classList.remove("dragging");
      panning = false;
      if (movedByPan) suppressNextClick();
    }
  });

  window.addEventListener("blur", () => {
    activeMarkerDragReset();
    if (panning) {
      viewport.classList.remove("dragging");
      panning = false;
    }
  });

  viewport.addEventListener("click", e => {
    if (consumeSuppressedClick()) return;
    if (movedByPan) { movedByPan = false; return; }
    if (isUiTarget(e.target)) return;
    if (isAdmin && adminMode && editMode === "road" && e.detail > 1) return;
    handleMapClick(e.clientX, e.clientY);
  });

  viewport.addEventListener("dblclick", e => {
    if (!(isAdmin && adminMode && editMode === "road")) return;
    if (isUiTarget(e.target)) return;
    const p = screenToWorld(e.clientX, e.clientY);
    onRoadMapClick(p, true);
  });

  viewport.addEventListener("contextmenu", e => {
    if (!(isAdmin && adminMode)) return;
    const roadGroup = e.target.closest("g[data-road-id]");
    if (roadGroup) {
      const roadIdAttr = roadGroup.getAttribute("data-road-id");
      if (roadIdAttr != null) {
        openContextMenuAt(e, { kind: "road", id: parseInt(roadIdAttr, 10) });
      }
    }
  });

  viewport.addEventListener("wheel", e => {
    if (isUiTarget(e.target)) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomAt(factor, e.clientX, e.clientY);
  }, { passive: false });

  viewport.addEventListener("touchstart", e => {
    if (isUiTarget(e.target)) return;
    if (isAdmin && adminMode && editMode === "road") {
      const ptEl = e.target.closest("circle[data-pt-index]");
      if (ptEl && e.touches.length === 1) {
        if (onRoadPointMouseDown(e, ptEl)) return;
      }
    }
    const markerEl = e.target.closest(".marker");
    if (isAdmin && adminMode && editMode === "move" && markerEl && e.touches.length === 1) {
      const t = e.touches[0];
      if (beginMarkerDrag(markerEl, t.clientX, t.clientY)) {
        e.preventDefault();
        return;
      }
    }
    if (e.touches.length === 1) {
      panning = true;
      movedByPan = false;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      panning = false;
      touchDist = touchDistance(e.touches);
      touchMid = touchMidpoint(e.touches);
    }
  }, { passive: false });

  viewport.addEventListener("touchmove", e => {
    if (isAdmin && adminMode && editMode === "road" && e.touches.length === 1 && roadDragPointIndex >= 0) {
      const t = e.touches[0];
      const w = screenToWorld(t.clientX, t.clientY);
      onRoadPointMouseMove(w);
      e.preventDefault();
      return;
    }
    if (dragMarker && e.touches.length === 1) {
      const t = e.touches[0];
      updateMarkerDrag(t.clientX, t.clientY);
      e.preventDefault();
      return;
    }
    if (e.touches.length === 1 && panning) {
      const t = e.touches[0];
      const dx = t.clientX - lastX, dy = t.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) movedByPan = true;
      view.x += dx;
      view.y += dy;
      lastX = t.clientX;
      lastY = t.clientY;
      applyTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const d = touchDistance(e.touches);
      const m = touchMidpoint(e.touches);
      if (touchDist > 0) {
        view.x += m.x - touchMid.x;
        view.y += m.y - touchMid.y;
        zoomAt(d / touchDist, m.x, m.y);
      }
      touchDist = d;
      touchMid = m;
    }
  }, { passive: false });

  viewport.addEventListener("touchend", () => {
    if (isAdmin && adminMode && editMode === "road") onRoadPointMouseUp();
    if (finishMarkerDrag()) return;
    if (panning && movedByPan) suppressNextClick();
    panning = false;
    touchDist = 0;
  });

  viewport.addEventListener("touchcancel", () => {
    activeMarkerDragReset();
    panning = false;
    touchDist = 0;
  });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if ($("weeksOverlay").classList.contains("show")) { cancelWeeks(); return; }
      if ($("editOverlay").classList.contains("show")) { closeEdit(); return; }
      if ($("importOverlay").classList.contains("show")) { closeImport(); return; }
      if ($("autosaveOverlay").classList.contains("show")) {
        $("autosaveOverlay").classList.remove("show");
        pendingAutosave = null;
        return;
      }
      if ($("loginOverlay").classList.contains("show")) { closeLogin(); return; }
      if ($("scaleOverlay").classList.contains("show")) { cancelScaleOverlay(); return; }
      if ($("markerPopup").classList.contains("show")) { closePopup(); return; }
    }

    if (isBlockingModalOpen()) return;
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (isAdmin && adminMode && editMode === "road") {
      onRoadKeyDown(e);
    }
  });

  function touchDistance(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }
  function touchMidpoint(t) {
    return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
  }
}

function handleMapWorldPoint(p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
  const wx = roundCoord(p.x);
  const wy = roundCoord(p.y);

  if (scalePickMode) {
    scalePickPts.push({ x: wx, y: wy });
    if (scalePickPts.length > 2) scalePickPts = scalePickPts.slice(-2);
    updateScalePickInfo();
    drawMeasure();
    return;
  }
  if (rulerMode) {
    measurePoints.push({ x: wx, y: wy });
    if (measurePoints.length > 2) measurePoints = measurePoints.slice(-2);
    drawMeasure();
    return;
  }
  if (isAdmin && adminMode && editMode === "road") {
    onRoadMapClick({ x: wx, y: wy }, false);
    return;
  }
  if (isAdmin && adminMode && editMode === "place" && placingType) {
    const curMarkers = draftMarkers();
    const baseNext = draft ? draft.nextId : state.nextId;
    const previewId = Math.max(Number(baseNext) || 1, computeNextId(curMarkers));
    const markerTemplate = {
      type: placingType,
      x: wx,
      y: wy,
      name: TYPES[placingType].label + " " + previewId,
      desc: "",
      color: "#c9a227"
    };
    openEdit(markerTemplate, true);
  }
}

function handleMapClick(cx, cy) {
  handleMapWorldPoint(screenToWorld(cx, cy));
}
