/* Кривые Безье-пути: состояние, отрисовка, редактирование */

// Черновик текущей отрисовки (в мировых координатах)
let curveDraft = null;
// { points: [{x,y},...], tempPoint: {x,y}|null }

// Черновик редактирования существующей кривой
let curveEditing = null;
// { id, weeks, points, tempPoint }

let curveDragPointIndex = -1;

function startNewCurve() {
  setEditMode("curve");
  curveDraft = { points: [], tempPoint: null };
  curveEditing = null;
  setHint("Кликните по карте, чтобы добавить опорную точку кривой. Двойной клик / Enter — завершить.");
  drawCurves();
}

function finishNewCurve() {
  if (!curveDraft) return;
  const pts = curveDraft.points.slice();
  const temp = curveDraft.tempPoint;
  if (pts.length < 2) {
    setHint("Нужно минимум 2 точки. Отмена.");
    curveDraft = null;
    drawCurves();
    setTimeout(() => setHint(""), 2000);
    return;
  }
  // если есть «резиновая» точка — добавляем как финальную
  if (temp) pts.push(temp);
  openWeeksDialog(pts.length, pts, null);
}

function cancelNewCurve() {
  curveDraft = null;
  drawCurves();
  setHint("");
}

function openWeeksDialog(pointCount, points, existingId) {
  pendingCurve = {
    points: points.map(p => ({ x: p.x, y: p.y })),
    existingId: existingId || null
  };
  $("weeksInfo").textContent = "Точек в кривой: " + pointCount;
  $("weeksInput").value = "";
  $("weeksErr").textContent = "";
  $("weeksOverlay").classList.add("show");
  setTimeout(() => $("weeksInput").focus(), 50);
}

function confirmWeeks() {
  const raw = $("weeksInput").value.trim();
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || Math.floor(n) !== n) {
    $("weeksErr").textContent = "Введите целое положительное число.";
    return;
  }
  if (!pendingCurve) { $("weeksOverlay").classList.remove("show"); return; }

  ensureDraft();

  if (pendingCurve.existingId != null) {
    const c = draft.curves.find(x => x.id === pendingCurve.existingId);
    if (c) {
      c.weeks = n;
      c.points = pendingCurve.points.map(p => ({ x: p.x, y: p.y }));
    }
  } else {
    draft.curves.push({
      id: draft.nextCurveId++,
      weeks: n,
      points: pendingCurve.points.map(p => ({ x: p.x, y: p.y }))
    });
  }

  curveDraft = null;
  curveEditing = null;
  pendingCurve = null;
  $("weeksOverlay").classList.remove("show");
  markDirty();
  drawCurves();
  setHint("");
}

function cancelWeeks() {
  pendingCurve = null;
  $("weeksOverlay").classList.remove("show");
  // Отмена при создании новой кривой — стираем
  if (curveDraft) { curveDraft = null; drawCurves(); }
  // Отмена при редактировании — выходим из режима
  if (curveEditing) {
    curveEditing = null;
    setEditMode("view");
    drawCurves();
  }
}

let pendingCurve = null;

/* ---------- построение пути Безье по точкам (Catmull-Rom → Bezier) ---------- */
function buildBezierPath(points) {
  if (!points || points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  // Catmull-Rom с натяжением 0.5
  const t = 0.5;
  const p = points;
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * t / 3;
    const c1y = p1.y + (p2.y - p0.y) * t / 3;
    const c2x = p2.x - (p3.x - p1.x) * t / 3;
    const c2y = p2.y - (p3.y - p1.y) * t / 3;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ---------- пунктир: количество штрихов = weeks ---------- */
// Возвращает { path, dashArray } — path уже разбит на N сегментов,
// dashArray = "dash gap", где dash ≈ длина/N * 0.65 (длина штриха).
function buildDashedPath(points, weeks) {
  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const d = buildBezierPath(points);
  pathEl.setAttribute("d", d);
  // длина пути
  let total = 0;
  try { total = pathEl.getTotalLength(); } catch (e) { total = 0; }
  if (!total || !Number.isFinite(total)) total = 1;
  const n = Math.max(1, Math.floor(weeks));
  const seg = total / n;            // длина «шага» на один штрих
  const dash = Math.max(2, seg * 0.6);  // длина штриха
  const gap = Math.max(2, seg - dash);   // длина пробела
  return {
    path: d,
    dashArray: `${dash} ${gap}`,
    total
  };
}

/* ---------- перерисовка всех кривых ---------- */
function drawCurves() {
  // отдельный svg-слой поверх карты (создаётся в index.html)
  const layer = $("curvesSvg");
  if (!layer) return;
  layer.innerHTML = "";

  const src = draft || state;
  const curves = (src && src.curves) ? src.curves : [];

  // готовые кривые
  curves.forEach(c => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-curve-id", c.id);

    const info = buildDashedPath(c.points, c.weeks);
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", info.path);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#e6c55a");
    p.setAttribute("stroke-width", 3 / view.scale);
    p.setAttribute("stroke-dasharray", info.dashArray);
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("vector-effect", "non-scaling-stroke");
    p.style.filter = "drop-shadow(0 0 3px #000)";
    g.appendChild(p);

    // маркеры-точки (только в админке и при наведении на кривую — но проще всегда тонкие)
    if (isAdmin && adminMode) {
      c.points.forEach((pt, idx) => {
        const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ.setAttribute("cx", pt.x);
        circ.setAttribute("cy", pt.y);
        circ.setAttribute("r", 5 / view.scale);
        circ.setAttribute("fill", "#1e1a16");
        circ.setAttribute("stroke", "#e6c55a");
        circ.setAttribute("stroke-width", 2 / view.scale);
        circ.setAttribute("data-pt-index", idx);
        circ.setAttribute("data-curve-id", c.id);
        circ.style.cursor = "move";
        g.appendChild(circ);
      });

      // клик по самой линии — редактирование
      p.style.cursor = "pointer";
      p.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditCurve(c);
      });
    }

    layer.appendChild(g);
  });

  // черновик создания
  if (curveDraft) {
    drawDraftPolyline(curveDraft, layer);
  }
  // черновик редактирования
  if (curveEditing) {
    drawDraftPolyline(curveEditing, layer, true);
  }
}

