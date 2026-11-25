const ICON_VARIANTS = {
  city: [
    {
      title: "Ратуша и башни",
      render: (base, c, dark) => `
        <path ${base} d="M8 54 L8 26 L16 26 L16 18 L24 18 L24 26 L32 26 L32 12 L40 12 L40 26 L48 26 L48 18 L56 18 L56 26 L56 54 Z"/>
        <rect fill="${dark}" x="14" y="34" width="6" height="8"/>
        <rect fill="${dark}" x="29" y="30" width="6" height="8"/>
        <rect fill="${dark}" x="44" y="34" width="6" height="8"/>
        <rect fill="${dark}" x="24" y="44" width="16" height="10" rx="8"/>`
    },
    {
      title: "Корона столицы",
      render: (base, c, dark) => `
        <path ${base} d="M8 46 L6 20 L19 31 L32 14 L45 31 L58 20 L56 46 Z"/>
        <rect ${base} x="8" y="46" width="48" height="8" rx="2"/>
        <circle fill="${dark}" cx="32" cy="36" r="3.5"/>
        <circle fill="${dark}" cx="18" cy="39" r="2.5"/>
        <circle fill="${dark}" cx="46" cy="39" r="2.5"/>`
    },
    {
      title: "Великий собор",
      render: (base, c, dark) => `
        <path ${base} d="M10 56 L10 24 L14 14 L18 24 L18 56 Z"/>
        <path ${base} d="M46 56 L46 24 L50 14 L54 24 L54 56 Z"/>
        <path ${base} d="M18 56 L18 36 C18 22 46 22 46 36 L46 56 Z"/>
        <path stroke="${c}" stroke-width="3.5" stroke-linecap="round" d="M32 9 L32 22 M27 14 L37 14"/>
        <path stroke="${dark}" stroke-width="1.5" stroke-linecap="round" d="M32 9 L32 22 M27 14 L37 14"/>
        <path fill="${dark}" d="M27 56 L27 43 A5 5 0 0 1 37 43 L37 56 Z"/>
        <circle fill="${dark}" cx="32" cy="33" r="3"/>`
    },
    {
      title: "Торговые весы",
      render: (base, c, dark) => `
        <rect ${base} x="20" y="52" width="24" height="6" rx="2"/>
        <rect ${base} x="29" y="14" width="6" height="38"/>
        <circle ${base} cx="32" cy="12" r="4"/>
        <rect ${base} x="10" y="18" width="44" height="4" rx="2"/>
        <path stroke="${c}" stroke-width="2.5" d="M14 22 L9 36 M14 22 L19 36 M50 22 L45 36 M50 22 L55 36"/>
        <path stroke="${dark}" stroke-width="1.2" d="M14 22 L9 36 M14 22 L19 36 M50 22 L45 36 M50 22 L55 36"/>
        <path ${base} d="M6 36 Q14 45 22 36 Z"/>
        <path ${base} d="M42 36 Q50 45 58 36 Z"/>`
    },
    {
      title: "Портовая гавань",
      render: (base, c, dark) => `
        <circle ${base} cx="32" cy="13" r="5.5"/>
        <circle fill="${dark}" cx="32" cy="13" r="2"/>
        <rect ${base} x="29" y="18" width="6" height="34" rx="2"/>
        <rect ${base} x="19" y="23" width="26" height="5" rx="2"/>
        <path ${base} d="M10 38 L18 36 L16 43 C20 49 26 51 32 51 C38 51 44 49 48 43 L46 36 L54 38 L53 48 C47 55 40 58 32 58 C24 58 17 55 11 48 Z"/>`
    }
  ],

  village: [
    {
      title: "Деревенские домики",
      render: (base, c, dark) => `
        <path ${base} d="M6 40 L18 28 L30 40 L30 56 L6 56 Z"/>
        <path ${base} d="M28 46 L40 34 L52 46 L52 56 L28 56 Z"/>
        <path fill="${dark}" d="M14 48 L22 48 L22 56 L14 56 Z"/>
        <path fill="${dark}" d="M36 50 L44 50 L44 56 L36 56 Z"/>`
    },
    {
      title: "Ветряная мельница",
      render: (base, c, dark) => `
        <path ${base} d="M22 56 L26 26 L38 26 L42 56 Z"/>
        <path ${base} d="M24 26 Q32 18 40 26 Z"/>
        <path ${base} d="M32 28 L12 10 L17 7 L32 24 Z"/>
        <path ${base} d="M32 28 L52 10 L47 7 L32 24 Z"/>
        <path ${base} d="M32 28 L52 46 L47 49 L32 32 Z"/>
        <path ${base} d="M32 28 L12 46 L17 49 L32 32 Z"/>
        <circle fill="${dark}" cx="32" cy="28" r="3"/>
        <path fill="${dark}" d="M29 56 L29 47 A3 3 0 0 1 35 47 L35 56 Z"/>`
    },
    {
      title: "Ферма и сноп",
      render: (base, c, dark) => `
        <path ${base} d="M23 56 L28 37 L36 37 L41 56 Z"/>
        <ellipse ${base} cx="32" cy="18" rx="4" ry="11"/>
        <ellipse ${base} cx="22" cy="22" rx="4" ry="10" transform="rotate(-22 22 22)"/>
        <ellipse ${base} cx="42" cy="22" rx="4" ry="10" transform="rotate(22 42 22)"/>
        <ellipse ${base} cx="15" cy="28" rx="3.5" ry="8" transform="rotate(-40 15 28)"/>
        <ellipse ${base} cx="49" cy="28" rx="3.5" ry="8" transform="rotate(40 49 28)"/>
        <rect ${base} x="24" y="34" width="16" height="5" rx="2"/>`
    },
    {
      title: "Кузница ремесленников",
      render: (base, c, dark) => `
        <path ${base} d="M18 55 L22 45 L42 45 L46 55 Z"/>
        <path ${base} d="M8 33 L22 30 L22 28 L50 28 L50 36 L40 39 L40 45 L24 45 L24 39 L16 37 Z"/>
        <rect ${base} x="31" y="11" width="5" height="15" transform="rotate(25 33 18)"/>
        <rect ${base} x="25" y="8" width="16" height="7" rx="1.5" transform="rotate(25 33 11)"/>`
    },
    {
      title: "Постоялый двор",
      render: (base, c, dark) => `
        <rect ${base} x="41" y="13" width="7" height="16"/>
        <path ${base} d="M12 34 L12 56 L52 56 L52 34 Z"/>
        <path ${base} d="M6 36 L32 14 L58 36 L52 36 L32 20 L12 36 Z"/>
        <rect fill="${dark}" x="19" y="40" width="9" height="9" rx="1"/>
        <path fill="${dark}" d="M35 56 L35 42 A5 5 0 0 1 45 42 L45 56 Z"/>`
    }
  ],

  fortress: [
    {
      title: "Замок со знаменем",
      render: (base, c, dark) => `
        <path ${base} d="M6 56 L6 30 L12 30 L12 24 L18 24 L18 30 L24 30 L24 56 Z"/>
        <path ${base} d="M40 56 L40 30 L46 30 L46 24 L52 24 L52 30 L58 30 L58 56 Z"/>
        <path ${base} d="M24 56 L24 38 L40 38 L40 56 Z"/>
        <rect fill="${dark}" x="28" y="44" width="8" height="12" rx="4"/>
        <path fill="${c}" stroke="${dark}" stroke-width="1.5" d="M46 24 L46 12 L58 16 L46 20"/>`
    },
    {
      title: "Сторожевая башня",
      render: (base, c, dark) => `
        <path ${base} d="M16 56 L20 22 L16 22 L16 10 L23 10 L23 16 L29 16 L29 10 L35 10 L35 16 L41 16 L41 10 L48 10 L48 22 L44 22 L48 56 Z"/>
        <rect fill="${dark}" x="30" y="26" width="4" height="11" rx="1"/>
        <path fill="${dark}" d="M27 56 L27 45 A5 5 0 0 1 37 45 L37 56 Z"/>`
    },
    {
      title: "Щит и мечи",
      render: (base, c, dark) => `
        <path ${base} d="M10 12 L15 10 L54 49 L50 53 L11 14 Z"/>
        <path ${base} d="M54 12 L49 10 L10 49 L14 53 L53 14 Z"/>
        <path ${base} d="M18 16 L46 16 L46 33 C46 45 32 54 32 54 C32 54 18 45 18 33 Z"/>
        <path fill="${dark}" d="M30 22 L34 22 L34 30 L40 30 L40 34 L34 34 L34 44 L30 44 L30 34 L24 34 L24 30 L30 30 Z"/>`
    },
    {
      title: "Укреплённые ворота",
      render: (base, c, dark) => `
        <path ${base} d="M8 56 L8 18 L15 18 L15 12 L23 12 L23 18 L41 18 L41 12 L49 12 L49 18 L56 18 L56 56 Z"/>
        <path fill="${dark}" d="M20 56 L20 34 A12 12 0 0 1 44 34 L44 56 Z"/>
        <path stroke="${c}" stroke-width="2" d="M26 24 L26 56 M32 22 L32 56 M38 24 L38 56 M20 35 L44 35 M20 45 L44 45"/>`
    },
    {
      title: "Военный лагерь",
      render: (base, c, dark) => `
        <path fill="${c}" stroke="${dark}" stroke-width="1.5" d="M32 8 L32 21 M32 8 L46 13 L32 18 Z"/>
        <path ${base} d="M6 55 L14 35 L32 21 L50 35 L58 55 Z"/>
        <path fill="${dark}" d="M25 55 L32 37 L39 55 Z"/>
        <path stroke="${dark}" stroke-width="1.5" d="M14 35 L50 35"/>`
    }
  ],

  nature: [
    {
      title: "Горные вершины",
      render: (base, c, dark) => `
        <path ${base} d="M4 54 L22 22 L34 44 L42 30 L60 54 Z"/>
        <path fill="${dark}" d="M22 22 L28 34 L22 38 L16 34 Z"/>
        <path fill="${dark}" d="M42 30 L46 38 L42 40 L38 38 Z"/>
        <path fill="${c}" stroke="${dark}" stroke-width="1.5" d="M18 52 L18 44 L22 40 L26 44 L26 52 Z"/>`
    },
    {
      title: "Хвойный лес",
      render: (base, c, dark) => `
        <path ${base} d="M16 24 L6 40 L12 40 L5 52 L27 52 L20 40 L26 40 Z"/>
        <path ${base} d="M48 24 L38 40 L44 40 L37 52 L59 52 L52 40 L58 40 Z"/>
        <rect fill="${dark}" x="29" y="48" width="6" height="9"/>
        <path ${base} d="M32 10 L19 28 L25 28 L17 40 L24 40 L16 50 L48 50 L40 40 L47 40 L39 28 L45 28 Z"/>`
    },
    {
      title: "Древнее древо",
      render: (base, c, dark) => `
        <circle ${base} cx="21" cy="27" r="10"/>
        <circle ${base} cx="43" cy="27" r="10"/>
        <circle ${base} cx="32" cy="19" r="12"/>
        <circle ${base} cx="32" cy="30" r="10"/>
        <path ${base} d="M27 34 L26 48 L18 56 L28 54 L32 56 L36 54 L46 56 L38 48 L37 34 Z"/>`
    },
    {
      title: "Озеро и источник",
      render: (base, c, dark) => `
        <path ${base} d="M32 9 C32 9 42 21 42 27 A10 10 0 1 1 22 27 C22 21 32 9 32 9 Z"/>
        <path fill="${dark}" d="M28 23 A5 5 0 0 0 26 30 A6 6 0 0 1 28 23 Z"/>
        <path ${base} d="M6 43 Q14 37 22 43 T38 43 T58 43 L58 48 Q50 42 42 48 T26 48 T6 48 Z"/>
        <path ${base} d="M10 52 Q18 46 26 52 T42 52 T54 52 L54 57 Q46 51 38 57 T22 57 T10 57 Z"/>`
    },
    {
      title: "Пещера в скале",
      render: (base, c, dark) => `
        <path ${base} d="M6 54 L14 22 L25 14 L40 16 L52 24 L58 54 Z"/>
        <path fill="${dark}" d="M18 54 L20 35 L27 28 L37 28 L44 35 L46 54 Z"/>
        <path fill="${c}" d="M27 28 L29 36 L31 28 Z M34 28 L36 34 L38 28 Z"/>`
    }
  ],

  poi: [
    {
      title: "Звезда путника",
      render: (base, c, dark) => `
        <path ${base} d="M32 6 L40 26 L60 32 L40 38 L32 58 L24 38 L4 32 L24 26 Z"/>
        <circle fill="${dark}" cx="32" cy="32" r="5"/>`
    },
    {
      title: "Древний храм",
      render: (base, c, dark) => `
        <path ${base} d="M8 24 L32 10 L56 24 Z"/>
        <rect ${base} x="10" y="24" width="44" height="4"/>
        <rect ${base} x="14" y="28" width="6" height="20"/>
        <rect ${base} x="29" y="28" width="6" height="20"/>
        <rect ${base} x="44" y="28" width="6" height="20"/>
        <rect ${base} x="8" y="48" width="48" height="4"/>
        <rect ${base} x="5" y="52" width="54" height="4"/>`
    },
    {
      title: "Древние руины",
      render: (base, c, dark) => `
        <rect ${base} x="8" y="50" width="48" height="6" rx="1"/>
        <path ${base} d="M12 50 L12 18 L22 18 L22 50 Z"/>
        <rect ${base} x="10" y="14" width="14" height="4"/>
        <path ${base} d="M28 50 L28 28 L33 25 L38 31 L38 50 Z"/>
        <path ${base} d="M44 50 L44 38 L50 35 L54 40 L54 50 Z"/>
        <rect ${base} x="39" y="21" width="12" height="5" transform="rotate(28 45 23)"/>`
    },
    {
      title: "Тайник с сокровищами",
      render: (base, c, dark) => `
        <path ${base} d="M10 28 C10 17 54 17 54 28 L54 32 L10 32 Z"/>
        <rect ${base} x="10" y="32" width="44" height="22" rx="2"/>
        <rect fill="${dark}" x="18" y="21" width="4" height="33"/>
        <rect fill="${dark}" x="42" y="21" width="4" height="33"/>
        <rect ${base} x="27" y="28" width="10" height="11" rx="2"/>
        <circle fill="${dark}" cx="32" cy="33" r="2"/>`
    },
    {
      title: "Рунный кристалл",
      render: (base, c, dark) => `
        <path ${base} d="M18 56 L22 48 L42 48 L46 56 Z"/>
        <path ${base} d="M32 8 L45 24 L40 44 L24 44 L19 24 Z"/>
        <path stroke="${dark}" stroke-width="1.5" fill="none" d="M32 8 L32 44 M19 24 L32 29 L45 24"/>`
    }
  ]
};

function getTypeIconIndex(type) {
  const variants = ICON_VARIANTS[type];
  if (!variants || !variants.length) return 0;
  const activeMap = (typeof draftTypeIcons === "function") ? draftTypeIcons() : null;
  const idx = activeMap && Number.isInteger(activeMap[type]) ? activeMap[type] : 0;
  return (idx >= 0 && idx < variants.length) ? idx : 0;
}

function svgSprite(type, color, variantIndex) {
  const c = color || "#c9a227";
  const dark = "#1a1510";
  const base = `fill="${c}" stroke="${dark}" stroke-width="1.5" stroke-linejoin="round"`;
  const variants = ICON_VARIANTS[type];
  if (!variants || !variants.length) {
    return `<svg viewBox="0 0 64 64"><circle ${base} cx="32" cy="32" r="22"/></svg>`;
  }
  const idx = Number.isInteger(variantIndex) && variantIndex >= 0 && variantIndex < variants.length
    ? variantIndex
    : getTypeIconIndex(type);
  return `<svg viewBox="0 0 64 64">${variants[idx].render(base, c, dark)}</svg>`;
}
