function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.markers)) {
        state.markers = d.markers;
        state.scale = d.scale || state.scale;
        state.nextId = d.nextId || (Math.max(0, ...state.markers.map(m => m.id)) + 1);
      }
    }
  } catch (e) { console.warn("loadState", e); }
}

function persistState() {
  try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn("persistState", e); }
}
