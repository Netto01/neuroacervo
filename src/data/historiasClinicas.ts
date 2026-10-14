export interface FaixaEtaria {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  light: string;
  accent: string;
  border: string;
}

export interface HistoriaEtapaObservar {
  pergunta: string;
  linhas: number;
}

export interface HistoriaEtapaPensamento {
  texto: string;
  pergunta: string;
}

export interface HistoriaEtapaParar {
  dica: string;
  pergunta: string;
  opcoes: string[];
}

export interface HistoriaClinica {
  num: number;
  titulo: string;
  theme: string;
  tag: string;
  image?: string;
  illo: string;
  historia: string;
  observar: HistoriaEtapaObservar;
  pensamento: HistoriaEtapaPensamento;
  parar: HistoriaEtapaParar;
}

export const FAIXAS: FaixaEtaria[] = [
  {
    id: "f1",
    label: "6–8 anos",
    sublabel: "Infantil I",
    icon: "ti-pencil",
    color: "#7C3AED",
    light: "#F3E8FF",
    accent: "#5B21B6",
    border: "#DDD6FE",
  },
  {
    id: "f2",
    label: "8–11 anos",
    sublabel: "Infantil II",
    icon: "ti-rocket",
    color: "#0284C7",
    light: "#E0F2FE",
    accent: "#075985",
    border: "#BAE6FD",
  },
  {
    id: "f3",
    label: "11–13 anos",
    sublabel: "Transição",
    icon: "ti-compass",
    color: "#059669",
    light: "#D1FAE5",
    accent: "#047857",
    border: "#A7F3D0",
  },
  {
    id: "f4",
    label: "14–16 anos",
    sublabel: "Adolescência",
    icon: "ti-bolt",
    color: "#D97706",
    light: "#FEF3C7",
    accent: "#B45309",
    border: "#FDE68A",
  },
  {
    id: "f5",
    label: "16–19 anos",
    sublabel: "Jovem adulto",
    icon: "ti-diploma",
    color: "#DB2777",
    light: "#FCE7F3",
    accent: "#BE185D",
    border: "#FBCFE8",
  },
];

// Helper figure generator for SVG illustrations
function figure(
  x: number,
  y: number,
  headFill: string,
  bodyStroke: string | null,
  mouth: string | null,
  arm1: [number, number] | null,
  arm2: [number, number] | null
) {
  const hx = x, hy = y;
  const parts = [
    `<circle cx="${hx}" cy="${hy}" r="9" fill="${headFill}" stroke="#C8C8C2" stroke-width="1"/>`,
    `<circle cx="${hx}" cy="${hy-3}" r="3.5" fill="#B0AFA8"/>`,
    `<line x1="${hx-7}" y1="${hy+8}" x2="${hx}" y2="${hy+2}" stroke="#B0AFA8" stroke-width="3.5" stroke-linecap="round"/>`,
    `<line x1="${hx+7}" y1="${hy+8}" x2="${hx}" y2="${hy+2}" stroke="#B0AFA8" stroke-width="3.5" stroke-linecap="round"/>`,
  ];
  if (arm1) parts.push(`<line x1="${hx}" y1="${hy+2}" x2="${arm1[0]}" y2="${arm1[1]}" stroke="#B0AFA8" stroke-width="2.8" stroke-linecap="round"/>`);
  if (arm2) parts.push(`<line x1="${hx}" y1="${hy+2}" x2="${arm2[0]}" y2="${arm2[1]}" stroke="#B0AFA8" stroke-width="2.8" stroke-linecap="round"/>`);
  if (mouth) parts.push(`<path d="${mouth}" stroke="${mouth.includes('Q') && mouth.includes(String(hy+12)) ? '#2D7A50' : '#C04040'}" stroke-width="1.3" stroke-linecap="round" fill="none"/>`);
  parts.push(
    `<line x1="${hx-6}" y1="${hy+17}" x2="${hx-9}" y2="${hy+28}" stroke="#B0AFA8" stroke-width="3" stroke-linecap="round"/>`,
    `<line x1="${hx+6}" y1="${hy+17}" x2="${hx+9}" y2="${hy+28}" stroke="#B0AFA8" stroke-width="3" stroke-linecap="round"/>`,
  );
  return parts.join('');
}

/* ──────────────────────────────────────────────────────────
   50 DEDICATED SVG ILLUSTRATIONS — 1 FOR EACH STORY
────────────────────────────────────────────────────────── */

// FAIXA 1 (6-8 anos)
export function svgF1H1() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F0EEF8"/>
    <rect x="22" y="58" width="116" height="36" rx="7" fill="#fff" stroke="#D5D2EE" stroke-width="1.2"/>
    <rect x="32" y="65" width="28" height="22" rx="4" fill="#F5F4FC" stroke="#D5D2EE" stroke-width="1"/>
    <rect x="66" y="65" width="28" height="22" rx="4" fill="#F5F4FC" stroke="#D5D2EE" stroke-width="1"/>
    <rect x="100" y="65" width="28" height="22" rx="4" fill="#F5F4FC" stroke="#D5D2EE" stroke-width="1"/>
    <circle cx="46" cy="76" r="4" fill="#A09DE0"/>
    <circle cx="78" cy="72" r="3" fill="#A09DE0"/><circle cx="78" cy="79" r="3" fill="#A09DE0"/>
    ${figure(50,28,'#FDECD5',null,`M44 38 Q50 35 56 38`,null,null)}
    ${figure(110,28,'#E5F3E8',null,`M104 38 Q110 42 116 38`,null,null)}
  </svg>`;
}

export function svgF1H2() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="35" y="30" width="90" height="55" rx="8" fill="#fff" stroke="#F59E0B" stroke-width="1.5"/>
    <rect x="45" y="20" width="70" height="12" rx="4" fill="#FBBF24"/>
    <path d="M55 45 Q70 65 85 45 Q100 65 115 45" stroke="#D97706" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="65" cy="62" r="5" fill="#EF4444"/>
    <circle cx="95" cy="62" r="5" fill="#10B981"/>
    ${figure(132,45,'#FDECD5',null,`M126 55 Q132 58 138 55`,null,null)}
  </svg>`;
}

export function svgF1H3() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#EEF5F2"/>
    <rect x="15" y="25" width="75" height="42" rx="10" fill="#fff" stroke="#A8D5BE" stroke-width="1.2"/>
    <line x1="28" y1="40" x2="75" y2="40" stroke="#A8D5BE" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="50" x2="60" y2="50" stroke="#A8D5BE" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 67 L18 78 L38 67Z" fill="#fff" stroke="#A8D5BE" stroke-width="1.2"/>
    ${figure(40,10,'#FDECD5',null,`M35 19 Q40 22 45 19`,[40-10,12],[40+14,2])}
    ${figure(125,40,'#E5ECF8',null,`M119 49 Q125 52 131 49`,null,null)}
  </svg>`;
}

export function svgF1H4() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F5F0E8"/>
    <rect x="55" y="40" width="50" height="32" rx="6" fill="#FAEBD5" stroke="#DDB87A" stroke-width="1.5"/>
    <circle cx="68" cy="58" r="6" fill="#DDB87A"/>
    <circle cx="92" cy="58" r="6" fill="#DDB87A"/>
    ${figure(30,52,'#E5ECF8',null,`M25 62 Q30 65 35 62`,[30-14,52],[30+16,46])}
    ${figure(130,52,'#E5F3E8',null,`M124 62 Q130 65 136 62`,[130-16,46],[130+14,52])}
  </svg>`;
}

export function svgF1H5() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F2F2EF"/>
    <rect x="38" y="14" width="84" height="76" rx="7" fill="#fff" stroke="#DDDDD8" stroke-width="1.2"/>
    <text x="52" y="45" font-family="sans-serif" font-size="22" font-weight="bold" fill="#EF4444">?</text>
    <line x1="52" y1="58" x2="105" y2="58" stroke="#E8E8E4" stroke-width="3" stroke-linecap="round"/>
    <line x1="52" y1="70" x2="90" y2="70" stroke="#E8E8E4" stroke-width="3" stroke-linecap="round"/>
    ${figure(130,22,'#FDECD5',null,`M124 32 Q130 29 136 32`,null,null)}
  </svg>`;
}

export function svgF1H6() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F5EEF5"/>
    <rect x="22" y="30" width="116" height="52" rx="8" fill="#fff" stroke="#D5B8D5" stroke-width="1.2"/>
    <path d="M22 38 L80 66 L138 38" stroke="#D5B8D5" stroke-width="1.2" fill="none"/>
    ${figure(35,16,'#E5ECF8',null,`M30 25 Q35 28 40 25`,null,null)}
    ${figure(125,16,'#E5F3E8',null,`M119 25 Q125 28 131 25`,null,null)}
  </svg>`;
}

export function svgF1H7() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#EEF2F8"/>
    <line x1="30" y1="46" x2="130" y2="46" stroke="#8A9AAA" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="50" y1="46" x2="50" y2="75" stroke="#B0AFA8" stroke-width="1.5"/>
    <rect x="40" y="75" width="20" height="6" rx="3" fill="#8A9AAA"/>
    ${figure(50,28,'#E5ECF8',null,`M44 38 Q50 41 56 38`,[50-12,30],[50+12,30])}
  </svg>`;
}

export function svgF1H8() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F0EEF5"/>
    <ellipse cx="80" cy="72" rx="52" ry="18" fill="#fff" stroke="#C8C5E0" stroke-width="1.2"/>
    <circle cx="65" cy="70" r="4" fill="#EF4444"/>
    <circle cx="80" cy="74" r="4" fill="#3B82F6"/>
    <circle cx="95" cy="70" r="4" fill="#10B981"/>
    ${figure(46,45,'#FDECD5',null,`M40 54 Q46 57 52 54`,null,[46+14,55])}
    ${figure(114,45,'#E5ECF8',null,`M108 54 Q114 57 120 54`,[114-14,55],null)}
  </svg>`;
}

