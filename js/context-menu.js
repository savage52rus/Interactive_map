/* Контекстное меню для дорог и маркеров */

let ctxMenuEl = null;
let ctxMenuTarget = null;

function ensureContextMenu() {
  if (ctxMenuEl) return ctxMenuEl;
  ctxMenuEl = document.createElement("div");
  ctxMenuEl.id = "contextMenu";
  ctxMenuEl.className = "context-menu";
  ctxMenuEl.innerHTML = `
    <button class="ctx-item" data-action="edit">✎ Редактировать</button>
    <button class="ctx-item ctx-danger" data-action="delete">🗑 Удалить</button>
    <div class="ctx-sep"></div>
    <button class="ctx-item" data-action="cancel">Отмена</button>
  `;
  ctxMenuEl.addEventListener("click", e => {
    const btn = e.target.closest(".ctx-item");
    if (!btn) return;
    handleContextAction(btn.dataset.action);
  });
  document.body.appendChild(ctxMenuEl);

  document.addEventListener("mousedown", e => {
    if (!ctxMenuEl.classList.contains("show")) return;
    if (ctxMenuEl.contains(e.target)) return;
    hideContextMenu();
  });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && ctxMenuEl.classList.contains("show")) hideContextMenu();
  });
  window.addEventListener("blur", hideContextMenu);
  window.addEventListener("resize", hideContextMenu);
  return ctxMenuEl;
}

function showContextMenu(x, y, target) {
  ensureContextMenu();
  ctxMenuTarget = target;
  ctxMenuEl.classList.add("show");
  ctxMenuEl.style.left = "0px";
  ctxMenuEl.style.top = "0px";
  const rect = ctxMenuEl.getBoundingClientRect();
  const pad = 8;
  let left = x, top = y;
  if (left + rect.width + pad > window.innerWidth) left = window.innerWidth - rect.width - pad;
  if (top + rect.height + pad > window.innerHeight) top = window.innerHeight - rect.height - pad;
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  ctxMenuEl.style.left = left + "px";
  ctxMenuEl.style.top = top + "px";
}

function hideContextMenu() {
  if (!ctxMenuEl) return;
  ctxMenuEl.classList.remove("show");
  ctxMenuTarget = null;
}

function handleContextAction(action) {
  const target = ctxMenuTarget;
  hideContextMenu();
  if (!target) return;
  if (target.kind === "road") {
    if (action === "edit") {
      const r = (draft ? draft : state).roads.find(x => x.id === target.id);
      if (r) openEditRoad(r);
    } else if (action === "delete") {
      deleteRoad(target.id);   // внутри — apiDeleteRoad
    }
  } else if (target.kind === "marker") {
    if (action === "edit") {
      const m = (draft ? draft : state).markers.find(x => x.id === target.id);
      if (m) openEdit(m);
    } else if (action === "delete") {
      deleteMarkerById(target.id);  // в markers.js — через apiDeleteMarker
    }
  }
}

function openContextMenuAt(e, target) {
  e.preventDefault();
  e.stopPropagation();
  showContextMenu(e.clientX, e.clientY, target);
}
