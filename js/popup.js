function showPopup(m) {
  $("mpIcon").innerHTML = svgSprite(m.type, m.color);
  $("mpTitle").textContent = m.name;
  $("mpType").textContent = TYPES[m.type] ? TYPES[m.type].label : m.type;
  $("mpDesc").textContent = m.desc || "—";
  const popup = $("markerPopup");
  popup.classList.add("show");
  const px = view.x + m.x * view.scale;
  const py = view.y + m.y * view.scale;
  let left = px + 30, top = py - 20;
  if (left + 280 > window.innerWidth - 10) left = px - 300;
  if (left < 10) left = 10;
  if (top + 200 > window.innerHeight - 10) top = window.innerHeight - 220;
  if (top < 10) top = 10;
  popup.style.left = left + "px";
  popup.style.top = top + "px";
}

function closePopup() { $("markerPopup").classList.remove("show"); }
