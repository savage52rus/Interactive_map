let activePopupMarker = null;

function updatePopupPosition() {
  const popup = $("markerPopup");
  if (!activePopupMarker || !popup || !popup.classList.contains("show")) return;
  const px = view.x + activePopupMarker.x * view.scale;
  const py = view.y + activePopupMarker.y * view.scale;
  const pw = popup.offsetWidth || 280;
  const ph = popup.offsetHeight || 160;
  let left = px + 26;
  let top = py - 20;
  if (left + pw > window.innerWidth - 10) left = px - pw - 26;
  if (left < 10) left = 10;
  if (top + ph > window.innerHeight - 10) top = window.innerHeight - ph - 10;
  if (top < 10) top = 10;
  popup.style.left = left + "px";
  popup.style.top = top + "px";
}

function showPopup(m) {
  activePopupMarker = m;
  $("mpIcon").innerHTML = svgSprite(m.type, m.color);
  $("mpTitle").textContent = m.name;
  $("mpType").textContent = TYPES[m.type] ? TYPES[m.type].label : m.type;
  $("mpDesc").textContent = m.desc || "—";
  const popup = $("markerPopup");
  popup.classList.add("show");
  updatePopupPosition();
}

function closePopup() {
  activePopupMarker = null;
  const popup = $("markerPopup");
  if (popup) popup.classList.remove("show");
}
