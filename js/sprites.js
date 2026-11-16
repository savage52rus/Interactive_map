function svgSprite(type, color) {
  const c = color || "#c9a227";
  const dark = "#1a1510";
  const base = `fill="${c}" stroke="${dark}" stroke-width="1.5" stroke-linejoin="round"`;
  switch (type) {
    case "city":
      return `<svg viewBox="0 0 64 64">
        <path ${base} d="M8 54 L8 26 L16 26 L16 18 L24 18 L24 26 L32 26 L32 12 L40 12 L40 26 L48 26 L48 18 L56 18 L56 26 L56 54 Z"/>
        <rect fill="${dark}" x="14" y="34" width="6" height="8"/>
        <rect fill="${dark}" x="29" y="30" width="6" height="8"/>
        <rect fill="${dark}" x="44" y="34" width="6" height="8"/>
        <rect fill="${dark}" x="24" y="44" width="16" height="10" rx="8"/>
      </svg>`;
    case "village":
      return `<svg viewBox="0 0 64 64">
        <path ${base} d="M6 40 L18 28 L30 40 L30 56 L6 56 Z"/>
        <path ${base} d="M28 46 L40 34 L52 46 L52 56 L28 56 Z"/>
        <path fill="${dark}" d="M14 48 L22 48 L22 56 L14 56 Z"/>
        <path fill="${dark}" d="M36 50 L44 50 L44 56 L36 56 Z"/>
      </svg>`;
    case "fortress":
      return `<svg viewBox="0 0 64 64">
        <path ${base} d="M6 56 L6 30 L12 30 L12 24 L18 24 L18 30 L24 30 L24 56 Z"/>
        <path ${base} d="M40 56 L40 30 L46 30 L46 24 L52 24 L52 30 L58 30 L58 56 Z"/>
        <path ${base} d="M24 56 L24 38 L40 38 L40 56 Z"/>
        <rect fill="${dark}" x="28" y="44" width="8" height="12" rx="4"/>
        <path fill="${c}" stroke="${dark}" stroke-width="1.5" d="M46 24 L46 12 L58 16 L46 20"/>
      </svg>`;
    case "nature":
      return `<svg viewBox="0 0 64 64">
        <path ${base} d="M4 54 L22 22 L34 44 L42 30 L60 54 Z"/>
        <path fill="${dark}" d="M22 22 L28 34 L22 38 L16 34 Z"/>
        <path fill="${dark}" d="M42 30 L46 38 L42 40 L38 38 Z"/>
        <path fill="${c}" stroke="${dark}" stroke-width="1.5" d="M18 52 L18 44 L22 40 L26 44 L26 52 Z"/>
      </svg>`;
    case "poi":
      return `<svg viewBox="0 0 64 64">
        <path ${base} d="M32 6 L40 26 L60 32 L40 38 L32 58 L24 38 L4 32 L24 26 Z"/>
        <circle fill="${dark}" cx="32" cy="32" r="5"/>
      </svg>`;
    default:
      return `<svg viewBox="0 0 64 64"><circle ${base} cx="32" cy="32" r="22"/></svg>`;
  }
}