function drawDraftPolyline(dObj, layer, isEdit) {
  const pts = dObj.points.slice();
  if (dObj.tempPoint) pts.push(dObj.tempPoint);
  if (pts.length < 1) return;

  const d = pts.length >= 2 ? buildBezierPath(pts) : `M ${pts[0].x} ${pts[0].y}`;
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", isEdit ? "#8fc27a" : "#c9a227");
  p.setAttribute("stroke-width", 2 / view.scale);
  p.setAttribute("stroke-dasharray", `${6 / view.scale} ${4 / view.scale}`);
  p.setAttribute("vector-effect", "non-scaling-stroke");
  layer.appendChild(p);

  // опорные точки (перетаскиваемые)
  dObj.points.forEach((pt, idx) => {
    const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("cx", pt.x);
    circ.setAttribute("cy", pt.y);
    circ.setAttribute("r", 7 / view.scale);
    circ.setAttribute("fill", "#c9a227");
    circ.setAttribute("stroke", "#1a1510");
    circ.setAttribute("stroke-width", 2 / view.scale);
    circ.setAttribute("data-pt-index", idx);
    circ.setAttribute("data-draft", "1");
    circ.style.cursor = "move";
    layer.appendChild(circ);
  });

  // «резиновая» точка под курсором (если есть)
  if (dObj.tempPoint) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", dObj.tempPoint.x);
    c.setAttribute("cy", dObj.tempPoint.y);
    c.setAttribute("r", 4 / view.scale);
    c.setAttribute("fill", "rgba(201,162,39,0.4)");
    layer.appendChild(c);
  }
}

function openEditCurve(c) {
  setEditMode("curve");
  curveEditing = {
    id: c.id,
    weeks: c.weeks,
    points: c.points.map(p => ({ x: p.x, y: p.y })),
    tempPoint: null
  };
  curveDraft = null;
  setHint("Редактирование кривой: тяните точки, двойной клик / Enter — задать недели и сохранить.");
  drawCurves();
}

function finishEditCurve() {
  if (!curveEditing) return;
  openWeeksDialog(curveEditing.points.length, curveEditing.points, curveEditing.id);
}

/* ---------- обработка кликов/перетаскивания в режиме curve ---------- */
// Вызывается из map-view.js в handleMapClick при editMode === "curve"
function onCurveMapClick(worldPt, isDouble) {
  if (curveEditing) {
    if (isDouble) { finishEditCurve(); return; }
    // добавляем точку в редактируемую кривую в место клика (опционально — можно только тянуть)
    // по умолчанию: клик по карте вне точек — добавить точку
    curveEditing.points.push({ x: worldPt.x, y: worldPt.y });
    drawCurves();
    return;
  }
  if (curveDraft) {
    if (isDouble) { finishNewCurve(); return; }
    curveDraft.points.push({ x: worldPt.x, y: worldPt.y });
    curveDraft.tempPoint = null;
    drawCurves();
    setHint(`Точек: ${curveDraft.points.length}. Двойной клик / Enter — завершить.`);
    return;
  }
  // если режим curve, но черновика нет — начнём новый
  startNewCurve();
  curveDraft.points.push({ x: worldPt.x, y: worldPt.y });
  drawCurves();
}

function onCurveMouseMove(worldPt) {
  if (curveDraft) { curveDraft.tempPoint = { x: worldPt.x, y: worldPt.y }; drawCurves(); }
  else if (curveEditing) { curveEditing.tempPoint = { x: worldPt.x, y: worldPt.y }; drawCurves(); }
}

/* ---------- перетаскивание опорных точек ---------- */
function onCurvePointMouseDown(e, target) {
  const idx = parseInt(target.getAttribute("data-pt-index"), 10);
  if (!Number.isFinite(idx)) return false;
  const isDraft = target.getAttribute("data-draft") === "1";

  if (isDraft) {
    curveDragPointIndex = idx;
    e.preventDefault();
    return true;
  }
  // готовая кривая: начинаем редактирование и тянем точку
  const curveId = parseInt(target.getAttribute("data-curve-id"), 10);
  const c = (draft || state).curves.find(x => x.id === curveId);
  if (!c) return false;
  openEditCurve(c);
  curveDragPointIndex = idx;
  e.preventDefault();
  return true;
}

function onCurvePointMouseMove(worldPt) {
  if (curveDragPointIndex < 0) return;
  const src = curveEditing || curveDraft;
  if (!src) return;
  if (curveDragPointIndex >= src.points.length) return;
  src.points[curveDragPointIndex] = { x: worldPt.x, y: worldPt.y };
  drawCurves();
}

function onCurvePointMouseUp() {
  curveDragPointIndex = -1;
}

/* ---------- клавиатура ---------- */
function onCurveKeyDown(e) {
  if (e.key === "Enter") {
    if (curveDraft) finishNewCurve();
    else if (curveEditing) finishEditCurve();
  } else if (e.key === "Escape") {
    if (curveDraft) cancelNewCurve();
    else if (curveEditing) { curveEditing = null; setEditMode("view"); drawCurves(); }
  } else if (e.key === "Backspace") {
    if (curveDraft && curveDraft.points.length) {
      curveDraft.points.pop();
      drawCurves();
    }
  }
}