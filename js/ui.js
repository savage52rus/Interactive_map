function setHint(text) {
  const el = $("modeHint");
  if (text) { el.textContent = text; el.classList.add("show"); }
  else el.classList.remove("show");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function buildLegend() {
  $("legendList").innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <div class="legend-row">
      ${svgSprite(k, "#c9a227")}
      <div><div class="lt">${t.label}</div><div class="ld">${t.desc}</div></div>
    </div>
  `).join("");
}

function buildAdminPalette() {
  const el = $("adminPalette");
  el.innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <div class="pal-item" data-type="${k}" title="${t.label}">${svgSprite(k, "#c9a227")}</div>
  `).join("");
  el.querySelectorAll(".pal-item").forEach(item => {
    item.onclick = () => {
      if (editMode !== "place") setEditMode("place");
      const t = item.dataset.type;
      if (placingType === t) {
        placingType = null;
        item.classList.remove("active");
        setHint("Режим размещения: выберите тип в палитре");
      } else {
        el.querySelectorAll(".pal-item").forEach(x => x.classList.remove("active"));
        item.classList.add("active");
        placingType = t;
        setHint("Кликните по карте, чтобы поставить: " + TYPES[t].label);
      }
    };
  });
}
