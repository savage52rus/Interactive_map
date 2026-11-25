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
    },
    {
      title: "Городские стены",
      render: (base, c, dark) => `
        <path ${base} d="M6 55 L6 28 L12 28 L12 22 L18 22 L18 28 L25 28 L25 14 L32 9 L39 14 L39 28 L46 28 L46 22 L52 22 L52 28 L58 28 L58 55 Z"/>
        <path fill="${dark}" d="M24 55 L24 39 A8 8 0 0 1 40 39 L40 55 Z"/>
        <rect fill="${dark}" x="11" y="35" width="5" height="8"/>
        <rect fill="${dark}" x="48" y="35" width="5" height="8"/>
        <circle fill="${dark}" cx="32" cy="21" r="3"/>`
    },
    {
      title: "Морской маяк",
      render: (base, c, dark) => `
        <path ${base} d="M22 52 L26 22 L38 22 L42 52 Z"/>
        <rect ${base} x="24" y="18" width="16" height="4" rx="1"/>
        <rect ${base} x="27" y="11" width="10" height="7"/>
        <path ${base} d="M25 11 L32 6 L39 11 Z"/>
        <path stroke="${c}" stroke-width="2.5" stroke-linecap="round" d="M18 14 L9 10 M18 17 L8 18 M46 14 L55 10 M46 17 L56 18"/>
        <path fill="${dark}" d="M25 32 L39 29 L39 35 L25 38 Z"/>
        <path ${base} d="M10 54 Q18 49 26 54 T42 54 T54 54 L54 58 L10 58 Z"/>`
    },
    {
      title: "Академия и свитки",
      render: (base, c, dark) => `
        <path ${base} d="M12 26 C12 12 52 12 52 26 Z"/>
        <rect ${base} x="10" y="26" width="44" height="5" rx="1"/>
        <path ${base} d="M10 35 Q21 31 32 36 Q43 31 54 35 L54 54 Q43 50 32 55 Q21 50 10 54 Z"/>
        <path stroke="${dark}" stroke-width="2" d="M32 36 L32 55 M16 41 L27 43 M16 47 L27 49 M37 43 L48 41 M37 49 L48 47"/>
        <circle fill="${dark}" cx="32" cy="19" r="3"/>`
    },
    {
      title: "Большая арена",
      render: (base, c, dark) => `
        <path ${base} d="M6 54 L6 24 L14 20 L24 22 L36 18 L48 22 L58 26 L58 54 Z"/>
        <rect fill="${dark}" x="11" y="29" width="6" height="9" rx="3"/>
        <rect fill="${dark}" x="21" y="29" width="6" height="9" rx="3"/>
        <rect fill="${dark}" x="31" y="29" width="6" height="9" rx="3"/>
        <rect fill="${dark}" x="41" y="29" width="6" height="9" rx="3"/>
        <rect fill="${dark}" x="11" y="43" width="6" height="11" rx="3"/>
        <rect fill="${dark}" x="23" y="43" width="8" height="11" rx="4"/>
        <rect fill="${dark}" x="37" y="43" width="6" height="11" rx="3"/>
        <rect fill="${dark}" x="47" y="43" width="6" height="11" rx="3"/>`
    },
    {
      title: "Монетный двор",
      render: (base, c, dark) => `
        <circle ${base} cx="32" cy="32" r="23"/>
        <circle fill="none" stroke="${dark}" stroke-width="2" cx="32" cy="32" r="17"/>
        <path fill="${dark}" d="M32 19 L36 28 L45 32 L36 36 L32 45 L28 36 L19 32 L28 28 Z"/>
        <circle fill="${c}" cx="32" cy="32" r="3.5"/>`
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
    },
    {
      title: "Сельский колодец",
      render: (base, c, dark) => `
        <path ${base} d="M10 24 L32 9 L54 24 L48 24 L32 13 L16 24 Z"/>
        <rect ${base} x="16" y="23" width="5" height="17"/>
        <rect ${base} x="43" y="23" width="5" height="17"/>
        <rect ${base} x="20" y="27" width="24" height="4" rx="1"/>
        <rect ${base} x="28" y="31" width="8" height="7" rx="1"/>
        <rect ${base} x="13" y="40" width="38" height="16" rx="2"/>
        <path stroke="${dark}" stroke-width="1.8" d="M13 48 L51 48 M25 40 L25 48 M39 40 L39 48 M32 48 L32 56"/>`
    },
    {
      title: "Рыбацкий причал",
      render: (base, c, dark) => `
        <path ${base} d="M29 12 L29 36 L14 36 Z"/>
        <path ${base} d="M33 16 L48 36 L33 36 Z"/>
        <rect ${base} x="29" y="10" width="4" height="30"/>
        <path ${base} d="M8 39 L56 39 L48 51 L16 51 Z"/>
        <path ${base} d="M8 54 Q18 49 28 54 T48 54 T58 54 L58 58 L8 58 Z"/>`
    },
    {
      title: "Лесопилка",
      render: (base, c, dark) => `
        <path ${base} d="M32 10 L36 15 L42 12 L43 18 L50 18 L48 24 L54 28 L49 32 L52 38 L44 39 L20 39 L12 38 L15 32 L10 28 L16 24 L14 18 L21 18 L22 12 L28 15 Z"/>
        <circle fill="${dark}" cx="32" cy="27" r="5"/>
        <rect ${base} x="8" y="38" width="48" height="6" rx="2"/>
        <circle ${base} cx="18" cy="51" r="6"/>
        <circle ${base} cx="32" cy="51" r="6"/>
        <circle ${base} cx="46" cy="51" r="6"/>
        <circle fill="${dark}" cx="18" cy="51" r="2"/>
        <circle fill="${dark}" cx="32" cy="51" r="2"/>
        <circle fill="${dark}" cx="46" cy="51" r="2"/>`
    },
    {
      title: "Пасека и луга",
      render: (base, c, dark) => `
        <ellipse ${base} cx="32" cy="15" rx="10" ry="5"/>
        <ellipse ${base} cx="32" cy="23" rx="14" ry="5.5"/>
        <ellipse ${base} cx="32" cy="32" rx="17" ry="6"/>
        <ellipse ${base} cx="32" cy="41" rx="15" ry="5.5"/>
        <rect ${base} x="14" y="47" width="36" height="5" rx="2"/>
        <rect ${base} x="18" y="52" width="5" height="6"/>
        <rect ${base} x="41" y="52" width="5" height="6"/>
        <circle fill="${dark}" cx="32" cy="32" r="3.5"/>`
    },
    {
      title: "Каменная переправа",
      render: (base, c, dark) => `
        <path ${base} d="M6 34 Q32 18 58 34 L58 52 L48 52 C48 38 16 38 16 52 L6 52 Z"/>
        <path stroke="${dark}" stroke-width="1.8" fill="none" d="M6 29 Q32 13 58 29"/>
        <path stroke="${dark}" stroke-width="1.6" d="M18 23 L18 30 M32 20 L32 26 M46 23 L46 30"/>
        <path ${base} d="M12 54 Q22 50 32 54 T52 54 L52 58 L12 58 Z"/>`
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
    },
    {
      title: "Рыцарский шлем",
      render: (base, c, dark) => `
        <path ${base} d="M24 14 Q32 6 44 12 Q38 15 36 18 Z"/>
        <path ${base} d="M16 30 C16 17 48 17 48 30 L50 52 L38 56 L26 56 L14 52 Z"/>
        <path fill="${dark}" d="M20 32 L30 34 L30 38 L20 36 Z M44 32 L34 34 L34 38 L44 36 Z"/>
        <rect fill="${dark}" x="30.5" y="24" width="3" height="28"/>
        <circle fill="${dark}" cx="24" cy="45" r="1.5"/>
        <circle fill="${dark}" cx="40" cy="45" r="1.5"/>`
    },
    {
      title: "Сигнальный огонь",
      render: (base, c, dark) => `
        <path ${base} d="M32 7 C40 16 44 22 39 29 C43 26 45 31 41 36 L23 36 C19 31 21 26 25 29 C20 22 24 16 32 7 Z"/>
        <path fill="${dark}" d="M32 18 C35 23 36 27 32 33 C28 27 29 23 32 18 Z"/>
        <path ${base} d="M14 36 L50 36 L44 45 L20 45 Z"/>
        <path ${base} d="M18 56 L22 45 L42 45 L46 56 Z"/>`
    },
    {
      title: "Осадное орудие",
      render: (base, c, dark) => `
        <rect ${base} x="10" y="44" width="44" height="6" rx="2"/>
        <path ${base} d="M20 44 L30 24 L35 24 L27 44 Z"/>
        <path ${base} d="M44 44 L34 24 L29 24 L37 44 Z"/>
        <path ${base} d="M12 16 L48 34 L46 38 L10 20 Z"/>
        <circle ${base} cx="13" cy="15" r="6"/>
        <circle ${base} cx="19" cy="51" r="6.5"/>
        <circle ${base} cx="45" cy="51" r="6.5"/>
        <circle fill="${dark}" cx="19" cy="51" r="2.2"/>
        <circle fill="${dark}" cx="45" cy="51" r="2.2"/>`
    },
    {
      title: "Боевая секира",
      render: (base, c, dark) => `
        <rect ${base} x="29.5" y="10" width="5" height="48" rx="2"/>
        <path ${base} d="M29 18 C17 12 10 18 10 28 C10 38 17 44 29 38 Z"/>
        <path ${base} d="M35 18 C47 12 54 18 54 28 C54 38 47 44 35 38 Z"/>
        <circle fill="${dark}" cx="32" cy="28" r="3"/>`
    },
    {
      title: "Горный бастион",
      render: (base, c, dark) => `
        <path ${base} d="M6 56 L14 34 L26 30 L38 30 L50 34 L58 56 Z"/>
        <path ${base} d="M18 33 L18 14 L23 14 L23 19 L29 19 L29 14 L35 14 L35 19 L41 19 L41 14 L46 14 L46 33 Z"/>
        <rect fill="${dark}" x="29" y="23" width="6" height="8" rx="3"/>
        <path stroke="${dark}" stroke-width="1.8" fill="none" d="M18 46 L28 40 L36 44 L46 39"/>`
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
    },
    {
      title: "Огненный вулкан",
      render: (base, c, dark) => `
        <circle ${base} cx="26" cy="14" r="5"/>
        <circle ${base} cx="36" cy="11" r="6"/>
        <circle ${base} cx="43" cy="16" r="4"/>
        <path ${base} d="M6 55 L22 25 L42 25 L58 55 Z"/>
        <path fill="${dark}" d="M24 25 L29 37 L33 31 L37 42 L41 25 Z"/>`
    },
    {
      title: "Горный водопад",
      render: (base, c, dark) => `
        <path ${base} d="M6 16 L24 16 L24 48 L6 48 Z"/>
        <path ${base} d="M40 16 L58 16 L58 48 L40 48 Z"/>
        <path ${base} d="M24 16 L40 16 L42 50 L22 50 Z"/>
        <path stroke="${dark}" stroke-width="2" d="M28 19 L27 46 M32 19 L32 48 M36 19 L37 46"/>
        <circle ${base} cx="20" cy="52" r="5"/>
        <circle ${base} cx="32" cy="53" r="6"/>
        <circle ${base} cx="44" cy="52" r="5"/>`
    },
    {
      title: "Болота и топи",
      render: (base, c, dark) => `
        <path stroke="${c}" stroke-width="3" stroke-linecap="round" d="M22 44 L20 12 M32 44 L32 9 M42 44 L44 14"/>
        <rect ${base} x="17.5" y="16" width="5" height="11" rx="2.5"/>
        <rect ${base} x="29.5" y="13" width="5" height="12" rx="2.5"/>
        <rect ${base} x="41" y="18" width="5" height="10" rx="2.5"/>
        <path ${base} d="M12 45 L22 33 M52 45 L42 33"/>
        <ellipse ${base} cx="32" cy="49" rx="24" ry="5"/>
        <ellipse fill="${dark}" cx="32" cy="49" rx="14" ry="2"/>`
    },
    {
      title: "Пустынный оазис",
      render: (base, c, dark) => `
        <circle ${base} cx="47" cy="15" r="6"/>
        <path ${base} d="M24 44 Q25 28 22 20 L27 20 Q30 28 29 44 Z"/>
        <path ${base} d="M24 20 Q12 16 9 25 Q17 23 24 23 Z"/>
        <path ${base} d="M25 19 Q18 9 11 13 Q18 16 24 20 Z"/>
        <path ${base} d="M26 20 Q36 11 41 18 Q33 18 27 22 Z"/>
        <path ${base} d="M27 22 Q38 20 40 28 Q33 25 27 24 Z"/>
        <path ${base} d="M6 54 Q20 40 36 49 Q47 43 58 54 Z"/>`
    },
    {
      title: "Ледяные пики",
      render: (base, c, dark) => `
        <path ${base} d="M10 54 L18 24 L26 54 Z"/>
        <path ${base} d="M38 54 L46 22 L54 54 Z"/>
        <path ${base} d="M20 54 L32 8 L44 54 Z"/>
        <path stroke="${dark}" stroke-width="1.6" d="M32 12 L32 52 M18 28 L18 52 M46 26 L46 52"/>
        <rect ${base} x="6" y="52" width="52" height="5" rx="2"/>`
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
      title: "Античные колонны",
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
    },
    {
      title: "Магический портал",
      render: (base, c, dark) => `
        <path ${base} d="M12 54 L12 30 A20 20 0 0 1 52 30 L52 54 L44 54 L44 30 A12 12 0 0 0 20 30 L20 54 Z"/>
        <rect ${base} x="8" y="52" width="48" height="5" rx="1"/>
        <ellipse ${base} cx="32" cy="35" rx="8" ry="13"/>
        <path stroke="${dark}" stroke-width="2" fill="none" d="M32 26 C37 29 37 41 32 41 C28 41 28 33 32 33"/>`
    },
    {
      title: "Шахта и рудник",
      render: (base, c, dark) => `
        <path ${base} d="M12 55 L16 24 L48 24 L52 55 L44 55 L41 31 L23 31 L20 55 Z"/>
        <rect ${base} x="11" y="20" width="42" height="6" rx="1"/>
        <path ${base} d="M22 36 L42 54 L39 57 L19 39 Z"/>
        <path ${base} d="M42 36 L22 54 L25 57 L45 39 Z"/>
        <path ${base} d="M16 42 Q22 33 30 38 Z"/>
        <path ${base} d="M48 42 Q42 33 34 38 Z"/>`
    },
    {
      title: "Логово чудовища",
      render: (base, c, dark) => `
        <path ${base} d="M18 22 Q8 14 10 8 Q16 10 22 18 Z"/>
        <path ${base} d="M46 22 Q56 14 54 8 Q48 10 42 18 Z"/>
        <path ${base} d="M16 30 C16 15 48 15 48 30 C48 38 44 42 42 45 L42 54 L22 54 L22 45 C20 42 16 38 16 30 Z"/>
        <circle fill="${dark}" cx="25" cy="32" r="4"/>
        <circle fill="${dark}" cx="39" cy="32" r="4"/>
        <path fill="${dark}" d="M30 40 L32 36 L34 40 Z"/>
        <path stroke="${dark}" stroke-width="2" d="M27 48 L27 54 M32 48 L32 54 M37 48 L37 54"/>`
    },
    {
      title: "Древний обелиск",
      render: (base, c, dark) => `
        <path ${base} d="M24 48 L27 16 L32 8 L37 16 L40 48 Z"/>
        <rect ${base} x="18" y="48" width="28" height="5" rx="1"/>
        <rect ${base} x="13" y="53" width="38" height="4" rx="1"/>
        <path stroke="${dark}" stroke-width="2" fill="none" d="M32 18 L32 42 M29 24 L35 28 L29 32 L35 36"/>`
    },
    {
      title: "Курган и погост",
      render: (base, c, dark) => `
        <path ${base} d="M20 48 L20 22 A12 12 0 0 1 44 22 L44 48 Z"/>
        <path stroke="${dark}" stroke-width="2.5" stroke-linecap="round" d="M32 18 L32 36 M25 25 L39 25"/>
        <path ${base} d="M8 56 Q32 42 56 56 Z"/>`
    }
  ]
};

