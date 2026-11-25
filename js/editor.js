let editingId = null;
let pendingNewMarker = null;
let selectedEditIcon = "";
let lastEditType = "poi";
let editModalEventsBound = false;

function ensureEditModalEvents() {
  if (editModalEventsBound) return;
  const typeSel = $("editType");
  const colorInp = $("editColor");
  if (!typeSel || !colorInp) return;

  typeSel.addEventListener("change", () => {
    const newType = TYPES[typeSel.value] ? typeSel.value : "poi";
    // Если была выбрана иконка прежнего типа, переключаем на иконку по умолчанию нового типа
    // (особые метки special:* сохраняются при смене типа)
    if (selectedEditIcon && selectedEditIcon.startsWith(lastEditType + ":")) {
      selectedEditIcon = "";
    }
    lastEditType = newType;
    renderEditIconPicker();
  });

  colorInp.addEventListener("input", () => {
    renderEditIconPicker();
  });

  editModalEventsBound = true;
}

function renderEditIconPicker() {
  const container = $("editIconPicker");
  const statusEl = $("editIconStatus");
  if (!container) return;

  const typeSel = $("editType");
  const colorInp = $("editColor");
  const curType = (typeSel && TYPES[typeSel.value]) ? typeSel.value : "poi";
  const curColor = (colorInp && /^#[0-9a-fA-F]{6}$/.test(colorInp.value)) ? colorInp.value : "#c9a227";

  const variants = ICON_VARIANTS[curType] || [];
  const defaultIdx = getTypeIconIndex(curType);
  const defaultTitle = variants[defaultIdx] ? variants[defaultIdx].title : "";

  const activeMeta = selectedEditIcon ? getCustomIconMeta(selectedEditIcon) : null;
  if (statusEl) {
    if (!activeMeta) {
      statusEl.textContent = "По умолчанию (" + defaultTitle + ")";
    } else if (activeMeta.isSpecial) {
      statusEl.textContent = "Особая: " + activeMeta.title;
    } else {
      statusEl.textContent = activeMeta.title;
    }
  }

  const typeButtonsHtml = variants.map((v, idx) => {
    const key = `${curType}:${idx}`;
    const isAct = selectedEditIcon === key;
    return `
      <button type="button"
              class="icon-opt${isAct ? " active" : ""}"
              data-icon-key="${key}"
              title="${escapeHtml(v.title)}">
        ${svgSprite(curType, curColor, idx)}
      </button>`;
  }).join("");

  const specialLabelsShort = {
    "special:cross": "Х",
    "special:ruined_city": "Руины гор.",
    "special:razed_village": "Разор. дер.",
    "special:ruined_castle": "Руины замка",
    "special:excl": "!"
  };

  const specialButtonsHtml = SPECIAL_MARKER_ICONS.map(sp => {
    const isAct = selectedEditIcon === sp.key;
    const shortLbl = specialLabelsShort[sp.key] || sp.title;
    return `
      <button type="button"
              class="icon-opt edit-special-opt${isAct ? " active" : ""}"
              data-icon-key="${sp.key}"
              title="${escapeHtml("Особая метка: " + sp.title)}">
        ${svgSprite(curType, curColor, sp.key)}
        <span class="eso-lbl">${escapeHtml(shortLbl)}</span>
      </button>`;
  }).join("");

  container.innerHTML = `
    <button type="button"
            class="edit-icon-default-btn${!selectedEditIcon ? " active" : ""}"
            data-icon-key=""
            title="Использовать общую иконку, выбранную для типа «${escapeHtml(TYPES[curType].label)}»">
      ${svgSprite(curType, curColor)}
      <span>По умолчанию для типа «${escapeHtml(TYPES[curType].label)}» (${escapeHtml(defaultTitle)})</span>
    </button>
    <div class="edit-icon-sub">Иконки типа «${escapeHtml(TYPES[curType].label)}» (10)</div>
    <div class="icon-type-row">${typeButtonsHtml}</div>
    <div class="edit-icon-sub">Особые метки (только для этого маркера)</div>
    <div class="icon-type-row">${specialButtonsHtml}</div>
  `;

  container.querySelectorAll("[data-icon-key]").forEach(btn => {
    btn.onclick = () => {
      selectedEditIcon = sanitizeMarkerIcon(btn.getAttribute("data-icon-key") || "");
      renderEditIconPicker();
    };
  });
}

function openEdit(m, isNew = false) {
  if (!m) return;
  ensureEditModalEvents();

  const typeSel = $("editType");
  typeSel.innerHTML = Object.entries(TYPES).map(([k, t]) => `<option value="${k}">${t.label}</option>`).join("");
  const resolvedType = TYPES[m.type] ? m.type : "poi";
  typeSel.value = resolvedType;
  lastEditType = resolvedType;

  selectedEditIcon = sanitizeMarkerIcon(m.icon || "");

  if (isNew) {
    editingId = null;
    pendingNewMarker = {
      type: resolvedType,
      x: roundCoord(Number(m.x) || 0),
      y: roundCoord(Number(m.y) || 0),
      name: m.name || "",
      desc: m.desc || "",
      color: m.color || "#c9a227",
      icon: selectedEditIcon
    };
    $("editModalTitle").textContent = "Создание маркера";
    $("editDelete").style.display = "none";
  } else {
    editingId = m.id;
    pendingNewMarker = null;
    $("editModalTitle").textContent = "Редактирование маркера";
    $("editDelete").style.display = "";
  }

  $("editName").value = m.name || "";
  $("editDesc").value = m.desc || "";
  $("editColor").value = /^#[0-9a-fA-F]{6}$/.test(m.color || "") ? m.color : "#c9a227";
  renderEditIconPicker();

  $("editOverlay").classList.add("show");
  setTimeout(() => $("editName").focus(), 50);
}

function closeEdit() {
  $("editOverlay").classList.remove("show");
  editingId = null;
  pendingNewMarker = null;
  selectedEditIcon = "";
}

function saveEdit() {
  ensureDraft();
  draft.markers = normalizeMarkers(draft.markers);

  const type = TYPES[$("editType").value] ? $("editType").value : "poi";
  const name = $("editName").value.trim() || (TYPES[type] ? TYPES[type].label : "Без названия");
  const desc = $("editDesc").value;
  const color = /^#[0-9a-fA-F]{6}$/.test($("editColor").value) ? $("editColor").value : "#c9a227";
  const icon = sanitizeMarkerIcon(selectedEditIcon);

  if (pendingNewMarker) {
    draft.nextId = Math.max(Number(draft.nextId) || 1, computeNextId(draft.markers));
    const newId = draft.nextId++;
    draft.markers.push({
      id: newId,
      type,
      x: roundCoord(Number(pendingNewMarker.x) || 0),
      y: roundCoord(Number(pendingNewMarker.y) || 0),
      name,
      desc,
      color,
      icon
    });
  } else {
    const m = draft.markers.find(x => x.id === editingId);
    if (!m) { closeEdit(); return; }
    m.type = type;
    m.name = name;
    m.desc = desc;
    m.color = color;
    m.icon = icon;
    if (!(parseInt(m.id, 10) > 0)) {
      draft.nextId = Math.max(Number(draft.nextId) || 1, computeNextId(draft.markers));
      m.id = draft.nextId++;
    }
    if (typeof activePopupMarker !== "undefined" && activePopupMarker && activePopupMarker.id === m.id) {
      activePopupMarker = m;
    }
  }

  renderMarkers();
  markDirty();
  closeEdit();
}

function deleteEdit() {
  if (editingId == null) { closeEdit(); return; }
  if (!confirm("Удалить маркер? (изменение попадёт в черновик)")) return;
  ensureDraft();
  draft.markers = draft.markers.filter(x => x.id !== editingId);
  if (activePopupMarker && activePopupMarker.id === editingId) closePopup();
  renderMarkers();
  markDirty();
  closeEdit();
}
