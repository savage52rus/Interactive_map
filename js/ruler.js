function drawMeasure() {
  const svg = $("measureSvg");
  svg.innerHTML = "";
  if (measurePoints.length === 0) return;

  const circle = (p) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", p.x); c.setAttribute("cy", p.y);
    c.setAttribute("r", 6 / view.scale);
    c.setAttribute("fill", "#e6c55a");
    return c;
  };

  if (measurePoints.length === 1) {
    svg.appendChild(circle(measurePoints[0]));
    return;
  }

  const [a, b] = measurePoints;
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
  line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
  svg.appendChild(line);
  svg.appendChild(circle(a));
  svg.appendChild(circle(b));

  const distPx = Math.hypot(b.x - a.x, b.y - a.y);
  const sc = draftScale();
  const walk = sc && sc.refPx ? (distPx / sc.refPx) * sc.walk : 0;
  const cart = sc && sc.refPx ? (distPx / sc.refPx) * sc.cart : 0;

  const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", midX); t.setAttribute("y", midY - 10 / view.scale);
  t.setAttribute("fill", "#e6c55a");
  t.setAttribute("font-size", 16 / view.scale);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("font-family", "Georgia");
  t.setAttribute("style", "paint-order:stroke;stroke:#1a1510;stroke-width:3px;");
  t.textContent = `${walk.toFixed(1)} дн. пешком / ${cart.toFixed(1)} дн. на повозке`;
  svg.appendChild(t);
}

function toggleRuler() {
  const sc = draftScale();
  if (!sc || !sc.refPx) { showScaleOverlay(); return; }
  rulerMode = !rulerMode;
  $("rulerBtn").classList.toggle("active", rulerMode);
  if (!rulerMode) { measurePoints = []; drawMeasure(); }
  if (rulerMode) closePopup();
}