export function svgF1H9() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#EFF4EE"/>
    <rect x="25" y="18" width="110" height="56" rx="7" fill="#D5E8D4" stroke="#A8C9A5" stroke-width="1.2"/>
    <line x1="80" y1="74" x2="80" y2="95" stroke="#A8C9A5" stroke-width="3"/>
    <line x1="60" y1="95" x2="100" y2="95" stroke="#A8C9A5" stroke-width="3" stroke-linecap="round"/>
    ${figure(125,80,'#FDECD5',null,`M119 70 Q125 67 131 70`,null,null)}
  </svg>`;
}

export function svgF1H10() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F5F2EE"/>
    <rect x="45" y="48" width="30" height="10" rx="2" fill="#EF4444"/>
    <polygon points="45,48 45,58 35,53" fill="#FDECD5"/>
    <rect x="85" y="48" width="30" height="10" rx="2" fill="#EF4444"/>
    ${figure(30,42,'#FDECD5',null,`M24 52 Q30 49 36 52`,[30+14,36],null)}
    ${figure(130,42,'#E5ECF8',null,`M124 52 Q130 55 136 52`,[130-14,36],null)}
  </svg>`;
}

// FAIXA 2 (8-11 anos)
export function svgF2H1() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#E0F2FE"/>
    <rect x="15" y="60" width="130" height="30" rx="6" fill="#fff" stroke="#7DD3FC" stroke-width="1.5"/>
    <circle cx="45" cy="42" r="11" fill="#BAE6FD"/>
    <circle cx="80" cy="42" r="11" fill="#BAE6FD"/>
    <circle cx="115" cy="42" r="11" fill="#BAE6FD"/>
    <path d="M40 70 L50 70 L50 82 L40 82 Z" fill="#F59E0B"/>
    <path d="M75 70 L85 70 L85 82 L75 82 Z" fill="#10B981"/>
    ${figure(25,25,'#FDECD5',null,`M19 35 Q25 38 31 35`,[25-10,32],[25+10,32])}
  </svg>`;
}

export function svgF2H2() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="40" y="12" width="80" height="80" rx="8" fill="#fff" stroke="#FCD34D" stroke-width="1.5"/>
    <circle cx="95" cy="38" r="14" fill="none" stroke="#EF4444" stroke-width="2.5"/>
    <text x="89" y="44" font-family="sans-serif" font-size="18" font-weight="bold" fill="#EF4444">6.0</text>
    <line x1="52" y1="30" x2="75" y2="30" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="52" y1="44" x2="72" y2="44" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="52" y1="58" x2="108" y2="58" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="52" y1="72" x2="98" y2="72" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

export function svgF2H3() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F1F5F9"/>
    <rect x="20" y="20" width="120" height="42" rx="12" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/>
    <path d="M40 62 L35 74 L52 62 Z" fill="#fff" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="35" y="46" font-family="sans-serif" font-size="15" font-weight="bold" fill="#64748B">"Apelido..."</text>
    ${figure(130,52,'#FCA5A5',null,`M124 62 Q130 58 136 62`,null,null)}
  </svg>`;
}

export function svgF2H4() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#E0F2FE"/>
    <rect x="48" y="10" width="64" height="84" rx="12" fill="#0F172A" stroke="#334155" stroke-width="2"/>
    <rect x="52" y="16" width="56" height="72" rx="8" fill="#F8FAFC"/>
    <rect x="58" y="25" width="38" height="14" rx="5" fill="#0284C7"/>
    <rect x="64" y="44" width="38" height="14" rx="5" fill="#E0F2FE"/>
    <rect x="58" y="63" width="38" height="14" rx="5" fill="#0284C7"/>
  </svg>`;
}

export function svgF2H5() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#ECFDF5"/>
    <polygon points="80,20 52,78 108,78" fill="#D1FAE5" stroke="#059669" stroke-width="2"/>
    <ellipse cx="80" cy="20" rx="10" ry="4" fill="#10B981"/>
    <rect x="35" y="78" width="90" height="10" rx="4" fill="#059669"/>
    ${figure(25,48,'#FDECD5',null,`M19 58 Q25 61 31 58`,null,[25+12,42])}
    ${figure(135,48,'#E5ECF8',null,`M129 58 Q135 61 141 58`,[135-12,42],null)}
  </svg>`;
}

export function svgF2H6() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FFF1F2"/>
    <rect x="32" y="12" width="96" height="80" rx="8" fill="#fff" stroke="#FECDD3" stroke-width="1.5"/>
    <line x1="44" y1="28" x2="116" y2="28" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="44" y1="44" x2="96" y2="44" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="44" y1="60" x2="108" y2="60" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="44" y1="76" x2="88" y2="76" stroke="#FECDD3" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

export function svgF2H7() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="35" y="50" width="90" height="40" rx="8" fill="#D97706"/>
    <circle cx="50" cy="38" r="10" fill="#FBBF24"/>
    <rect x="75" y="32" width="14" height="14" rx="3" fill="#EF4444"/>
    <rect x="98" y="35" width="16" height="12" rx="3" fill="#3B82F6"/>
  </svg>`;
}

export function svgF2H8() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#DCFCE7"/>
    <rect x="20" y="20" width="120" height="64" rx="8" fill="none" stroke="#16A34A" stroke-width="2"/>
    <circle cx="80" cy="52" r="22" fill="#fff" stroke="#16A34A" stroke-width="2"/>
    <polygon points="80,35 88,44 78,52 70,44" fill="#16A34A"/>
    <polygon points="80,69 88,60 78,52 70,60" fill="#16A34A"/>
  </svg>`;
}

export function svgF2H9() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FFFBEA"/>
    <path d="M68 76 L80 38 L92 76 Z" fill="#D97706"/>
    <line x1="74" y1="58" x2="86" y2="52" stroke="#fff" stroke-width="2.5"/>
    <circle cx="60" cy="80" r="5" fill="#D97706"/>
    <circle cx="100" cy="80" r="6" fill="#D97706"/>
  </svg>`;
}

export function svgF2H10() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F3E8FF"/>
    <rect x="35" y="25" width="90" height="50" rx="16" fill="#7C3AED"/>
    <circle cx="58" cy="50" r="8" fill="#DDD6FE"/>
    <circle cx="98" cy="44" r="5" fill="#38BDF8"/>
    <circle cx="104" cy="56" r="5" fill="#F43F5E"/>
  </svg>`;
}

// FAIXA 3 (11-13 anos)
export function svgF3H1() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#D1FAE5"/>
    <rect x="55" y="15" width="50" height="74" rx="8" fill="#047857"/>
    <rect x="59" y="20" width="42" height="60" rx="4" fill="#fff"/>
    <circle cx="80" cy="50" r="10" fill="none" stroke="#A7F3D0" stroke-width="3"/>
  </svg>`;
}

export function svgF3H2() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#ECFDF5"/>
    <rect x="35" y="20" width="90" height="64" rx="6" fill="#fff" stroke="#059669" stroke-width="1.2"/>
    <line x1="45" y1="35" x2="115" y2="35" stroke="#A7F3D0" stroke-width="3"/>
    <line x1="45" y1="50" x2="105" y2="50" stroke="#A7F3D0" stroke-width="3"/>
  </svg>`;
}

export function svgF3H3() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FFF1F2"/>
    <polygon points="50,25 60,45 40,45" fill="#F43F5E"/>
    <polygon points="110,15 125,45 95,45" fill="#F59E0B"/>
    <rect x="30" y="55" width="100" height="30" rx="4" fill="#fff" stroke="#CBD5E1" stroke-width="1.2"/>
  </svg>`;
}

export function svgF3H4() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F1F5F9"/>
    <circle cx="55" cy="45" r="15" fill="#CBD5E1"/>
    <circle cx="105" cy="45" r="15" fill="#CBD5E1"/>
    <path d="M70 40 Q80 35 90 40" stroke="#64748B" stroke-width="2" fill="none"/>
  </svg>`;
}

export function svgF3H5() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#ECFDF5"/>
    <rect x="45" y="15" width="70" height="74" rx="6" fill="#fff" stroke="#047857" stroke-width="1.5"/>
    <rect x="65" y="10" width="30" height="10" rx="3" fill="#047857"/>
    <line x1="55" y1="35" x2="105" y2="35" stroke="#A7F3D0" stroke-width="3"/>
  </svg>`;
}

export function svgF3H6() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="30" y="30" width="100" height="44" rx="8" fill="#fff" stroke="#D97706" stroke-width="1.2"/>
    <text x="60" y="58" font-family="sans-serif" font-size="20" font-weight="bold" fill="#D97706">???</text>
  </svg>`;
}

export function svgF3H7() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F1F5F9"/>
    <circle cx="80" cy="52" r="25" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
    <circle cx="72" cy="45" r="3" fill="#64748B"/>
    <circle cx="88" cy="45" r="3" fill="#64748B"/>
    <path d="M70 65 Q80 58 90 65" stroke="#64748B" stroke-width="2" fill="none"/>
  </svg>`;
}

export function svgF3H8() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <ellipse cx="80" cy="65" rx="55" ry="20" fill="#fff" stroke="#D97706" stroke-width="1.2"/>
    <rect x="70" y="45" width="20" height="35" rx="4" fill="#0F172A"/>
    <rect x="72" y="48" width="16" height="26" fill="#38BDF8"/>
  </svg>`;
}

export function svgF3H9() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#ECFDF5"/>
    <line x1="80" y1="20" x2="80" y2="85" stroke="#047857" stroke-width="4"/>
    <rect x="80" y="30" width="50" height="18" rx="4" fill="#059669"/>
    <rect x="30" y="55" width="50" height="18" rx="4" fill="#10B981"/>
  </svg>`;
}

export function svgF3H10() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <rect x="45" y="20" width="70" height="64" rx="8" fill="#fff" stroke="#DB2777" stroke-width="1.2"/>
    <path d="M80 48 C75 40 60 45 60 55 C60 65 80 75 80 75 C80 75 100 65 100 55 C100 45 85 40 80 48 Z" fill="#EC4899"/>
  </svg>`;
}

// FAIXA 4 (14-16 anos)
export function svgF4H1() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <path d="M80 35 L75 55 L85 60 L80 80" stroke="#D97706" stroke-width="3" fill="none"/>
  </svg>`;
}

export function svgF4H2() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <circle cx="80" cy="52" r="24" fill="#fff" stroke="#BE185D" stroke-width="2"/>
    <line x1="80" y1="52" x2="80" y2="36" stroke="#BE185D" stroke-width="3"/>
    <line x1="80" y1="52" x2="94" y2="52" stroke="#BE185D" stroke-width="3"/>
  </svg>`;
}

