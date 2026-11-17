function applyTransform() {
  $("world").style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

function fitMap() {
  const vw = $("viewport").clientWidth, vh = $("viewport").clientHeight;
  if (!imgSize.w || !imgSize.h) return;
  const s = Math.min(vw / imgSize.w, vh / imgSize.h);
  view.scale = s;
  view.x = (vw - imgSize.w * s) / 2;
  view.y = (vh - imgSize.h * s) / 2;
  applyTransform();
}

function zoomAt(factor, cx, cy) {
  const newScale = Math.max(0.1, Math.min(8, view.scale * factor));
  if (cx == null) { cx = $("viewport").clientWidth / 2; cy = $("viewport").clientHeight / 2; }
  const wx = (cx - view.x) / view.scale;
  const wy = (cy - view.y) / view.scale;
  view.scale = newScale;
  view.x = cx - wx * view.scale;
  view.y = cy - wy * view.scale;
  applyTransform();
}

function screenToWorld(cx, cy) {
  return { x: (cx - view.x) / view.scale, y: (cy - view.y) / view.scale };
}

function setupMapEvents() {
  const viewport = $("viewport");
  let panning = false, movedByPan = false, lastX = 0, lastY = 0;
  let touchDist = 0, touchMid = { x: 0, y: 0 };
  let dragMarker = null, dragId = null, dragOffset = { x: 0, y: 0 };

  viewport.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    if (e.target.closest(".ui-btn") || e.target.closest("#adminBar") ||
        e.target.closest("#legendPanel") || e.target.closest("#markerPopup") ||
        e.target.closest(".overlay")) return;

    const markerEl = e.target.closest(".marker");
    if (editMode === "move" && markerEl) {
      const id = parseInt(markerEl.dataset.id, 10);
      const m = draftMarkers().find(x => x.id === id);
      if (m) {
        dragMarker = markerEl; dragId = id;
        const w = screenToWorld(e.clientX, e.clientY);
        dragOffset.x = m.x - w.x; dragOffset.y = m.y - w.y;
        markerEl.classList.add("dragging");
        e.preventDefault();
        return;
      }
    }
    panning = true; movedByPan = false;
    lastX = e.clientX; lastY = e.clientY;
    viewport.classList.add("dragging");
  });

  window.addEventListener("mousemove", e => {
    if (dragMarker && dragId != null) {
      const w = screenToWorld(e.clientX, e.clientY);
      const m = draftMarkers().find(x => x.id === dragId);
      if (m) {
        m.x = w.x + dragOffset.x;
        m.y = w.y + dragOffset.y;
        dragMarker.style.left = m.x + "px";
        dragMarker.style.top = m.y + "px";
      }
      return;
    }
    if (!panning) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) movedByPan = true;
    view.x += dx; view.y += dy;
    lastX = e.clientX; lastY = e.clientY;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    if (dragMarker && dragId != null) {
      dragMarker.classList.remove("dragging");
      dragMarker = null; dragId = null;
      ensureDraft(); markDirty();
      return;
    }
    if (panning) { viewport.classList.remove("dragging"); panning = false; }
  });

  viewport.addEventListener("click", e => {
    if (movedByPan) { movedByPan = false; return; }
    if (e.target.closest(".ui-btn") || e.target.closest("#adminBar") ||
        e.target.closest("#legendPanel") || e.target.closest("#markerPopup") ||
        e.target.closest(".overlay")) return;
    handleMapClick(e.clientX, e.clientY);
  });

  viewport.addEventListener("wheel", e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomAt(factor, e.clientX, e.clientY);
  }, { passive: false });

  viewport.addEventListener("touchstart", e => {
    if (e.target.closest(".ui-btn") || e.target.closest("#adminBar") ||
        e.target.closest("#legendPanel") || e.target.closest("#markerPopup") ||
        e.target.closest(".overlay")) return;
    const markerEl = e.target.closest(".marker");
    if (editMode === "move" && markerEl && e.touches.length === 1) {
      const id = parseInt(markerEl.dataset.id, 10);
      const m = draftMarkers().find(x => x.id === id);
      if (m) {
        dragMarker = markerEl; dragId = id;
        const t = e.touches[0];
        const w = screenToWorld(t.clientX, t.clientY);
        dragOffset.x = m.x - w.x; dragOffset.y = m.y - w.y;
        markerEl.classList.add("dragging");
        e.preventDefault(); return;
      }
    }
    if (e.touches.length === 1) {
      panning = true; movedByPan = false;
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      panning = false;
      touchDist = touchDistance(e.touches);
      touchMid = touchMidpoint(e.touches);
    }
  }, { passive: false });

  viewport.addEventListener("touchmove", e => {
    if (dragMarker && dragId != null && e.touches.length === 1) {
      const t = e.touches[0];
      const w = screenToWorld(t.clientX, t.clientY);
      const m = draftMarkers().find(x => x.id === dragId);
      if (m) { m.x = w.x + dragOffset.x; m.y = w.y + dragOffset.y;
        dragMarker.style.left = m.x + "px"; dragMarker.style.top = m.y + "px"; }
      e.preventDefault(); return;
    }
    if (e.touches.length === 1 && panning) {
      const t = e.touches[0];
      const dx = t.clientX - lastX, dy = t.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) movedByPan = true;
      view.x += dx; view.y += dy;
      lastX = t.clientX; lastY = t.clientY;
      applyTransform();
    } else if (e.touches.length === 2) {
      const d = touchDistance(e.touches);
      const m = touchMidpoint(e.touches);
      if (touchDist > 0) {
        zoomAt(d / touchDist, m.x, m.y);
        view.x += m.x - touchMid.x; view.y += m.y - touchMid.y;
        applyTransform();
      }
      touchDist = d; touchMid = m;
    }
  }, { passive: false });

  viewport.addEventListener("touchend", () => {
    if (dragMarker && dragId != null) {
      dragMarker.classList.remove("dragging");
      dragMarker = null; dragId = null;
      ensureDraft(); markDirty(); return;
    }
    panning = false; touchDist = 0;
  });

  function touchDistance(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }
  function touchMidpoint(t) {
    return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
  }
}

function handleMapClick(cx, cy) {
  if (scalePickMode) {
    const p = screenToWorld(cx, cy);
    scalePickPts.push(p);
    if (scalePickPts.length > 2) scalePickPts = scalePickPts.slice(-2);
    updateScalePickInfo();
    return;
  }
  if (rulerMode) {
    const p = screenToWorld(cx, cy);
    measurePoints.push(p);
    if (measurePoints.length > 2) measurePoints = measurePoints.slice(-2);
    drawMeasure();
    return;
  }
  if (isAdmin && adminMode && editMode === "place" && placingType) {
    const p = screenToWorld(cx, cy);
    ensureDraft();
    const marker = {
      id: draft.nextId++,
      type: placingType,
      x: p.x, y: p.y,
      name: TYPES[placingType].label + " " + draft.nextId,
      desc: "", color: "#c9a227"
    };
    draft.markers.push(marker);
    renderMarkers();
    markDirty();
    openEdit(marker);
  }
}
