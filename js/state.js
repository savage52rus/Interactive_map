// Основное (сохранённое) состояние — доступно всем, меняется только через applyDraft
const state = {
  markers: [],
  scale: { walk: CONFIG.DEFAULT_WALK, cart: CONFIG.DEFAULT_CART },
  nextId: 1
};

// Вид камеры
const view = { scale: 1, x: 0, y: 0 };
const imgSize = { w: 0, h: 0 };

// Флаги админа
let isAdmin = false;
let adminMode = false;
let editMode = "view";       // "view" | "place" | "move"
let placingType = null;

// Линейка
let rulerMode = false;
let measurePoints = [];
let scalePickMode = false;
let scalePickPts = [];

// Кривые
const state = {
  markers: [],
  curves: [],                                     // ← новое
  scale: { walk: CONFIG.DEFAULT_WALK, cart: CONFIG.DEFAULT_CART },
  nextId: 1,
  nextCurveId: 1                                  // ← новое
};

// Временные
let pendingAutosave = null;