/* Пять особых иконок, доступных исключительно в окне редактирования конкретного маркера */
const SPECIAL_MARKER_ICONS = [
  {
    key: "special:cross",
    title: "Х",
    render: (base, c, dark) => `
      <path ${base} d="M14 9 L23 9 L32 22 L41 9 L50 9 L38 28 L52 53 L42 53 L32 36 L22 53 L12 53 L26 28 Z"/>
      <path stroke="${dark}" stroke-width="1.5" fill="none" d="M19 13 L45 49 M45 13 L19 49"/>`
  },
  {
    key: "special:ruined_city",
    title: "Руины города",
    render: (base, c, dark) => `
      <path ${base} d="M6 54 L6 34 L12 31 L15 37 L18 24 L24 27 L27 19 L33 25 L36 16 L41 23 L45 33 L50 28 L56 36 L56 54 Z"/>
      <path stroke="${dark}" stroke-width="1.8" fill="none" d="M27 23 L30 34 L26 42 M41 26 L38 36"/>
      <rect fill="${dark}" x="12" y="40" width="5" height="6"/>
      <path fill="${dark}" d="M26 54 L26 44 L32 41 L37 46 L37 54 Z"/>
      <polygon ${base} points="49,49 58,47 60,54 47,54"/>
      <polygon ${base} points="4,50 11,48 13,54 3,54"/>`
  },
  {
    key: "special:razed_village",
    title: "Разорённая деревня",
    render: (base, c, dark) => `
      <path ${base} d="M9 39 L21 25 L29 33 L35 28 L49 41 L46 43 L35 33 L28 39 L20 31 L12 41 Z"/>
      <path ${base} d="M13 38 L15 55 L46 55 L44 39 L35 42 L28 37 L21 41 Z"/>
      <path stroke="${c}" stroke-width="2.5" stroke-linecap="round" d="M18 22 L28 14 M38 25 L49 17"/>
      <path stroke="${dark}" stroke-width="1.2" stroke-linecap="round" d="M18 22 L28 14 M38 25 L49 17"/>
      <path fill="${dark}" d="M25 55 L27 45 L35 47 L34 55 Z"/>
      <polygon ${base} points="48,50 57,48 59,55 46,55"/>`
  },
  {
    key: "special:ruined_castle",
    title: "Руины замка",
    render: (base, c, dark) => `
      <path ${base} d="M6 55 L6 26 L12 26 L12 20 L18 20 L18 28 L23 34 L29 31 L34 39 L40 34 L43 22 L49 25 L54 19 L58 27 L58 55 Z"/>
      <path fill="${dark}" d="M25 55 L26 43 L33 40 L38 45 L39 55 Z"/>
      <path stroke="${dark}" stroke-width="1.8" fill="none" d="M15 28 L19 38 L16 46 M48 28 L45 39"/>
      <polygon ${base} points="29,21 36,18 38,25 31,27"/>
      <polygon ${base} points="49,49 59,47 61,55 47,55"/>`
  },
  {
    key: "special:excl",
    title: "!",
    render: (base, c, dark) => `
      <path ${base} d="M25 8 L39 8 L36 39 L28 39 Z"/>
      <circle ${base} cx="32" cy="50" r="6.5"/>
      <path stroke="${dark}" stroke-width="1.5" stroke-linecap="round" d="M32 13 L32 34"/>`
  }
];

