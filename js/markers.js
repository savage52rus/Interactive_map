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
    layer.appendChild(el);
  });
}