export function svgF4H3() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="30" y="20" width="100" height="64" rx="8" fill="#fff" stroke="#B45309" stroke-width="1.2"/>
    <circle cx="55" cy="45" r="12" fill="#FDE68A"/>
    <line x1="75" y1="40" x2="115" y2="40" stroke="#FDE68A" stroke-width="4"/>
    <line x1="75" y1="52" x2="105" y2="52" stroke="#FDE68A" stroke-width="4"/>
  </svg>`;
}

export function svgF4H4() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEE2E2"/>
    <rect x="35" y="20" width="90" height="64" rx="6" fill="#fff" stroke="#EF4444" stroke-width="1.5"/>
    <line x1="45" y1="35" x2="115" y2="35" stroke="#FCA5A5" stroke-width="3"/>
    <line x1="45" y1="50" x2="85" y2="50" stroke="#FCA5A5" stroke-width="3"/>
  </svg>`;
}

export function svgF4H5() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <circle cx="60" cy="52" r="18" fill="none" stroke="#D97706" stroke-width="3"/>
    <circle cx="100" cy="52" r="18" fill="none" stroke="#D97706" stroke-width="3"/>
  </svg>`;
}

export function svgF4H6() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#ECFDF5"/>
    <rect x="40" y="30" width="80" height="50" rx="6" fill="#047857"/>
    <rect x="50" y="40" width="60" height="15" rx="3" fill="#A7F3D0"/>
  </svg>`;
}

export function svgF4H7() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <circle cx="80" cy="52" r="25" fill="#fff" stroke="#D97706" stroke-width="2"/>
    <line x1="80" y1="52" x2="80" y2="35" stroke="#D97706" stroke-width="2"/>
    <line x1="80" y1="52" x2="95" y2="52" stroke="#D97706" stroke-width="2"/>
  </svg>`;
}

export function svgF4H8() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#E0F2FE"/>
    <path d="M40 65 Q50 35 60 65" stroke="#0284C7" stroke-width="3" fill="none"/>
    <rect x="95" y="35" width="30" height="30" fill="none" stroke="#0284C7" stroke-width="2"/>
  </svg>`;
}

export function svgF4H9() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="25" y="25" width="110" height="50" rx="10" fill="#fff" stroke="#D97706" stroke-width="1.5"/>
    <circle cx="45" cy="50" r="6" fill="#FDE68A"/>
    <circle cx="80" cy="50" r="6" fill="#FDE68A"/>
    <circle cx="115" cy="50" r="6" fill="#FDE68A"/>
  </svg>`;
}

export function svgF4H10() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <rect x="50" y="15" width="60" height="74" rx="8" fill="#fff" stroke="#BE185D" stroke-width="1.5"/>
    <circle cx="80" cy="45" r="14" fill="#FBCFE8"/>
  </svg>`;
}

// FAIXA 5 (16-19 anos)
export function svgF5H1() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <rect x="40" y="25" width="80" height="54" rx="6" fill="#fff" stroke="#BE185D" stroke-width="1.2"/>
    <line x1="40" y1="40" x2="120" y2="40" stroke="#FBCFE8" stroke-width="2"/>
  </svg>`;
}

export function svgF5H2() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F1F5F9"/>
    <rect x="60" y="45" width="40" height="40" fill="#64748B"/>
    <circle cx="80" cy="30" r="8" fill="#94A3B8"/>
  </svg>`;
}

export function svgF5H3() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <rect x="40" y="18" width="80" height="68" rx="6" fill="#fff" stroke="#DB2777" stroke-width="1.5"/>
    <circle cx="80" cy="45" r="12" fill="#FBCFE8"/>
  </svg>`;
}

export function svgF5H4() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FEF3C7"/>
    <rect x="35" y="20" width="90" height="64" rx="6" fill="#fff" stroke="#D97706" stroke-width="1.2"/>
    <line x1="45" y1="35" x2="115" y2="35" stroke="#FDE68A" stroke-width="3"/>
    <line x1="45" y1="50" x2="115" y2="50" stroke="#FDE68A" stroke-width="3"/>
    <line x1="45" y1="65" x2="115" y2="65" stroke="#FDE68A" stroke-width="3"/>
  </svg>`;
}

export function svgF5H5() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <rect x="30" y="60" width="100" height="14" rx="3" fill="#BE185D"/>
    <rect x="40" y="44" width="80" height="14" rx="3" fill="#DB2777"/>
    <rect x="50" y="28" width="60" height="14" rx="3" fill="#F472B6"/>
  </svg>`;
}

export function svgF5H6() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <line x1="80" y1="30" x2="80" y2="75" stroke="#BE185D" stroke-width="3"/>
    <line x1="45" y1="45" x2="115" y2="45" stroke="#BE185D" stroke-width="3"/>
  </svg>`;
}

export function svgF5H7() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <path d="M60 85 L80 25 L100 85" stroke="#BE185D" stroke-width="2" fill="none"/>
  </svg>`;
}

export function svgF5H8() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#F1F5F9"/>
    <rect x="40" y="25" width="80" height="54" rx="6" fill="#fff" stroke="#64748B" stroke-width="1.2"/>
    <line x1="50" y1="40" x2="110" y2="40" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="50" y1="55" x2="90" y2="55" stroke="#CBD5E1" stroke-width="2"/>
  </svg>`;
}

