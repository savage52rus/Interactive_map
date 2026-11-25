let roadDraft = null;
let roadEditing = null;
let roadDragPointIndex = -1;
let pendingRoad = null;

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
  if (pts.length < 2) {
    setHint("Нужно минимум 2 точки. Дорога отменена.");
    roadDraft = null;
    drawRoads();
    setTimeout(() => setHint(""), 2000);
    return;
  }
  openWeeksDialog(pts.length, pts, null, null);
}

function cancelNewRoad() {
  roadDraft = null;
  drawRoads();
  setHint("");
}

function openWeeksDialog(pointCount, points, existingId, initialWeeks) {
  pendingRoad = {
    points: points.map(p => ({ x: p.x, y: p.y })),
    existingId: existingId != null ? existingId : null
  };
  $("weeksInfo").textContent = "Точек в дороге: " + pointCount;
  $("weeksInput").value = initialWeeks != null ? String(initialWeeks) : "";
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
  if (!pendingRoad) { $("weeksOverlay").classList.remove("show"); return; }

  ensureDraft();
  draft.roads = normalizeRoads(draft.roads);

  let target;
  if (pendingRoad.existingId != null) {
    target = draft.roads.find(x => x.id === pendingRoad.existingId);
    if (target) {
      target.weeks = n;
      target.points = pendingRoad.points.map(p => ({ x: p.x, y: p.y }));
    }
  } else {
    draft.nextRoadId = Math.max(Number(draft.nextRoadId) || 1, computeNextId(draft.roads));
    target = {
      id: draft.nextRoadId++,
      weeks: n,
      points: pendingRoad.points.map(p => ({ x: p.x, y: p.y }))
    };
    draft.roads.push(target);
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

function approxPolylineLength(points) {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    sum += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return sum;
}

function approxPolylineMidpoint(points) {
  const half = approxPolylineLength(points) / 2;
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (acc + seg >= half && seg > 0) {
      const k = (half - acc) / seg;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * k,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * k
      };
    }
    acc += seg;
  }
  return { x: points[0].x, y: points[0].y };
}

function applyRoadDashes(pathEl, weeks, totalLength, strokeW) {
  const n = Math.max(1, Math.floor(Number(weeks) || 1));
  if (n === 1) {
    pathEl.removeAttribute("stroke-dasharray");
    pathEl.setAttribute("stroke-linecap", "round");
    return;
  }
  // n штрихов и (n - 1) промежутков покрывают весь путь от начала до конца:
  // n * dash + (n - 1) * gap = totalLength при gap = 0.5 * dash
  const dash = totalLength / (1.5 * n - 0.5);
  const gap = dash * 0.5;
  if (gap > strokeW * 1.3) {
    const adjDash = Math.max(strokeW * 0.2, dash - strokeW);
    const adjGap = gap + strokeW;
    pathEl.setAttribute("stroke-dasharray", `${adjDash} ${adjGap}`);
    pathEl.setAttribute("stroke-linecap", "round");
  } else {
    pathEl.setAttribute("stroke-dasharray", `${dash} ${gap}`);
    pathEl.setAttribute("stroke-linecap", "butt");
  }
}

