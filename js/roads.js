/* Дороги (кривые Безье-пути): состояние, отрисовка, редактирование, удаление */

let roadDraft = null;
let roadEditing = null;
let roadDragPointIndex = -1;
let pendingRoad = null;

/* ---------- начало/завершение новой дороги ---------- */
function startNewRoad() {
  setEditMode("road");
  roadDraft = { points: [], tempPoint: null };
  roadEditing = null;
  setHint("Кликните по карте, чтобы добавить точку дороги. Двойной клик / Enter — завершить.");
  drawRoads();
}

function finishNewRoad() {
  if (!roadDraft) return;
  const pts = roadDraft.points.slice();
  const temp = roadDraft.tempPoint;
  if (pts.length < 2) {
    setHint("Нужно минимум 2 точки. Дорога отменена.");
    roadDraft = null;
    drawRoads();
    setTimeout(() => setHint(""), 2000);
    return;
  }
  if (temp) pts.push(temp);
  openWeeksDialog(pts.length, pts, null);
}

function cancelNewRoad() {
  roadDraft = null;
  drawRoads();
  setHint("");
}

/* ---------- окно «Сколько недель пути?» ---------- */
function openWeeksDialog(pointCount, points, existingId) {
  pendingRoad = {
    points: points.map(p => ({ x: p.x, y: p.y })),
    existingId: existingId || null
  };
  $("weeksInfo").textContent = "Точек в дороге: " + pointCount;
  $("weeksInput").value = "";
  $("weeksErr").textContent = "";
  $("weeksOverlay").classList.add("show");
  setTimeout(() => $("weeksInput").focus(), 50);
}

async function confirmWeeks() {
  const raw = $("weeksInput").value.trim();
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || Math.floor(n) !== n) {
    $("weeksErr").textContent = "Введите целое положительное число.";
    return;
  }
  if (!pendingRoad) { $("weeksOverlay").classList.remove("show"); return; }

  ensureDraft();

  let target;
  if (pendingRoad.existingId != null) {
    target = draft.roads.find(x => x.id === pendingRoad.existingId);
    if (target) {
      target.weeks = n;
      target.points = pendingRoad.points.map(p => ({ x: p.x, y: p.y }));
    }
  } else {
    target = {
      id: draft.nextRoadId++,
      weeks: n,
      points: pendingRoad.points.map(p => ({ x: p.x, y: p.y }))
    };
    draft.roads.push(target);
  }

  // синхронизация с сервером
  if (target) {
    const res = await apiUpsertRoad(target);
    if (res.status !== "ok") {
      alert("Не удалось сохранить дорогу на сервере: " + (res.message || "ошибка"));
      return;
    }
  }

  roadDraft = null;
  roadEditing = null;
  pendingRoad = null;
  $("weeksOverlay").classList.remove("show");
  markDirty();
  drawRoads();
  setHint("");
}

function cancelWeeks() {
  pendingRoad = null;
  $("weeksOverlay").classList.remove("show");
  if (roadDraft) { roadDraft = null; drawRoads(); }
  if (roadEditing) {
    roadEditing = null;
    setEditMode("view");
    drawRoads();
  }
}

/* ---------- построение пути Безье по точкам (Catmull-Rom → Bezier) ---------- */
function buildBezierPath(points) {
  if (!points || points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
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
function buildDashedPath(points, weeks) {
  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const d = buildBezierPath(points);
  pathEl.setAttribute("d", d);
  let total = 0;
  try { total = pathEl.getTotalLength(); } catch (e) { total = 0; }
  if (!total || !Number.isFinite(total)) total = 1;
  const n = Math.max(1, Math.floor(weeks));
  const seg = total / n;
  const dash = Math.max(2, seg * 0.6);
  const gap = Math.max(2, seg - dash);
  return { path: d, dashArray: `${dash} ${gap}`, total };
}

/* ---------- перерисовка всех дорог ---------- */
function drawRoads() {
  const layer = $("roadsSvg");
  if (!layer) return;
  layer.innerHTML = "";

  const roads = draftRoads() || [];

  roads.forEach(r => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-road-id", r.id);

    const info = buildDashedPath(r.points, r.weeks);
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

    try {
      const mid = pathMidpoint(info.path, info.total);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", mid.x);
      label.setAttribute("y", mid.y - 8 / view.scale);
      label.setAttribute("fill", "#e6c55a");
      label.setAttribute("font-size", 14 / view.scale);
      label.setAttribute("font-family", "Georgia");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("style", "paint-order:stroke;stroke:#1a1510;stroke-width:3px;pointer-events:none;");
      label.textContent = r.weeks + " нед.";
      g.appendChild(label);
    } catch (e) { /* ignore */ }

    if (isAdmin && adminMode) {
      r.points.forEach((pt, idx) => {
        const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ.setAttribute("cx", pt.x);
        circ.setAttribute("cy", pt.y);
        circ.setAttribute("r", 5 / view.scale);
        circ.setAttribute("fill", "#1e1a16");
        circ.setAttribute("stroke", "#e6c55a");
        circ.setAttribute("stroke-width", 2 / view.scale);
        circ.setAttribute("data-pt-index", idx);
        circ.setAttribute("data-road-id", r.id);
        circ.style.cursor = "move";
        g.appendChild(circ);
      });

      p.style.cursor = "pointer";
      p.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditRoad(r);
      });
    }

    layer.appendChild(g);
  });

  if (roadDraft) drawDraftPolyline(roadDraft, layer, false);
  if (roadEditing) drawDraftPolyline(roadEditing, layer, true);
}