function sanitizeMarkerIcon(rawIcon) {
  if (typeof rawIcon !== "string") return "";
  const key = rawIcon.trim();
  if (!key) return "";
  if (SPECIAL_MARKER_ICONS.some(s => s.key === key)) return key;
  const m = key.match(/^([a-z]+):(\d+)$/);
  if (!m) return "";
  const typeKey = m[1];
  const idx = parseInt(m[2], 10);
  const list = ICON_VARIANTS[typeKey];
  if (list && idx >= 0 && idx < list.length) return `${typeKey}:${idx}`;
  return "";
}

function getCustomIconMeta(iconKey) {
  const clean = sanitizeMarkerIcon(iconKey);
  if (!clean) return null;
  const spec = SPECIAL_MARKER_ICONS.find(s => s.key === clean);
  if (spec) return { key: spec.key, title: spec.title, render: spec.render, isSpecial: true };
  const [typeKey, idxStr] = clean.split(":");
  const idx = parseInt(idxStr, 10);
  const v = ICON_VARIANTS[typeKey] && ICON_VARIANTS[typeKey][idx];
  if (!v) return null;
  return { key: clean, title: v.title, type: typeKey, idx, render: v.render, isSpecial: false };
}

function getTypeIconIndex(type) {
  const variants = ICON_VARIANTS[type];
  if (!variants || !variants.length) return 0;
  const activeMap = (typeof draftTypeIcons === "function") ? draftTypeIcons() : null;
  const idx = activeMap && Number.isInteger(activeMap[type]) ? activeMap[type] : 0;
  return (idx >= 0 && idx < variants.length) ? idx : 0;
}

function svgSprite(type, color, customOrVariant) {
  const c = color || "#c9a227";
  const dark = "#1a1510";
  const base = `fill="${c}" stroke="${dark}" stroke-width="1.5" stroke-linejoin="round"`;

  if (typeof customOrVariant === "string" && customOrVariant.trim()) {
    const meta = getCustomIconMeta(customOrVariant);
    if (meta) {
      return `<svg viewBox="0 0 64 64">${meta.render(base, c, dark)}</svg>`;
    }
  }

  const variants = ICON_VARIANTS[type];
  if (!variants || !variants.length) {
    return `<svg viewBox="0 0 64 64"><circle ${base} cx="32" cy="32" r="22"/></svg>`;
  }
  const idx = Number.isInteger(customOrVariant) && customOrVariant >= 0 && customOrVariant < variants.length
    ? customOrVariant
    : getTypeIconIndex(type);
  return `<svg viewBox="0 0 64 64">${variants[idx].render(base, c, dark)}</svg>`;
}
