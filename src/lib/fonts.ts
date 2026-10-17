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

export function fontStack(name: string): string {
  return FONTS[name as FontName] ?? `'${name}', sans-serif`
}
