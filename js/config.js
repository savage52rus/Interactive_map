const CONFIG = {
  MAP_SRC: "assets/result.webp",
  MAP_FALLBACK_SRC: "assets/result.png",
  ADMIN_LOGIN: "sailor",
  ADMIN_PASS: "master",
  MIN_ADMIN_WIDTH: 900,

  // Линейка (см. прошлый шаг)
  RULER_ENABLED: false,

  // === Синхронизация через Google Sheets ===
  // URL веб-приложения Apps Script (из "Развернуть → Новое развёртывание")
  API_URL: "https://script.google.com/macros/s/AKfycbya6Im7wmQooGVc0Qznuk2mvVXyfMjGqbJgIk67eArZqCdsUinD18EWdSxONGWS25Qv/exec",
  // Тот же токен, что в Apps Script
  SECRET_TOKEN: "a3f8c9d2e1b74f6a8c5d3e9f1b2a7c4d8e6f0a3b5c7d9e1f2a4b6c8d0e2f4a6b",

  STORAGE_KEY: "fantasyMapData_v1",
  AUTOSAVE_KEY: "fantasyMapAutosave_v1",
  AUTOSAVE_INTERVAL_MS: 5 * 60 * 1000,
  AUTOSAVE_MAX: 5,
  DEFAULT_WALK: 1,
  DEFAULT_CART: 1.5,
  EXPORT_VERSION: 1
};

const $ = id => document.getElementById(id);
