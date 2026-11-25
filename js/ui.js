function setHint(text) {
  const el = $("modeHint");
  if (text) { el.textContent = text; el.classList.add("show"); }
  else el.classList.remove("show");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function buildLegend() {
  const el = $("legendList");
  if (!el) return;
  el.innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <div class="legend-row">
      ${svgSprite(k, "#c9a227")}
      <div><div class="lt">${t.label}</div><div class="ld">${t.desc}</div></div>
    </div>
  `).join("");
}

function buildAdminPalette() {
  const el = $("adminPalette");
  if (!el) return;
  el.innerHTML = Object.entries(TYPES).map(([k, t]) => `
    <div class="pal-item${placingType === k ? " active" : ""}" data-type="${k}" title="${t.label}">${svgSprite(k, "#c9a227")}</div>
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

function buildAdminIconPicker() {
  const container = $("adminIconPicker");
  if (!container) return;
  const activeIcons = draftTypeIcons();

  container.innerHTML = Object.entries(TYPES).map(([typeKey, t]) => {
    const variants = ICON_VARIANTS[typeKey] || [];
    const curIdx = getTypeIconIndex(typeKey);
    const curTitle = variants[curIdx] ? variants[curIdx].title : "";

    const buttonsHtml = variants.map((v, idx) => `
      <button type="button"
              class="icon-opt${idx === curIdx ? " active" : ""}"
              data-type="${typeKey}"
              data-idx="${idx}"
              title="${escapeHtml(t.label + ": " + v.title)}">
        ${svgSprite(typeKey, "#c9a227", idx)}
      </button>
    `).join("");

    return `
      <div class="icon-type-group" data-type-group="${typeKey}">
        <div class="icon-type-head">
          <span class="ith-label">${escapeHtml(t.label)}</span>
          <span class="ith-variant">${escapeHtml(curTitle)}</span>
        </div>
        <div class="icon-type-row">${buttonsHtml}</div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".icon-opt").forEach(btn => {
    btn.onclick = () => {
      const typeKey = btn.dataset.type;
      const idx = parseInt(btn.dataset.idx, 10);
      if (!TYPES[typeKey] || !Number.isInteger(idx)) return;

      ensureDraft();
      draft.typeIcons = sanitizeTypeIcons(draft.typeIcons);
      if (draft.typeIcons[typeKey] === idx) return;

      draft.typeIcons[typeKey] = idx;
      markDirty();
      refreshTypeIconUI();

      const variantTitle = (ICON_VARIANTS[typeKey] && ICON_VARIANTS[typeKey][idx])
        ? ICON_VARIANTS[typeKey][idx].title
        : "";
      setHint(`Иконка для «${TYPES[typeKey].label}»: ${variantTitle}`);
      setTimeout(() => {
        if ($("modeHint") && $("modeHint").textContent.startsWith("Иконка для ")) setHint("");
      }, 2500);
    };
  });
}

function setupIconPickerToggle() {
  const toggle = $("iconPickerToggle");
  const picker = $("adminIconPicker");
  if (!toggle || !picker) return;
  toggle.onclick = () => {
    const isCollapsed = picker.classList.toggle("collapsed");
    toggle.classList.toggle("collapsed", isCollapsed);
  };
}

function refreshTypeIconUI() {
  buildLegend();
  buildAdminPalette();
  buildAdminIconPicker();
  if (typeof renderMarkers === "function") renderMarkers();
  if (typeof activePopupMarker !== "undefined" && activePopupMarker && $("markerPopup") && $("markerPopup").classList.contains("show")) {
    $("mpIcon").innerHTML = svgSprite(activePopupMarker.type, activePopupMarker.color);
  }
}

function updateGasVersionWarning() {
  const el = $("gasVersionWarn");
  if (!el) return;
  if (typeof serverApiStatus !== "undefined" && serverApiStatus === "legacy") {
    el.innerHTML = "⚠ В Google Таблице активна старая версия Apps Script: строки без <b>id</b> скрываются сервером Google. Обновите код из <b>googleappsapiscript.txt</b> через «Развернуть → Управление развертываниями → ✏ Изменить → Новая версия».";
    el.style.display = "block";
  } else {
    el.style.display = "none";
  }
}
