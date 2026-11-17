const CONFIG = {
  MAP_SRC: "assets/map.jpg",
  ADMIN_LOGIN: "admin",
  ADMIN_PASS: "fantasy123",
  MIN_ADMIN_WIDTH: 900,

  // Включение/выключение линейки без удаления кода.
  // false — кнопка 📏 скрыта, режимы линейки принудительно выключены,
  //         но state.scale, draftScale, saveScale и drawMeasure продолжают работать.
  // true  — линейка возвращается как была.
  RULER_ENABLED: false,

  STORAGE_KEY: "fantasyMapData_v1",
  AUTOSAVE_KEY: "fantasyMapAutosave_v1",
  AUTOSAVE_INTERVAL_MS: 5 * 60 * 1000,
  AUTOSAVE_MAX: 5,
  DEFAULT_WALK: 1,
  DEFAULT_CART: 1.5,
  EXPORT_VERSION: 1
};

const $ = id => document.getElementById(id);