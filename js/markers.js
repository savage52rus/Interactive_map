function resolveMarkerFromElement(markerEl, list) {
  if (!markerEl || !Array.isArray(list)) return null;
  const idx = parseInt(markerEl.dataset.index, 10);
  const id = parseInt(markerEl.dataset.id, 10);

  if (Number.isInteger(idx) && idx >= 0 && idx < list.length) {
    if (!(id > 0) || list[idx].id === id) {
      return { marker: list[idx], index: idx };
    }
  }
  if (id > 0) {
    const foundIdx = list.findIndex(x => x.id === id);
    if (foundIdx >= 0) return { marker: list[foundIdx], index: foundIdx };
  }
  if (Number.isInteger(idx) && idx >= 0 && idx < list.length) {
    return { marker: list[idx], index: idx };
  }
  return null;
}

function renderMarkers() {
  const layer = $("markersLayer");
  if (!layer) return;
  layer.innerHTML = "";
  const markers = draftMarkers();

  if (activePopupMarker && !markers.some(x => x.id === activePopupMarker.id)) {
    closePopup();
  }

  markers.forEach((m, idx) => {
    const el = document.createElement("div");
    el.className = "marker";
    el.dataset.id = String(m.id);
    el.dataset.index = String(idx);
    el.style.left = m.x + "px";
    el.style.top = m.y + "px";
    el.innerHTML = svgSprite(m.type, m.color) + `<span class="label">${escapeHtml(m.name)}</span>`;
    el.addEventListener("click", e => {
      if (typeof consumeSuppressedClick === "function" && consumeSuppressedClick()) {
        e.stopPropagation();
        return;
      }
      const curList = draftMarkers();
      const resolved = resolveMarkerFromElement(el, curList);
      const targetMarker = resolved ? resolved.marker : m;

      if (scalePickMode || rulerMode) {
        e.stopPropagation();
        handleMapWorldPoint({ x: targetMarker.x, y: targetMarker.y });
        return;
      }
      if (isAdmin && adminMode && editMode === "road") {
        e.stopPropagation();
        if (e.detail === 1) onRoadMapClick({ x: targetMarker.x, y: targetMarker.y }, false);
        return;
      }
      if (isAdmin && adminMode && editMode === "place" && placingType) {
        return;
      }
      e.stopPropagation();
      if (isAdmin && adminMode) openEdit(targetMarker, false);
      else showPopup(targetMarker);
    });
    el.addEventListener("contextmenu", e => {
      if (!(isAdmin && adminMode)) return;
      const curList = draftMarkers();
      const resolved = resolveMarkerFromElement(el, curList);
      const targetMarker = resolved ? resolved.marker : m;
      openContextMenuAt(e, { kind: "marker", id: targetMarker.id, index: resolved ? resolved.index : idx });
    });
    layer.appendChild(el);
  });
}

function deleteMarkerById(id) {
  if (!confirm("Удалить маркер? (изменение попадёт в черновик)")) return;
  ensureDraft();
  draft.markers = draft.markers.filter(x => x.id !== id);
  if (activePopupMarker && activePopupMarker.id === id) closePopup();
  renderMarkers();
  markDirty();
}
