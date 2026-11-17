function renderMarkers() {
  const layer = $("markersLayer");
  layer.innerHTML = "";
  draftMarkers().forEach(m => {
    const el = document.createElement("div");
    el.className = "marker";
    el.dataset.id = m.id;
    el.style.left = m.x + "px";
    el.style.top = m.y + "px";
    el.innerHTML = svgSprite(m.type, m.color) + `<span class="label">${escapeHtml(m.name)}</span>`;
    el.addEventListener("click", e => {
      e.stopPropagation();
      if (isAdmin && adminMode) openEdit(m);
      else showPopup(m);
    });
    el.addEventListener("contextmenu", e => {
      if (!(isAdmin && adminMode)) return;
      openContextMenuAt(e, { kind: "marker", id: m.id });
    });
    layer.appendChild(el);
  });
}

function deleteMarkerById(id) {
  if (!confirm("Удалить маркер? (изменение попадёт в черновик)")) return;
  ensureDraft();
  draft.markers = draft.markers.filter(x => x.id !== id);
  renderMarkers();
  markDirty();
}