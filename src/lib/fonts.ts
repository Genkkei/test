import { FONT_CATEGORY, FONT_CSS } from './fonts.generated'
/*
 * Шрифты лежат локально (@fontsource), из сети при сборке не скачиваются.
 * Все — с кириллицей: сайты русскоязычные, и латинская гарнитура без кириллицы
 * молча подменилась бы системной.
 */
export const FONTS = {
  'Unbounded': "'Unbounded Variable', sans-serif",
  'Inter Tight': "'Inter Tight Variable', sans-serif",
  'Manrope': "'Manrope Variable', sans-serif",
  'Onest': "'Onest Variable', sans-serif",
  'Playfair Display': "'Playfair Display Variable', serif",
  'Cormorant Garamond': "'Cormorant Garamond Variable', serif",
  'Jost': "'Jost Variable', sans-serif",
  'Golos Text': "'Golos Text Variable', sans-serif",
  'JetBrains Mono': "'JetBrains Mono Variable', monospace",
  'Dela Gothic One': "'Dela Gothic One', sans-serif",
  'Tenor Sans': "'Tenor Sans', sans-serif",
  'Prata': "'Prata', serif",
  'Montserrat': "'Montserrat Variable', sans-serif",
  'Oswald': "'Oswald Variable', sans-serif",
  'Yeseva One': "'Yeseva One', serif",
  'Rubik Mono One': "'Rubik Mono One', sans-serif",
  'Rubik': "'Rubik Variable', sans-serif",
  'Lora': "'Lora Variable', serif",
  'Nunito': "'Nunito Variable', sans-serif",
  'Russo One': "'Russo One', sans-serif",
  'Exo 2': "'Exo 2 Variable', sans-serif",
  'Raleway': "'Raleway Variable', sans-serif",
  'Literata': "'Literata Variable', serif",
  'Caveat': "'Caveat Variable', cursive",
} as const

export type FontName = keyof typeof FONTS
export const FONT_NAMES = Object.keys(FONTS) as FontName[]

// запасной шрифт — того же рода, пока грузится свой (у засечек — засечки, у моно — моно)
const FALLBACK: Record<string, string> = { serif: 'Georgia, serif', monospace: 'ui-monospace, monospace', handwriting: 'cursive', display: 'system-ui, sans-serif', 'sans-serif': 'system-ui, sans-serif' }

export function fontStack(name: string): string {
  return FONTS[name as FontName] ?? `'${name}', ${FALLBACK[FONT_CATEGORY[name]] ?? 'sans-serif'}`
}

/** Таблицы стилей шрифтов сайта, которых нет в общем наборе (scripts/fonts.mjs → public/fonts). */
export function fontLinks(names: (string | undefined)[]): string[] {
  return [...new Set(names.filter((n): n is string => !!n && !(n in FONTS) && !!FONT_CSS[n]).map((n) => FONT_CSS[n]))]
}