function pathMidpoint(d, total) {
  const tmp = document.createElementNS("http://www.w3.org/2000/svg", "path");
  tmp.setAttribute("d", d);
  const pt = tmp.getPointAtLength(total / 2);
  return { x: pt.x, y: pt.y };
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

  if (dObj.tempPoint) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", dObj.tempPoint.x);
    c.setAttribute("cy", dObj.tempPoint.y);
    c.setAttribute("r", 4 / view.scale);
    c.setAttribute("fill", "rgba(201,162,39,0.4)");
    layer.appendChild(c);
  }
}

/* ---------- редактирование существующей дороги ---------- */
function openEditRoad(r) {
  setEditMode("road");
  roadEditing = {
    id: r.id,
    weeks: r.weeks,
    points: r.points.map(p => ({ x: p.x, y: p.y })),
    tempPoint: null
  };
  roadDraft = null;
  setHint("Редактирование дороги: тяните точки, двойной клик / Enter — сохранить. Удалить — правый клик по дороге.");
  drawRoads();
}

function finishEditRoad() {
  if (!roadEditing) return;
  openWeeksDialog(roadEditing.points.length, roadEditing.points, roadEditing.id);
}

/* ---------- удаление дороги ---------- */
async function deleteRoad(roadId) {
  if (!confirm("Удалить эту дорогу? (изменение попадёт в черновик)")) return;
  ensureDraft();

  const res = await apiDeleteRoad(roadId);
  if (res.status !== "ok") {
    alert("Не удалось удалить дорогу на сервере: " + (res.message || "ошибка"));
    return;
  }

  draft.roads = draft.roads.filter(r => r.id !== roadId);
  if (roadEditing && roadEditing.id === roadId) {
    roadEditing = null;
    setEditMode("view");
  }
  markDirty();
  drawRoads();
}

/* ---------- клики/движение в режиме road ---------- */
function onRoadMapClick(worldPt, isDouble) {
  if (roadEditing) {
    if (isDouble) { finishEditRoad(); return; }
    roadEditing.points.push({ x: worldPt.x, y: worldPt.y });
    drawRoads();
    return;
  }
  if (roadDraft) {
    if (isDouble) { finishNewRoad(); return; }
    roadDraft.points.push({ x: worldPt.x, y: worldPt.y });
    roadDraft.tempPoint = null;
    drawRoads();
    setHint(`Точек: ${roadDraft.points.length}. Двойной клик / Enter — завершить.`);
    return;
  }
  startNewRoad();
  roadDraft.points.push({ x: worldPt.x, y: worldPt.y });
  drawRoads();
}

function onRoadMouseMove(worldPt) {
  if (roadDraft) { roadDraft.tempPoint = { x: worldPt.x, y: worldPt.y }; drawRoads(); }
  else if (roadEditing) { roadEditing.tempPoint = { x: worldPt.x, y: worldPt.y }; drawRoads(); }
}

function onRoadPointMouseDown(e, target) {
  const idx = parseInt(target.getAttribute("data-pt-index"), 10);
  if (!Number.isFinite(idx)) return false;
  const isDraft = target.getAttribute("data-draft") === "1";

  if (isDraft) {
    roadDragPointIndex = idx;
    e.preventDefault();
    return true;
  }

  const roadId = parseInt(target.getAttribute("data-road-id"), 10);
  const r = draftRoads().find(x => x.id === roadId);
  if (!r) return false;
  openEditRoad(r);
  roadDragPointIndex = idx;
  e.preventDefault();
  return true;
}

function onRoadPointMouseMove(worldPt) {
  if (roadDragPointIndex < 0) return;
  const src = roadEditing || roadDraft;
  if (!src) return;
  if (roadDragPointIndex >= src.points.length) return;
  src.points[roadDragPointIndex] = { x: worldPt.x, y: worldPt.y };
  drawRoads();
}

function onRoadPointMouseUp() {
  if (roadDragPointIndex >= 0) window.__roadSuppressClick = true;
  roadDragPointIndex = -1;
}

function onRoadKeyDown(e) {
  if (e.key === "Enter") {
    if (roadDraft) finishNewRoad();
    else if (roadEditing) finishEditRoad();
  } else if (e.key === "Escape") {
    if (roadDraft) cancelNewRoad();
    else if (roadEditing) { roadEditing = null; setEditMode("view"); drawRoads(); }
  } else if (e.key === "Backspace") {
    if (roadDraft && roadDraft.points.length) {
      roadDraft.points.pop();
      drawRoads();
    }
  } else if (e.key === "Delete" && roadEditing) {
    deleteRoad(roadEditing.id);
  }
}
