function drawMeasure() {
  const svg = $("measureSvg");
  if (!svg) return;
  svg.innerHTML = "";

  const s = Math.max(0.05, view.scale || 1);
  const pts = scalePickMode ? scalePickPts : measurePoints;
  if (!pts || pts.length === 0) return;

  const circle = (p, color = "#e6c55a") => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", p.x);
    c.setAttribute("cy", p.y);
    c.setAttribute("r", 6 / s);
    c.setAttribute("fill", color);
    c.setAttribute("stroke", "#1a1510");
    c.setAttribute("stroke-width", 2 / s);
    return c;
  };

  if (pts.length === 1) {
    svg.appendChild(circle(pts[0], scalePickMode ? "#8fc27a" : "#e6c55a"));
    return;
  }

  const [a, b] = pts;
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
  line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
  line.setAttribute("stroke-width", 3 / s);
  line.setAttribute("stroke-dasharray", `${8 / s} ${6 / s}`);
  if (scalePickMode) line.style.stroke = "#8fc27a";
  svg.appendChild(line);
  svg.appendChild(circle(a, scalePickMode ? "#8fc27a" : "#e6c55a"));
  svg.appendChild(circle(b, scalePickMode ? "#8fc27a" : "#e6c55a"));

  if (scalePickMode) return;

  const distPx = Math.hypot(b.x - a.x, b.y - a.y);
  const sc = draftScale();
  const walk = sc && sc.refPx ? (distPx / sc.refPx) * sc.walk : 0;
  const cart = sc && sc.refPx ? (distPx / sc.refPx) * sc.cart : 0;

  const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", midX);
  t.setAttribute("y", midY - 10 / s);
  t.setAttribute("fill", "#e6c55a");
  t.setAttribute("font-size", 16 / s);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("font-family", "Georgia");
  t.setAttribute("style", `paint-order:stroke;stroke:#1a1510;stroke-width:${3 / s}px;`);
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