function drawRoads() {
  const layer = $("roadsSvg");
  if (!layer) return;
  layer.innerHTML = "";

  const s = Math.max(0.05, view.scale || 1);
  const roads = draftRoads() || [];

  roads.forEach(r => {
    if (!r.points || r.points.length < 2) return;
    if (roadEditing && roadEditing.id === r.id) return;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-road-id", r.id);
    layer.appendChild(g);

    const d = buildBezierPath(r.points);

    if (isAdmin && adminMode) {
      const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hit.setAttribute("d", d);
      hit.setAttribute("fill", "none");
      hit.setAttribute("stroke", "transparent");
      hit.setAttribute("stroke-width", 14 / s);
      hit.style.cursor = "pointer";
      hit.addEventListener("click", onExistingRoadClick(r));
      g.appendChild(hit);
    }

    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const strokeW = 3 / s;
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#e6c55a");
    p.setAttribute("stroke-width", strokeW);
    p.style.filter = `drop-shadow(0 0 ${Math.max(1, 3 / s)}px #000)`;
    g.appendChild(p);

    // Измеряем длину после добавления в DOM (#roadsSvg) для кроссбраузерной точности
    let total = 0;
    try { total = p.getTotalLength(); } catch (e) { total = 0; }
    if (!total || !Number.isFinite(total)) total = Math.max(1, approxPolylineLength(r.points));

    applyRoadDashes(p, r.weeks, total, strokeW);

    let mid = null;
    try {
      const pt = p.getPointAtLength(total / 2);
      if (pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)) mid = { x: pt.x, y: pt.y };
    } catch (e) { mid = null; }
    if (!mid) mid = approxPolylineMidpoint(r.points);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", mid.x);
    label.setAttribute("y", mid.y - 8 / s);
    label.setAttribute("fill", "#e6c55a");
    label.setAttribute("font-size", 14 / s);
    label.setAttribute("font-family", "Georgia");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("style", `paint-order:stroke;stroke:#1a1510;stroke-width:${3 / s}px;pointer-events:none;`);
    label.textContent = r.weeks + " нед.";
    g.appendChild(label);

    if (isAdmin && adminMode) {
      r.points.forEach((pt, idx) => {
        const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ.setAttribute("cx", pt.x);
        circ.setAttribute("cy", pt.y);
        circ.setAttribute("r", 5 / s);
        circ.setAttribute("fill", "#1e1a16");
        circ.setAttribute("stroke", "#e6c55a");
        circ.setAttribute("stroke-width", 2 / s);
        circ.setAttribute("data-pt-index", idx);
        circ.setAttribute("data-road-id", r.id);
        circ.style.cursor = "move";
        g.appendChild(circ);
      });

      p.style.cursor = "pointer";
      p.addEventListener("click", onExistingRoadClick(r));
    }
  });

  if (roadDraft) drawDraftPolyline(roadDraft, layer, false);
  if (roadEditing) drawDraftPolyline(roadEditing, layer, true);
}

function onExistingRoadClick(r) {
  return (e) => {
    if (typeof consumeSuppressedClick === "function" && consumeSuppressedClick()) {
      e.stopPropagation();
      return;
    }
    if (scalePickMode || rulerMode) return;
    if (editMode === "place" && placingType) return;
    if (roadDraft && roadDraft.points.length > 0) return;
    if (roadEditing && roadEditing.id === r.id) return;
    e.stopPropagation();
    openEditRoad(r);
  };
}

function drawDraftPolyline(dObj, layer, isEdit) {
  const s = Math.max(0.05, view.scale || 1);
  const pts = dObj.points.slice();
  if (dObj.tempPoint && !isEdit) pts.push(dObj.tempPoint);
  if (pts.length < 1) return;

  const d = pts.length >= 2 ? buildBezierPath(pts) : `M ${pts[0].x} ${pts[0].y}`;
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", isEdit ? "#8fc27a" : "#c9a227");
  p.setAttribute("stroke-width", 2.5 / s);
  p.setAttribute("stroke-dasharray", `${6 / s} ${4 / s}`);
  p.style.pointerEvents = "none";
  layer.appendChild(p);

  dObj.points.forEach((pt, idx) => {
    const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("cx", pt.x);
    circ.setAttribute("cy", pt.y);
    circ.setAttribute("r", 7 / s);
    circ.setAttribute("fill", isEdit ? "#8fc27a" : "#c9a227");
    circ.setAttribute("stroke", "#1a1510");
    circ.setAttribute("stroke-width", 2 / s);
    circ.setAttribute("data-pt-index", idx);
    circ.setAttribute("data-draft", "1");
    circ.style.cursor = "move";
    layer.appendChild(circ);
  });

  if (dObj.tempPoint && !isEdit) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", dObj.tempPoint.x);
    c.setAttribute("cy", dObj.tempPoint.y);
    c.setAttribute("r", 4 / s);
    c.setAttribute("fill", "rgba(201,162,39,0.4)");
    c.style.pointerEvents = "none";
    layer.appendChild(c);
  }
}