export function svgF5H9() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#ECFDF5"/>
    <circle cx="80" cy="52" r="25" fill="#fff" stroke="#047857" stroke-width="2"/>
    <polygon points="80,35 85,55 75,55" fill="#047857"/>
  </svg>`;
}

export function svgF5H10() {
  return `<svg viewBox="0 0 160 104" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="104" fill="#FCE7F3"/>
    <path d="M80 85 Q60 50 80 15 Q100 50 80 85" stroke="#BE185D" stroke-width="2" fill="none"/>
  </svg>`;
}

export const HISTORIAS: Record<string, HistoriaClinica[]> = {
  f1: [
    {
      num: 1,
      titulo: "O Jogo de Tabuleiro",
      theme: "Controle inibitório",
      tag: "Raiva",
      image: "/assets/cards/f1_h1.jpg",
      illo: svgF1H1(),
      historia: "Léo estava jogando um jogo de tabuleiro com seu amigo Davi. Léo jogou o dado três vezes e perdeu todas. Davi ganhou o jogo e comemorou pulando. O rosto de Léo ficou vermelho, ele apertou os punhos e gritou: \"Esse jogo é chato, eu não quero mais jogar com você!\"",
      observar: { pergunta: "O que o corpo de Léo mostrou que ele estava sentindo? (rosto, punhos, voz)", linhas: 2 },
      pensamento: { texto: '"Eu sou péssimo nesse jogo, eu nunca ganho de ninguém."', pergunta: "Esse pensamento é totalmente verdadeiro? Existe outra forma de pensar sobre perder um jogo?" },
      parar: { dica: "Antes de reagir, respire fundo 3 vezes", pergunta: "O que Léo poderia fazer em vez de gritar?", opcoes: ["Respirar fundo e dizer \"Que bom, você jogou bem!\"", "Pedir para jogar de novo, dizendo que quer treinar"] },
    },
    {
      num: 2,
      titulo: "O Lanche da Escola",
      theme: "Controle inibitório",
      tag: "Frustração",
      image: "/assets/cards/f1_h2.jpg",
      illo: svgF1H2(),
      historia: "Na hora do lanche, Ana abriu sua lancheira e encontrou cenoura em vez de biscoito. Ela queria tanto o biscoito! Seus olhos ficaram cheios de lágrimas e ela empurrou a lancheira para longe, reclamando bem alto para todo mundo ouvir.",
      observar: { pergunta: "O que o corpo de Ana mostrou que ela estava frustrada? (olhos, braços, voz)", linhas: 2 },
      pensamento: { texto: '"Minha mãe nunca me dá o que eu quero, ela não me ama."', pergunta: "Esse pensamento faz sentido? O que pode ser mais verdadeiro sobre por que a mãe colocou cenoura?" },
      parar: { dica: "Respire, pense e depois fale com calma", pergunta: "O que Ana poderia fazer em vez de empurrar a lancheira?", opcoes: ["Comer a cenoura e conversar com a mãe depois", "Perguntar a um amigo se quer trocar parte do lanche"] },
    },
    {
      num: 3,
      titulo: "A Vez de Falar",
      theme: "Leitura social",
      tag: "Esperar a vez",
      image: "/assets/cards/f1_h3.jpg",
      illo: svgF1H3(),
      historia: "Durante a roda na sala, a professora fez uma pergunta. João sabia a resposta e ficou tão animado que gritou antes de a professora terminar a frase. A professora pediu calma. Dois amigos olharam para João com cara estranha.",
      observar: { pergunta: "O que João fez que atrapalhou a aula? Como seus amigos reagiram?", linhas: 2 },
      pensamento: { texto: '"Se eu não falar rápido, alguém vai responder antes de mim."', pergunta: "Esperar a vez de falar é difícil, mas o que pode acontecer de bom quando a gente espera?" },
      parar: { dica: "Levante a mão e espere a professora chamar", pergunta: "O que João poderia fazer diferente?", opcoes: ["Levantar a mão e aguardar ser chamado", "Respirar fundo e guardar a resposta na mente"] },
    },
    {
      num: 4,
      titulo: "O Brinquedo do Amigo",
      theme: "Habilidades sociais",
      tag: "Compartilhar",
      image: "/assets/cards/f1_h4.jpg",
      illo: svgF1H4(),
      historia: "Pedro viu o carrinho novo de Mateus e quis muito brincar. Mateus disse que ainda não queria emprestar. Pedro ficou com raiva e sem avisar pegou o carrinho da mão de Mateus. Mateus ficou triste e chamou a professora.",
      observar: { pergunta: "O que Pedro fez que magoou Mateus? Como Mateus se sentiu?", linhas: 2 },
      pensamento: { texto: '"Se ele não me empresta, eu posso pegar. Eu também quero brincar."', pergunta: "Por que pegar sem permissão não é a melhor solução? Como a gente pede algo de forma gentil?" },
      parar: { dica: "Perguntar com gentileza é sempre melhor do que tomar", pergunta: "O que Pedro poderia ter feito?", opcoes: ["Pedir: \"Posso brincar depois de você?\"", "Perguntar se podem brincar juntos"] },
    },
    {
      num: 5,
      titulo: "A Tarefa Difícil",
      theme: "Pensamentos automáticos",
      tag: "Frustração",
      image: "/assets/cards/f1_h5.jpg",
      illo: svgF1H5(),
      historia: "Sofia recebeu uma tarefa de matemática que ela não entendia. Em vez de pedir ajuda, ela ficou olhando para o papel, rasgou a folha e disse \"Eu odeio matemática, sou burra mesmo!\"",
      observar: { pergunta: "Como Sofia se sentiu ao ver a tarefa? O que o corpo dela mostrou?", linhas: 2 },
      pensamento: { texto: '"Eu nunca vou conseguir aprender isso. Sou a mais burra da turma."', pergunta: "Será que alguém aprende tudo de primeira? O que um bom pensamento poderia ser?" },
      parar: { dica: "Pedir ajuda é sinal de inteligência, não de fraqueza", pergunta: "O que Sofia poderia fazer com a tarefa difícil?", opcoes: ["Levantar a mão e pedir ajuda à professora", "Colocar um ponto de interrogação e perguntar depois"] },
    },
    {
      num: 6,
      titulo: "O Convite",
      theme: "Leitura social",
      tag: "Inclusão",
      image: "/assets/cards/f1_h6.jpg",
      illo: svgF1H6(),
      historia: "Bia viu seus colegas fazendo planos para brincar no recreio e não a convidaram. Ela foi para um canto sozinha e ficou pensando que ninguém gostava dela. Quando um colega chegou para chamá-la, ela disse \"Não quero\" com raiva.",
      observar: { pergunta: "O que Bia sentiu quando não foi convidada? O que ela fez?", linhas: 2 },
      pensamento: { texto: '"Ninguém quer brincar comigo. Eu não tenho amigos."', pergunta: "Será que não ser convidado de imediato significa que ninguém gosta dela? O que mais pode ter acontecido?" },
      parar: { dica: "Checar o que realmente aconteceu antes de concluir", pergunta: "O que Bia poderia fazer?", opcoes: ["Perguntar gentilmente se pode participar", "Esperar o próximo chamado com uma resposta positiva"] },
    },
    {
      num: 7,
      titulo: "A Vez no Balanço",
      theme: "Controle inibitório",
      tag: "Esperar",
      image: "/assets/cards/f1_h7.jpg",
      illo: svgF1H7(),
      historia: "No parquinho, Caio queria muito balançar, mas todos os balanços estavam ocupados. Ele ficou parado, com os punhos fechados, e de repente empurrou uma menina para tomar o lugar dela.",
      observar: { pergunta: "O que Caio sentiu enquanto esperava? O que seu corpo mostrou?", linhas: 2 },
      pensamento: { texto: '"Eu espero muito tempo e nunca é minha vez. Isso é injusto!"', pergunta: "Esperar é difícil, mas empurrar resolve o problema? O que pode acontecer depois disso?" },
      parar: { dica: "Esperar com paciência e pedir com educação funciona melhor", pergunta: "O que Caio poderia ter feito no parquinho?", opcoes: ["Perguntar: \"Posso usar depois de você?\"", "Brincar em outro lugar enquanto espera"] },
    },
    {
      num: 8,
      titulo: "O Trabalho em Grupo",
      theme: "Habilidades sociais",
      tag: "Colaboração",
      image: "/assets/cards/f1_h8.jpg",
      illo: svgF1H8(),
      historia: "A turma foi dividida em grupos para fazer um desenho juntos. Lucas queria que o desenho fosse do jeito dele e não deixou os outros colegas participar. No final, os amigos ficaram chateados e não quiseram mais trabalhar com ele.",
      observar: { pergunta: "Por que os colegas ficaram chateados com Lucas? O que ele fez errado?", linhas: 2 },
      pensamento: { texto: '"O meu jeito é o melhor. Se eu não controlar, vai ficar feio."', pergunta: "Em um trabalho em grupo, todas as ideias importam. O que é melhor: controlar ou colaborar?" },
      parar: { dica: "Ouvir a ideia dos outros também é uma forma de criar juntos", pergunta: "Como Lucas poderia participar do grupo de forma diferente?", opcoes: ["Perguntar: \"O que vocês gostariam de desenhar?\"", "Propor sua ideia e perguntar o que os outros acham"] },
    },
    {
      num: 9,
      titulo: "O Erro na Apresentação",
      theme: "Pensamentos automáticos",
      tag: "Autocrítica",
      image: "/assets/cards/f1_h9.jpg",
      illo: svgF1H9(),
      historia: "Durante a apresentação oral, Mariana falou uma palavra errada e os colegas riram. Ela parou de falar, abaixou a cabeça e não quis mais continuar. Depois disse que nunca mais ia apresentar nada.",
      observar: { pergunta: "Como Mariana reagiu ao erro? O que ela sentiu e fez?", linhas: 2 },
      pensamento: { texto: '"Todo mundo achou que sou ridícula. Eu sou uma vergonha."', pergunta: "Errar faz parte de aprender. O que as pessoas que continuam apresentando pensam quando erram?" },
      parar: { dica: "Errar é humano — o que importa é continuar", pergunta: "O que Mariana poderia fazer quando errou?", opcoes: ["Dar uma risada junto e continuar a apresentação", "Respirar fundo, corrigir e seguir em frente"] },
    },
    {
      num: 10,
      titulo: "A Disputa pelo Lápis",
      theme: "Controle inibitório",
      tag: "Conflito",
      image: "/assets/cards/f1_h10.jpg",
      illo: svgF1H10(),
      historia: "Rafael e Guilherme queriam usar o mesmo lápis vermelho ao mesmo tempo. Os dois começaram a puxar o lápis e ele quebrou. Rafael ficou com raiva e jogou os pedaços no chão.",
      observar: { pergunta: "O que aconteceu quando os dois puxaram o lápis? Como Rafael reagiu?", linhas: 2 },
      pensamento: { texto: '"Ele quebrou meu lápis de propósito. É tudo culpa dele."', pergunta: "Será que foi de propósito? Como a gente divide coisas sem brigar?" },
      parar: { dica: "Dividir e revezar são formas de resolver sem briga", pergunta: "O que os dois poderiam ter feito com o lápis?", opcoes: ["Combinar: \"Você usa primeiro, depois eu uso\"", "Pedir outro lápis emprestado à professora"] },
    },
  ],
  f2: [
    {
      num: 1,
      titulo: "O Grupinho da Sala",
      theme: "Leitura social",
      tag: "Exclusão",
      image: "/assets/cards/f2_h1.jpg",
      illo: svgF2H1(),
      historia: "Lucas sempre almoçava com os mesmos três amigos. Um dia eles sentaram em outro lugar sem avisar. Lucas ficou parado olhando para eles, sentiu o estômago apertar e foi comer sozinho, convencido de que tinha feito algo errado.",
      observar: { pergunta: "O que Lucas concluiu sem ter certeza? Quais evidências ele tinha para isso?", linhas: 2 },
      pensamento: { texto: '"Eles me ignoraram de propósito. Eu devo ter feito algo errado."', pergunta: "Que outras explicações poderiam existir para eles terem sentado em outro lugar?" },
      parar: { dica: "Verificar antes de concluir evita mal-entendidos", pergunta: "O que Lucas poderia fazer para checar o que realmente aconteceu?", opcoes: ["Perguntar diretamente aos amigos: \"Está tudo bem entre a gente?\"", "Observar o comportamento deles nos próximos dias antes de concluir"] },
    },
    {
      num: 2,
      titulo: "A Nota Baixa",
      theme: "Pensamentos automáticos",
      tag: "Autocrítica",
      illo: svgF2H2(),
      historia: "Isabela estudou bastante para a prova, mas tirou 6. Ela jogou a prova na mochila sem olhar os erros e passou o restante do dia sem falar com ninguém, sentindo que era a pior aluna da turma.",
      observar: { pergunta: "Como Isabela reagiu à nota? O que ela fez com as informações da prova?", linhas: 2 },
      pensamento: { texto: '"Estudei tanto e tirei 6. Sou péssima. Nunca vou melhorar."', pergunta: "Uma nota reflete todo o seu valor ou só aquele momento? O que pode ser aprendido com os erros?" },
      parar: { dica: "Erros são dados — eles mostram o que estudar a seguir", pergunta: "O que Isabela poderia fazer com a prova?", opcoes: ["Olhar os erros e entender onde melhorar", "Pedir ajuda ao professor nas questões que errou"] },
    },
    {
      num: 3,
      titulo: "O Apelido",
      theme: "Controle inibitório",
      tag: "Provocação",
      illo: svgF2H3(),
      historia: "Carlos recebeu um apelido na escola que não gostou. Toda vez que o chamavam assim, ele ficava vermelho, saía correndo ou xingava. Os colegas perceberam a reação dele e passaram a usar mais o apelido.",
      observar: { pergunta: "O que aconteceu quando Carlos reagia com raiva? Como os colegas responderam?", linhas: 2 },
      pensamento: { texto: '"Eles fazem isso porque me odeiam. Preciso me vingar."', pergunta: "Por que reagir com raiva pode piorar a situação? Que outra reação poderia mudar o comportamento deles?" },
      parar: { dica: "Reagir de forma calma tira o poder do provocador", pergunta: "Como Carlos poderia responder ao apelido?", opcoes: ["Ignorar e não mostrar que incomoda", "Dizer com calma: \"Meu nome é Carlos. Por favor, me chame assim.\""] },
    },
    {
      num: 4,
      titulo: "A Mensagem no Grupo",
      theme: "Leitura social",
      tag: "Rejeição",
      illo: svgF2H4(),
      historia: "Fernanda viu no grupo da turma que as amigas marcaram um encontro sem chamá-la. Ela ficou olhando o celular por horas, relendo as mensagens, e à noite não conseguiu dormir pensando que todas a odiavam.",
      observar: { pergunta: "O que Fernanda fez ao ver as mensagens? Como isso afetou ela?", linhas: 2 },
      pensamento: { texto: '"Elas fizeram isso de propósito para me excluir. Eu não tenho amigas de verdade."', pergunta: "Existe a possibilidade de outro motivo para não ter sido convidada? Como checar isso?" },
      parar: { dica: "Ruminar não resolve — agir com calma ajuda mais", pergunta: "O que Fernanda poderia fazer em vez de ficar relendo as mensagens?", opcoes: ["Mandar uma mensagem para uma amiga perguntando com cuidado", "Deixar para conversar pessoalmente no dia seguinte"] },
    },
    {
      num: 5,
      titulo: "O Projeto da Feira de Ciências",
      theme: "Habilidades sociais",
      tag: "Colaboração",
      illo: svgF2H5(),
      historia: "No projeto em dupla, Rodrigo tinha muitas ideias mas Camila queria fazer diferente. Rodrigo ficou calado, fez tudo do jeito de Camila por dentro com raiva, e entregou o projeto sem se sentir parte dele.",
      observar: { pergunta: "O que Rodrigo sentiu ao ceder tudo sem falar? Como isso afetou o trabalho deles?", linhas: 2 },
      pensamento: { texto: '"Se eu discordar, ela vai ficar com raiva de mim e eu vou ficar sozinho."', pergunta: "Ceder sempre é o mesmo que ser gentil? O que é uma colaboração equilibrada?" },
      parar: { dica: "Expressar sua opinião com respeito fortalece parcerias", pergunta: "Como Rodrigo poderia ter participado mais?", opcoes: ["Dizer: \"Eu tenho uma ideia diferente, posso te contar?\"", "Propor combinar as duas ideias em algo novo"] },
    },
    {
      num: 6,
      titulo: "O Comentário do Professor",
      theme: "Pensamentos automáticos",
      tag: "Feedback",
      illo: svgF2H6(),
      historia: "O professor fez um comentário crítico sobre o texto de Beatriz na frente da turma. Ela sentiu um calor no rosto e ficou pensando nisso por dias, acreditando que o professor a achava burra e que nunca escreveria bem.",
      observar: { pergunta: "Como Beatriz interpretou o comentário do professor? O que ela sentiu?", linhas: 2 },
      pensamento: { texto: '"Ele me criticou porque acha que sou burra e sem jeito para escrever."', pergunta: "Um comentário crítico sobre um texto é o mesmo que uma crítica à pessoa? O que um professor quer ao corrigir?" },
      parar: { dica: "Críticas ao trabalho são oportunidades de crescer", pergunta: "O que Beatriz poderia fazer com o comentário do professor?", opcoes: ["Perguntar ao professor como melhorar o texto", "Reescrever o trecho usando a sugestão recebida"] },
    },
    {
      num: 7,
      titulo: "A Briga com o Irmão",
      theme: "Controle inibitório",
      tag: "Limites",
      illo: svgF2H7(),
      historia: "Tomás estava com raiva do irmão mais novo que havia mexido nos seus brinquedos. Ele foi até a sala e gritou tanto que o irmão começou a chorar. Os pais ficaram mais bravos com Tomás do que com o irmão.",
      observar: { pergunta: "Por que os pais ficaram mais bravos com Tomás? O que aconteceu com a reação dele?", linhas: 2 },
      pensamento: { texto: '"Ele fez isso de maldade. Preciso mostrar que não pode mexer nas minhas coisas."', pergunta: "Gritar resolveu o problema? Como expressar um limite de forma que o outro ouça?" },
      parar: { dica: "Falar sobre o limite com calma é mais eficaz do que gritar", pergunta: "Como Tomás poderia ter resolvido a situação?", opcoes: ["Dizer: \"Você mexeu nas minhas coisas sem pedir. Isso me deixa chateado.\"", "Conversar com os pais calmamente para estabelecer combinados"] },
    },
    {
      num: 8,
      titulo: "O Jogo de Futebol",
      theme: "Pensamentos automáticos",
      tag: "Autocrítica",
      illo: svgF2H8(),
      historia: "Durante o futebol no recreio, Henrique perdeu a bola e o time perdeu o jogo. Um colega disse \"você sempre estraga\" e Henrique saiu do jogo sem falar nada, sentindo que era um peso para todos.",
      observar: { pergunta: "Como Henrique interpretou o comentário do colega? O que ele sentiu?", linhas: 2 },
      pensamento: { texto: '"Eu estrago tudo mesmo. Seria melhor se eu não participasse."', pergunta: "Um comentário de raiva durante um jogo representa a opinião real de todos? O que é mais provável?" },
      parar: { dica: "Comentários no calor do momento não definem quem somos", pergunta: "O que Henrique poderia fazer diante desse comentário?", opcoes: ["Continuar jogando sem deixar o comentário definir seu valor", "Conversar depois com o colega sobre como o comentário o afetou"] },
    },
    {
      num: 9,
      titulo: "A Mentira Pequena",
      theme: "Habilidades sociais",
      tag: "Honestidade",
      illo: svgF2H9(),
      historia: "Júlia quebrou o vaso favorito da mãe sem querer e disse que havia sido o cachorro. A mãe acreditou. Mas Júlia ficou com aquilo na cabeça e passou dias sem conseguir olhar para a mãe direito.",
      observar: { pergunta: "O que aconteceu dentro de Júlia depois da mentira? Por que ela se sentiu assim?", linhas: 2 },
      pensamento: { texto: '"Se eu contar a verdade, minha mãe vai ficar com muita raiva e eu vou ser punida."', pergunta: "Qual é mais difícil: a punição ou carregar a culpa? O que acontece quando contamos a verdade com honestidade?" },
      parar: { dica: "Assumir erros é difícil, mas alivia e constrói confiança", pergunta: "O que Júlia poderia fazer?", opcoes: ["Contar a verdade e pedir desculpas com sinceridade", "Oferecer-se para ajudar a consertar ou substituir o vaso"] },
    },
    {
      num: 10,
      titulo: "A Exclusão no Jogo Online",
      theme: "Controle inibitório",
      tag: "Insistência",
      illo: svgF2H10(),
      historia: "Victor tentou entrar no grupo de amigos que jogava online e eles disseram que o time já estava cheio. Ele ficou jogando sozinho mas ficou mandando mensagens no grupo pedindo para entrar o tempo todo, até os amigos pararem de responder.",
      observar: { pergunta: "O que Victor fez quando foi recusado? Como os amigos reagiram?", linhas: 2 },
      pensamento: { texto: '"Se eu insistir bastante, eles vão me deixar entrar. Não posso aceitar isso."', pergunta: "Por que insistir demais pode afastar as pessoas? Como respeitar limites sem se sentir rejeitado?" },
      parar: { dica: "Respeitar a resposta do outro abre mais portas do que insistir", pergunta: "O que Victor poderia ter feito de diferente?", opcoes: ["Aceitar e pedir para entrar na próxima partida", "Propor um dia específico para jogar todos juntos"] },
    },
  ],
  f3: [
    {
      num: 1,
      titulo: "O Silêncio dos Amigos",
      theme: "Pensamentos automáticos",
      tag: "Catastrofização",
      illo: svgF3H1(),
      historia: "Nos últimos dias, os amigos de Giovana pararam de responder suas mensagens rapidamente. Ela começou a checar o celular a cada 5 minutos, enviou mensagens seguidas perguntando se estavam com raiva dela e passou a noite sem dormir imaginando que estava sendo excluída.",
      observar: { pergunta: "Que comportamentos de Giovana mostram que ela está em modo de alerta? Como isso a afeta?", linhas: 2 },
      pensamento: { texto: '"Eles me ignoram porque vão me largar. Eu sempre estrago tudo."', pergunta: "Como o pensamento catastrófico funciona? Que evidências reais apoiam essa conclusão?" },
      parar: { dica: "Checar com fatos reais antes de concluir o pior cenário", pergunta: "Que ação baseada em evidências Giovana poderia tomar?", opcoes: ["Mandar uma mensagem direta para uma amiga de confiança", "Dar um prazo de 24h antes de interpretar o silêncio"] },
    },
    {
      num: 2,
      titulo: "A Opinião não Pedida",
      theme: "Leitura social",
      tag: "Autonomia",
      illo: svgF3H2(),
      historia: "Pedro viu um colega fazendo uma tarefa de um jeito que ele achava errado. Sem que ninguém pedisse, ele foi até a mesa e começou a explicar o modo certo de fazer. O colega ficou vermelho e disse \"eu não pedi sua ajuda.\"",
      observar: { pergunta: "O que Pedro não percebeu antes de intervir? Como o colega se sentiu?", linhas: 2 },
      pensamento: { texto: '"Eu só estava tentando ajudar. Ele é ingrato. As pessoas não sabem receber ajuda."', pergunta: "Por que ajudar sem ser convidado pode ser invasivo? Qual a diferença entre querer ajudar e respeitar a autonomia?" },
      parar: { dica: "Perguntar antes de ajudar mostra respeito pelo espaço do outro", pergunta: "Como Pedro poderia ter agido diferente?", opcoes: ["Perguntar: \"Posso dar uma sugestão?\" antes de falar", "Respeitar se o colega disser que não precisa"] },
    },
    {
      num: 3,
      titulo: "A Comparação com a Irmã",
      theme: "Pensamentos automáticos",
      tag: "Comparação",
      illo: svgF3H3(),
      historia: "Os pais de Letícia frequentemente comentavam como sua irmã mais velha era organizada e tirava boas notas. Letícia começou a se sentir menor, foi perdendo o interesse nos estudos e passou a dizer que não servia para nada.",
      observar: { pergunta: "Como as comparações afetaram a forma de Letícia se ver? Que pensamentos surgiram?", linhas: 2 },
      pensamento: { texto: '"Nunca vou ser boa como minha irmã. Sou a decepção da família."', pergunta: "Comparações são justas? O que define o valor de uma pessoa além de notas e organização?" },
      parar: { dica: "Seu valor não depende de comparações com outros", pergunta: "O que Letícia poderia fazer com esses sentimentos?", opcoes: ["Conversar com os pais sobre como as comparações a afetam", "Identificar três qualidades próprias que não dependem de notas"] },
    },
    {
      num: 4,
      titulo: "A Fofoca",
      theme: "Controle inibitório",
      tag: "Impulsividade",
      illo: svgF3H4(),
      historia: "Marina ficou sabendo por uma amiga que outra colega estava falando coisas sobre ela pelas costas. Sem verificar se era verdade, Marina foi até a colega no intervalo e a enfrentou na frente de todos, causando uma cena enorme.",
      observar: { pergunta: "O que Marina fez antes de verificar as informações? Que consequências isso gerou?", linhas: 2 },
      pensamento: { texto: '"Se ela falou isso, é porque me odeia. Preciso me defender antes que piore."', pergunta: "Agir com base em informações de terceiros sem confirmar pode ser justo? Que riscos isso tem?" },
      parar: { dica: "Verificar com a fonte direta antes de agir protege relacionamentos", pergunta: "O que Marina poderia ter feito antes de confrontar?", opcoes: ["Conversar em particular com a colega para entender o que aconteceu", "Refletir se a informação era confiável antes de agir"] },
    },
    {
      num: 5,
      titulo: "O Grupo de Trabalho",
      theme: "Habilidades sociais",
      tag: "Liderança",
      illo: svgF3H5(),
      historia: "Felipe foi designado líder do grupo mas ninguém seguia suas sugestões. Ele foi ficando mais agressivo nas falas, atribuiu as tarefas sem perguntar e dois colegas pediram para trocar de grupo. Ele ficou sem entender o que havia feito de errado.",
      observar: { pergunta: "O que Felipe fez que afastou os colegas? Qual a diferença entre liderar e controlar?", linhas: 2 },
      pensamento: { texto: '"Sou o líder. Se ninguém me escuta, preciso ser mais firme e exigente."', pergunta: "Forçar obediência cria colaboração? O que uma liderança que inspira parece?" },
      parar: { dica: "Liderança eficaz envolve escuta antes de direção", pergunta: "O que Felipe poderia ter feito para liderar melhor?", opcoes: ["Perguntar ao grupo as preferências antes de distribuir tarefas", "Valorizar as ideias dos colegas mesmo sendo o líder"] },
    },
    {
      num: 6,
      titulo: "A Mentira Social",
      theme: "Pensamentos automáticos",
      tag: "Vergonha",
      illo: svgF3H6(),
      historia: "Quando o professor perguntou se alguém tinha dúvida, Camila tinha — mas olhou para os lados, viu que ninguém levantou a mão e fingiu que entendia. No dia da prova, ficou em branco justamente nesse conteúdo.",
      observar: { pergunta: "Por que Camila não perguntou? O que ela temeu? Qual foi o resultado?", linhas: 2 },
      pensamento: { texto: '"Se eu perguntar, todo mundo vai achar que sou burra. É melhor parecer que entendi."', pergunta: "Que preço se paga por aparentar entender em vez de aprender de verdade?" },
      parar: { dica: "Perguntar é o caminho mais curto para aprender", pergunta: "O que Camila poderia ter feito diferente?", opcoes: ["Levantar a mão, sabendo que outros provavelmente tinham a mesma dúvida", "Perguntar ao professor depois da aula em particular"] },
    },
    {
      num: 7,
      titulo: "O Limite que Ninguém Ouviu",
      theme: "Habilidades sociais",
      tag: "Limites",
      illo: svgF3H7(),
      historia: "Toda vez que um colega fazia piadas sobre o jeito de Gabriel falar, ele ria junto para não parecer sensível. Por dentro, sentia vergonha e raiva. Com o tempo, passou a evitar falar em público.",
      observar: { pergunta: "O que Gabriel perdeu ao não expressar seu incômodo? Como isso mudou seu comportamento?", linhas: 2 },
      pensamento: { texto: '"Se eu reclamar vão achar que sou fraco e exagerado. Melhor rir junto."', pergunta: "Que diferença existe entre ser sensível e ter limites saudáveis? Quem se beneficia quando calamos nossos limites?" },
      parar: { dica: "Expressar um limite protege nossa saúde emocional", pergunta: "O que Gabriel poderia fazer quando as piadas acontecessem?", opcoes: ["Dizer com calma: \"Esse tipo de piada sobre mim não me faz bem.\"", "Conversar com um adulto de confiança sobre o que estava acontecendo"] },
    },
    {
      num: 8,
      titulo: "O Celular à Mesa",
      theme: "Leitura social",
      tag: "Presença",
      illo: svgF3H8(),
      historia: "Durante o jantar em família, Laís ficou o tempo todo no celular respondendo mensagens dos amigos. Seu pai pediu que guardasse, ela ficou com raiva e disse que a família era chata. Os pais ficaram em silêncio, magoados.",
      observar: { pergunta: "O que Laís não percebeu sobre o impacto do seu comportamento na família?", linhas: 2 },
      pensamento: { texto: '"Meus amigos precisam de mim agora. A família sempre vai estar aqui, os amigos não."', pergunta: "Como a presença digital pode afetar os vínculos presenciais? O que se perde quando estamos físicamente em um lugar mas mentalmente em outro?" },
      parar: { dica: "Presença plena é um presente para quem está com você", pergunta: "Como Laís poderia equilibrar as duas coisas?", opcoes: ["Combinar um horário no jantar sem celular", "Avisar os amigos que está em família e responde depois"] },
    },
    {
      num: 9,
      titulo: "A Decisão do Grupo",
      theme: "Controle inibitório",
      tag: "Flexibilidade",
      illo: svgF3H9(),
      historia: "O grupo decidiu que o passeio seria no parque, mas Ana preferia o shopping. Ela ficou de cara fechada o dia todo, não participou das atividades e depois disse para a professora que o passeio foi terrível.",
      observar: { pergunta: "O que Ana escolheu fazer com sua frustração? Como isso afetou sua experiência e a do grupo?", linhas: 2 },
      pensamento: { texto: '"Como ninguém considerou minha opinião, vou mostrar que esse passeio não presta."', pergunta: "Quando nosso desejo não vence a votação do grupo, o que é mais saudável: estragar ou adaptar?" },
      parar: { dica: "Flexibilidade não é fraqueza — é uma habilidade social importante", pergunta: "O que Ana poderia ter feito para aproveitar melhor o passeio?", opcoes: ["Tentar se envolver nas atividades com mente aberta", "Sugerir o shopping como próxima opção em vez de sabotar esse"] },
    },
    {
      num: 10,
      titulo: "A Postagem e o Like",
      theme: "Pensamentos automáticos",
      tag: "Aprovação digital",
      illo: svgF3H10(),
      historia: "Lucas postou uma foto que considerava bacana e ficou verificando os likes a cada minuto. Quando um colega famoso não curtiu, começou a questionar se havia algo errado com ele, deletou a foto e ficou cabisbaixo o dia todo.",
      observar: { pergunta: "Como a falta de aprovação online afetou Lucas? O que ele buscava nos likes?", linhas: 2 },
      pensamento: { texto: '"Se ele não curtiu, é porque acha que sou sem graça. Só tenho valor se as pessoas curtirem."', pergunta: "Aprovação online é uma medida confiável de valor pessoal? O que mais pode indicar nosso valor?" },
      parar: { dica: "Nosso valor não muda conforme o número de likes", pergunta: "O que Lucas poderia pensar diferente sobre os likes?", opcoes: ["Lembrar que likes não definem quem ele é", "Conversar com alguém próximo sobre como se sentiu"] },
    },
  ],
  f4: [
    {
      num: 1,
      titulo: "A Rejeição na Paquera",
      theme: "Pensamentos automáticos",
      tag: "Rejeição",
      image: "/assets/cards/f4_h1_paquera.jpg",
      illo: svgF4H1(),
      historia: "Gabriel se declarou para Júlia e ela disse que o via apenas como amigo. Ele ficou com raiva, começou a ignorá-la completamente, falou mal dela para outros amigos e parou de aparecer nos eventos onde ela estaria.",
      observar: { pergunta: "Como Gabriel processou a rejeição? Quais comportamentos resultaram disso?", linhas: 2 },
      pensamento: { texto: '"Ela me rejeitou porque sou um fracasso. Nunca vou conseguir nada com ninguém."', pergunta: "Uma rejeição diz algo permanente sobre você como pessoa? O que define o valor de alguém além de ser correspondido?" },
      parar: { dica: "Rejeição é uma parte normal das relações — não uma sentença", pergunta: "Como Gabriel poderia responder à rejeição de forma mais saudável?", opcoes: ["Agradecer a honestidade de Júlia e dar tempo para si mesmo processar", "Manter a amizade sem alimentar expectativas ou rancor"] },
    },
    {
      num: 2,
      titulo: "A Pressão do Grupo",
      theme: "Controle inibitório",
      tag: "Conformidade",
      illo: svgF4H2(),
      historia: "Os amigos de Marcos insistiram para que ele fosse a uma festa sem aviso aos pais. Ele não queria, mas com medo de ser chamado de covarde, acabou indo. Na festa, sentiu-se desconfortável a noite toda e chegou em casa tarde, gerando uma grande briga familiar.",
      observar: { pergunta: "O que Marcos priorizou ao ceder à pressão? Quais foram as consequências?", linhas: 2 },
      pensamento: { texto: '"Se eu disser não, eles vão me achar fraco e me excluir do grupo."', pergunta: "Um grupo que exige que você fale mentiras e viole seus limites para pertencer é saudável? O que é coragem real?" },
      parar: { dica: "Dizer não ao grupo às vezes é dizer sim a si mesmo", pergunta: "Como Marcos poderia ter lidado com a pressão?", opcoes: ["Dizer: \"Não vou agora, mas curti a ideia para outra vez com aviso\"", "Propor ao grupo uma alternativa que não exigisse mentir para os pais"] },
    },
    {
      num: 3,
      titulo: "O Comentário nas Redes",
      theme: "Pensamentos automáticos",
      tag: "Autocrítica",
      illo: svgF4H3(),
      historia: "Beatriz postou um trabalho artístico que levou semanas fazendo. Um perfil anônimo comentou algo negativo. Ela ficou horas relendo o comentário, chegou a deletar o perfil inteiro e passou dias sem conseguir criar nada.",
      observar: { pergunta: "O que um comentário anônimo fez com a autoconfiança de Beatriz? Como isso afetou sua criatividade?", linhas: 2 },
      pensamento: { texto: '"Se alguém criticou, deve ter razão. Minha arte não presta. Não sou boa o suficiente."', pergunta: "Um comentário anônimo tem peso real sobre o valor do seu trabalho? Como artistas lidam com críticas?" },
      parar: { dica: "Crítica anônima diz mais sobre quem escreve do que sobre você", pergunta: "O que Beatriz poderia fazer em vez de deletar tudo?", opcoes: ["Separar feedback útil de comentário destrutivo e seguir criando", "Compartilhar o que sentiu com alguém de confiança antes de tomar decisões"] },
    },
    {
      num: 4,
      titulo: "O Conflito com o Professor",
      theme: "Habilidades sociais",
      tag: "Assertividade",
      illo: svgF4H4(),
      historia: "O professor corrigiu Rodrigo de forma que ele achou injusta na frente da turma. Rodrigo respondeu com ironia, o professor pediu que saísse da sala, e o conflito virou uma suspensão. Rodrigo disse para os pais que o professor tinha perseguição pessoal contra ele.",
      observar: { pergunta: "O que Rodrigo priorizou no momento: ter razão ou resolver o problema? Quais foram as consequências?", linhas: 2 },
      pensamento: { texto: '"Não posso deixar que me humilhem. Preciso mostrar que não aceito isso."', pergunta: "Existe diferença entre defender-se com assertividade e escalar um conflito? Quando vale a pena escolher qual estratégia?" },
      parar: { dica: "Escolher a hora e forma certa para se expressar amplia seu poder, não o reduz", pergunta: "O que Rodrigo poderia ter feito de diferente?", opcoes: ["Escutar a correção no momento e pedir para conversar depois em particular", "Pedir educadamente uma explicação sem ironia ou confronto público"] },
    },
    {
      num: 5,
      titulo: "A Amizade Tóxica",
      theme: "Leitura social",
      tag: "Limites",
      illo: svgF4H5(),
      historia: "Camila tem uma amiga que frequentemente a critica, cancela combinados de última hora e a faz sentir mal. Mas quando Camila tenta se afastar, a amiga a procura com carinho e ela volta. O ciclo se repete há meses.",
      observar: { pergunta: "Como funciona o padrão de comportamento da amiga? O que prende Camila a esse ciclo?", linhas: 2 },
      pensamento: { texto: '"Ela tem seus problemas. Quando não está mal, é minha melhor amiga. Eu não posso largar."', pergunta: "Que diferença existe entre ter empatia por alguém e aceitar ser maltratada? O que define uma amizade saudável?" },
      parar: { dica: "Cuidar de si mesmo não é egoísmo, é necessidade", pergunta: "O que Camila poderia fazer em relação a essa amizade?", opcoes: ["Colocar limites claros sobre comportamentos que não aceita", "Conversar com a amiga sobre o padrão que percebeu"] },
    },
    {
      num: 6,
      titulo: "O Primeiro Emprego",
      theme: "Pensamentos automáticos",
      tag: "Aprendizado",
      illo: svgF4H6(),
      historia: "Felipe começou no primeiro emprego e cometeu um erro pequeno no caixa. O supervisor apontou o erro na frente dos colegas. Felipe ficou tão envergonhado que no outro dia não foi trabalhar e pensou em pedir demissão.",
      observar: { pergunta: "Como Felipe interpretou a correção do supervisor? Sua reação foi proporcional ao acontecimento?", linhas: 2 },
      pensamento: { texto: '"Errei logo no começo. Vão me demitir. Sou péssimo nisso e nunca vou conseguir trabalhar."', pergunta: "Todo erro em um trabalho novo é uma demissão? O que iniciantes têm o direito de fazer?" },
      parar: { dica: "Errar no começo faz parte do processo de aprender qualquer coisa", pergunta: "O que Felipe poderia pensar e fazer diferente?", opcoes: ["Voltar ao trabalho, pedir desculpas ao supervisor e perguntar como melhorar", "Lembrar que erros no início são esperados e aceitáveis"] },
    },
    {
      num: 7,
      titulo: "O Ciúme no Relacionamento",
      theme: "Controle inibitório",
      tag: "Insegurança",
      illo: svgF4H7(),
      historia: "Quando o namorado de Ana foi a uma festa sem ela, ela ficou mandando mensagens a cada meia hora. Quando ele demorou a responder, ela foi até o local procurá-lo. O namorado ficou constrangido na frente dos amigos e eles tiveram uma briga séria.",
      observar: { pergunta: "O que o ciúme de Ana a levou a fazer? Como isso afetou a relação?", linhas: 2 },
      pensamento: { texto: '"Se ele não responde, está me escondendo algo. Preciso saber o que está acontecendo."', pergunta: "Controlar os movimentos do parceiro é confiança ou insegurança? O que uma relação saudável precisa?" },
      parar: { dica: "Confiança é a base de qualquer relacionamento saudável", pergunta: "O que Ana poderia fazer com o ciúme que sentiu?", opcoes: ["Distrair-se e esperar ele chegar para conversar com calma", "Refletir de onde vem a insegurança e conversar sobre isso na relação"] },
    },
    {
      num: 8,
      titulo: "A Decisão de Carreira",
      theme: "Pensamentos automáticos",
      tag: "Autenticidade",
      illo: svgF4H8(),
      historia: "Todos os amigos de Lucas escolheram cursos de exatas. Ele queria fazer teatro, mas com medo do julgamento dos pais e da turma, foi fazer engenharia. No final do semestre, estava reprovando em tudo e se sentindo perdido.",
      observar: { pergunta: "O que Lucas priorizou ao escolher o curso? Quais foram as consequências dessa escolha?", linhas: 2 },
      pensamento: { texto: '"Se eu fizer teatro, vão achar que sou irresponsável. Preciso seguir o que é esperado de mim."', pergunta: "Quantas decisões importantes se tomam para agradar os outros? Quem é o maior prejudicado quando fazemos isso?" },
      parar: { dica: "Autenticidade nas escolhas de vida protege nossa saúde mental", pergunta: "O que Lucas poderia fazer em relação à sua escolha de carreira?", opcoes: ["Conversar honestamente com os pais sobre o que realmente quer", "Pesquisar possibilidades reais no teatro antes de decidir baseado no medo"] },
    },
    {
      num: 9,
      titulo: "A Fofoca Viral",
      theme: "Habilidades sociais",
      tag: "Responsabilidade",
      illo: svgF4H9(),
      historia: "Mariana compartilhou uma informação sobre uma colega em um grupo pequeno, pedindo segredo. Em 24 horas, toda a escola sabia. A colega a confrontou chorando. Mariana ficou na defensiva, dizendo que não foi culpa dela.",
      observar: { pergunta: "Qual foi a responsabilidade de Mariana no que aconteceu? Como ela respondeu a isso?", linhas: 2 },
      pensamento: { texto: '"Quem deveria ter guardado segredo eram os outros. Eu não fiz nada de errado."', pergunta: "Qual a diferença entre transferir culpa e assumir responsabilidade? Como erros nas relações se reparam?" },
      parar: { dica: "Assumir erros enfraquece o problema e fortalece a relação", pergunta: "O que Mariana poderia fazer para reparar o que aconteceu?", opcoes: ["Pedir desculpas à colega de forma direta e sincera", "Reconhecer sua parte no ocorrido sem justificativas"] },
    },
    {
      num: 10,
      titulo: "A Comparação nas Redes Sociais",
      theme: "Pensamentos automáticos",
      tag: "Autoestima",
      illo: svgF4H10(),
      historia: "Sofia passou horas olhando perfis de pessoas com vidas que pareciam perfeitas. Começou a achar que sua vida era medíocre, seus amigos eram poucos e seu corpo era errado. Parou de postar fotos próprias e foi se isolando.",
      observar: { pergunta: "O que comparar sua vida real com perfis curados online fez com Sofia? O que ela deixou de fazer?", linhas: 2 },
      pensamento: { texto: '"A vida dos outros é muito melhor que a minha. Eu fico para trás em tudo."', pergunta: "O que os perfis online mostram vs. o que omitem? Como as redes sociais distorcem comparações?" },
      parar: { dica: "Comparar sua vida real com o highlight reel dos outros é sempre injusto", pergunta: "O que Sofia poderia fazer para cuidar de sua saúde mental nas redes?", opcoes: ["Limitar o tempo de exposição a perfis que geram comparação", "Seguir perfis que inspiram sem gerar desvalorização própria"] },
    },
  ],
  f5: [
    {
      num: 1,
      titulo: "O Fim do Relacionamento",
      theme: "Pensamentos automáticos",
      tag: "Luto emocional",
      illo: svgF5H1(),
      historia: "Diego e Clara terminaram depois de um ano juntos. Diego passou as semanas seguintes relendo as conversas antigas, checando o perfil dela múltiplas vezes ao dia, e enviando mensagens que ela não respondia. Ele sentia que não conseguia seguir em frente.",
      observar: { pergunta: "O que o comportamento de Diego revela sobre como ele está processando o término? Como isso afeta sua recuperação?", linhas: 2 },
      pensamento: { texto: '"Sem ela, não sou nada. Nunca vou me sentir bem de novo. Eu estraguei a única coisa boa que tinha."', pergunta: "Que pensamentos automáticos aparecem em término de relacionamentos? Como a ruminação prolonga a dor em vez de curar?" },
      parar: { dica: "Processar luto emocional requer intenção e autocompaixão", pergunta: "Que ações concretas Diego poderia tomar para sair desse ciclo?", opcoes: ["Criar distância digital por um período (deixar de seguir ou silenciar) para dar espaço ao processo", "Buscar apoio de amigos ou profissional em vez de ruminar sozinho"] },
    },
    {
      num: 2,
      titulo: "A Discordância Política",
      theme: "Habilidades sociais",
      tag: "Diálogo",
      illo: svgF5H2(),
      historia: "Durante uma aula, a professora fez uma afirmação política com a qual Isabela discordava intensamente. Isabela interrompeu várias vezes, levantou a voz e, quando a professora pediu para aguardar, disse que a escola censurava opiniões. Saiu da aula antes do fim.",
      observar: { pergunta: "O que Isabela priorizou no momento: expressar-se ou ser ouvida? Que consequências isso gerou?", linhas: 2 },
      pensamento: { texto: '"Quem não concorda precisa ser confrontado na hora. Ficar quieta é ser conivente."', pergunta: "Existe diferença entre ter uma opinião forte e saber o momento e a forma de expressá-la? Que estratégias ampliam o impacto do que dizemos?" },
      parar: { dica: "A forma como falamos determina se seremos ouvidos ou apenas tolerados", pergunta: "Como Isabela poderia ter expressado sua discordância com mais eficácia?", opcoes: ["Esperar a hora certa para colocar sua perspectiva de forma estruturada", "Solicitar um debate formal ou espaço para posições alternativas"] },
    },
    {
      num: 3,
      titulo: "A Síndrome do Impostor",
      theme: "Pensamentos automáticos",
      tag: "Autoeficácia",
      illo: svgF5H3(),
      historia: "Pedro foi selecionado para um programa de jovens líderes concorrido. Em vez de comemorar, ficou convicto de que cometeram um engano, que descobririam que não era bom o suficiente e recusou participar. Não contou para ninguém sua insegurança.",
      observar: { pergunta: "O que aconteceu entre a conquista objetiva e a percepção que Pedro tinha de si mesmo?", linhas: 2 },
      pensamento: { texto: '"Fui selecionado por engano. Quando perceberem que não sou bom o suficiente, vou me envergonhar."', pergunta: "A síndrome do impostor afeta principalmente pessoas incompetentes ou altamente competentes? O que a pesquisa diz sobre isso?" },
      parar: { dica: "Sua seleção reflete capacidade real — o medo não cancela os fatos", pergunta: "O que Pedro poderia fazer para enfrentar esse padrão?", opcoes: ["Listar evidências concretas de suas conquistas antes de desistir", "Conversar com alguém de confiança sobre o que está sentindo"] },
    },
    {
      num: 4,
      titulo: "O Cuidado com os Limites",
      theme: "Controle inibitório",
      tag: "Limites",
      illo: svgF5H4(),
      historia: "Fernanda tem a reputação de sempre ajudar a todos. Ela aceita fazer trabalhos por colegas, fica disponível 24h para mensagens, e quando diz não, passa horas se sentindo culpada. Ultimamente está exausta e ressentida, mas continua dizendo sim.",
      observar: { pergunta: "O que move Fernanda a dizer sempre sim? Que custo emocional ela paga por isso?", linhas: 2 },
      pensamento: { texto: '"Se eu disser não, vão achar que sou egoísta. Meu valor vem de ser útil para os outros."', pergunta: "Qual a diferença entre generosidade genuína e autossacrifício compulsivo? Limites protegem ou prejudicam relacionamentos?" },
      parar: { dica: "Não é um limite, não é uma rejeição — é uma necessidade saudável", pergunta: "Como Fernanda poderia começar a estabelecer limites?", opcoes: ["Praticar um 'não obrigado, não consigo agora' sem dar explicações longas", "Identificar quais pedidos drenam energia e priorizar o que alinha com seus valores"] },
    },
    {
      num: 5,
      titulo: "A Ansiedade do Vestibular",
      theme: "Pensamentos automáticos",
      tag: "Ansiedade",
      illo: svgF5H5(),
      historia: "Restam dois meses para o vestibular de Lucas. Ele passa mais tempo organizando o material do que estudando de fato, dorme mal, e quando senta para estudar não consegue absorver nada. Diz que vai travar na prova e arruinar tudo.",
      observar: { pergunta: "O que a ansiedade está fazendo com a capacidade de Lucas de estudar? Que ciclo se formou?", linhas: 2 },
      pensamento: { texto: '"Se eu não passar, vou decepcionar todos. Minha vida vai desandar para sempre."', pergunta: "Pensamentos catastróficos sobre o futuro geram mais ou menos capacidade de agir no presente? O que a catastrofização faz com nossa performance?" },
      parar: { dica: "Focar no próximo passo concreto quebra o ciclo da catastrofização", pergunta: "O que Lucas poderia fazer para estudar com mais eficiência?", opcoes: ["Dividir o estudo em blocos pequenos com pausas programadas (técnica Pomodoro)", "Buscar apoio psicológico para manejar a ansiedade antes que paralise mais"] },
    },
    {
      num: 6,
      titulo: "A Amizade com Propósito",
      theme: "Leitura social",
      tag: "Reciprocidade",
      illo: svgF5H6(),
      historia: "Giovana percebeu que seu amigo Rafael só a procurava quando precisava de algo: carona, ajuda em trabalhos, conselhos nas crises. Quando ela precisava, ele sumia. Quando ela tentou falar sobre isso, ele ficou na defensiva e a acusou de ser dramática.",
      observar: { pergunta: "Que padrão Giovana identificou nessa amizade? O que aconteceu quando ela nomeou o padrão?", linhas: 2 },
      pensamento: { texto: '"Talvez eu esteja exagerando. Ele tem seus momentos bons. Se me afastar, vou perder um amigo."', pergunta: "O que diferencia um amigo que passa por fases difíceis de alguém que tem um padrão consistente de reciprocidade zero?" },
      parar: { dica: "Nomear padrões relacionais é o primeiro passo para mudá-los", pergunta: "O que Giovana poderia fazer em relação a essa amizade?", opcoes: ["Estabelecer um limite claro sobre o que consegue oferecer sem reciprocidade", "Avaliar se essa amizade traz mais esgotamento ou nutrição emocional"] },
    },
    {
      num: 7,
      titulo: "A Pressão da Identidade",
      theme: "Pensamentos automáticos",
      tag: "Autenticidade",
      illo: svgF5H7(),
      historia: "Toda vez que Mateus expressava interesse em moda e design, recebia comentários irônicos de amigos e parentes. Com o tempo, passou a esconder esses interesses, escolheu um curso que não queria para evitar julgamentos, e foi ficando cada vez mais infeliz.",
      observar: { pergunta: "O que Mateus sacrificou para se encaixar nas expectativas externas? Que impacto isso teve nele?", linhas: 2 },
      pensamento: { texto: '"Se eu for quem realmente sou, serei julgado e excluído. Melhor ser quem esperam que eu seja."', pergunta: "O que custa mais a longo prazo: o desconforto de ser autêntico ou a exaustão de se esconder?" },
      parar: { dica: "Autenticidade é a base de uma identidade psicologicamente estável", pergunta: "O que Mateus poderia fazer para se reconectar com quem realmente é?", opcoes: ["Identificar um espaço seguro onde possa ser autêntico sem julgamento", "Conversar com alguém de confiança sobre seus interesses reais"] },
    },
    {
      num: 8,
      titulo: "A Gestão do Fracasso",
      theme: "Pensamentos automáticos",
      tag: "Resiliência",
      illo: svgF5H8(),
      historia: "Laura foi reprovada em um processo seletivo para uma universidade prestigiosa. Ficou sem falar com a família, trancou o quarto por dias, recusou-se a tentar qualquer outro processo e deu por encerrados seus planos de futuro.",
      observar: { pergunta: "Como Laura respondeu ao fracasso? O que a resposta dela ao fracasso diz sobre como ela interpreta erros?", linhas: 2 },
      pensamento: { texto: '"Se eu não consigo entrar lá, não sou capaz o suficiente. Não adianta tentar mais nada."', pergunta: "Fracasso é um evento ou uma identidade? O que diferencia pessoas resilientes na forma como interpretam rejeições?" },
      parar: { dica: "Fracasso é dado, não destino — como reagimos a ele define mais do que o fracasso em si", pergunta: "Como Laura poderia processar essa rejeição de forma mais funcional?", opcoes: ["Permitir-se sentir a decepção por um tempo determinado, depois revisitar os planos", "Buscar feedback do processo seletivo para aprender e replanejar"] },
    },
    {
      num: 9,
      titulo: "O Conflito de Valores",
      theme: "Controle inibitório",
      tag: "Valores",
      illo: svgF5H9(),
      historia: "Os amigos de Thiago planejaram fazer algo que ele achou errado eticamente, mas foi junto para não criar atrito. Durante e depois, sentiu-se mal consigo mesmo. Quando tentou falar sobre isso depois, os amigos disseram que ele era \"chato e moralista\".",
      observar: { pergunta: "O que aconteceu quando Thiago cedeu seus valores para pertencer? Como ele se sentiu?", linhas: 2 },
      pensamento: { texto: '"Se eu discordar, eles vão me excluir. É melhor ir junto e não criar problema."', pergunta: "Que preço se paga por agir contra os próprios valores para pertencer? O que define um grupo de pares saudável?" },
      parar: { dica: "Pertencer a um grupo que exige que você abandone seus valores não é pertencer — é se perder", pergunta: "O que Thiago poderia ter feito diferente?", opcoes: ["Expressar sua discordância com clareza mesmo sabendo que poderia criar atrito", "Optar por não participar de atividades que violam seus valores, sem precisar explicar excessivamente"] },
    },
    {
      num: 10,
      titulo: "A Busca por Sentido",
      theme: "Pensamentos automáticos",
      tag: "Propósito",
      illo: svgF5H10(),
      historia: "Após terminar o ensino médio, Carla sentiu um vazio imenso. Enquanto todos pareciam entusiasmados com o futuro, ela se sentia perdida, sem saber o que queria. Ficou em casa evitando perguntas sobre seus planos, sentindo que havia algo de errado com ela.",
      observar: { pergunta: "O que Carla está experimentando? Como ela interpreta seu estado emocional?", linhas: 2 },
      pensamento: { texto: '"Todo mundo sabe o que quer menos eu. Algo deve estar errado comigo. Sou a única perdida."', pergunta: "Sentir-se perdido numa transição de vida é incomum ou esperado? O que ajuda as pessoas a encontrarem direção em momentos de vazio?" },
      parar: { dica: "Não saber o próximo passo não é falha — é o começo de uma descoberta", pergunta: "O que Carla poderia fazer para começar a encontrar direção?", opcoes: ["Explorar interesses sem pressão de resultado imediato (voluntariado, cursos breves, leituras)", "Conversar com pessoas que também sentiram isso e encontraram seu caminho"] },
    },
  ],
};
