const CONFIG = {
  MAP_SRC: "assets/map.jpg",
  ADMIN_LOGIN: "admin",
  ADMIN_PASS: "fantasy123",
  MIN_ADMIN_WIDTH: 900,

  // Линейка (см. прошлый шаг)
  RULER_ENABLED: false,

  // === Синхронизация через Google Sheets ===
  // URL веб-приложения Apps Script (из "Развернуть → Новое развёртывание")
  API_URL: "https://script.google.com/macros/s/ВАШ_ID/exec",
  // Тот же токен, что в Apps Script
  SECRET_TOKEN: "ВАШ_СЕКРЕТНЫЙ_ТОКЕН_ЗАМЕНИТЕ_МЕНЯ",

  STORAGE_KEY: "fantasyMapData_v1",
  AUTOSAVE_KEY: "fantasyMapAutosave_v1",
  AUTOSAVE_INTERVAL_MS: 5 * 60 * 1000,
  AUTOSAVE_MAX: 5,
  DEFAULT_WALK: 1,
  DEFAULT_CART: 1.5,
  EXPORT_VERSION: 1
};

const $ = id => document.getElementById(id);