function openEditRoad(r) {
  setEditMode("road");
  roadEditing = {
    id: r.id,
    weeks: r.weeks,
    points: r.points.map(p => ({ x: p.x, y: p.y })),
    tempPoint: null
  };
  roadDraft = null;
  setHint("Редактирование дороги: тяните точки, клик — новая точка, Backspace — удалить последнюю, двойной клик / Enter — сохранить.");
  drawRoads();
}

function finishEditRoad() {
  if (!roadEditing) return;
  openWeeksDialog(roadEditing.points.length, roadEditing.points, roadEditing.id, roadEditing.weeks);
}

function deleteRoad(roadId) {
  if (!confirm("Удалить эту дорогу? (изменение попадёт в черновик)")) return;
  ensureDraft();

  draft.roads = draft.roads.filter(r => r.id !== roadId);
  if (roadEditing && roadEditing.id === roadId) {
    roadEditing = null;
    setEditMode("view");
  }
  markDirty();
  drawRoads();
}

function pushUniqueRoadPoint(list, worldPt) {
  const minDist = 3 / Math.max(0.1, view.scale || 1);
  if (list.length > 0) {
    const last = list[list.length - 1];
    if (Math.hypot(worldPt.x - last.x, worldPt.y - last.y) < minDist) {
      return false;
    }
  }
  list.push({ x: worldPt.x, y: worldPt.y });
  return true;
}

function onRoadMapClick(worldPt, isDouble) {
  if (roadEditing) {
    if (isDouble) { finishEditRoad(); return; }
    pushUniqueRoadPoint(roadEditing.points, worldPt);
    drawRoads();
    return;
  }
  if (roadDraft) {
    if (isDouble) { finishNewRoad(); return; }
    pushUniqueRoadPoint(roadDraft.points, worldPt);
    roadDraft.tempPoint = null;
    drawRoads();
    setHint(`Точек: ${roadDraft.points.length}. Двойной клик / Enter — завершить, Backspace — шаг назад.`);
    return;
  }
  if (isDouble) return;
  startNewRoad();
  pushUniqueRoadPoint(roadDraft.points, worldPt);
  drawRoads();
}

function onRoadMouseMove(worldPt) {
  if (roadDraft) {
    roadDraft.tempPoint = { x: worldPt.x, y: worldPt.y };
    drawRoads();
  }
}

function onRoadPointMouseDown(e, target) {
  if (scalePickMode || rulerMode) return false;
  const idx = parseInt(target.getAttribute("data-pt-index"), 10);
  if (!Number.isFinite(idx)) return false;
  const isDraft = target.getAttribute("data-draft") === "1";

  if (isDraft) {
    roadDragPointIndex = idx;
    e.preventDefault();
    return true;
  }

  // Не перехватываем клик на чужой дороге, пока рисуется новая дорога
  if (roadDraft && roadDraft.points.length > 0) return false;

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
  if (roadDragPointIndex >= 0 && typeof suppressNextClick === "function") {
    suppressNextClick();
  }
  roadDragPointIndex = -1;
}

function onRoadKeyDown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    if (roadDraft) finishNewRoad();
    else if (roadEditing) finishEditRoad();
  } else if (e.key === "Escape") {
    if (roadDraft) cancelNewRoad();
    else if (roadEditing) { roadEditing = null; setEditMode("view"); drawRoads(); }
  } else if (e.key === "Backspace") {
    if (roadDraft && roadDraft.points.length) {
      e.preventDefault();
      roadDraft.points.pop();
      drawRoads();
      setHint(`Точек: ${roadDraft.points.length}. Двойной клик / Enter — завершить.`);
    } else if (roadEditing && roadEditing.points.length > 2) {
      e.preventDefault();
      roadEditing.points.pop();
      drawRoads();
    } else if (roadEditing && roadEditing.points.length <= 2) {
      e.preventDefault();
      setHint("В дороге должно остаться минимум 2 точки.");
    }
  } else if (e.key === "Delete" && roadEditing) {
    e.preventDefault();
    deleteRoad(roadEditing.id);
  }
}
