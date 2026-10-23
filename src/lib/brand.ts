import { z } from 'zod'

/*
 * Бренд сайта — айсберг: над водой айдентика (логотип, цвет, шрифты, упаковка, реклама, соцсети, сайт),
 * под водой стратегия (исследование, предложение, конкуренты, отличие, клиенты, история, обещание, миссия,
 * тон и голос, визуальный образ, видение). Страница бренд-бука — /<slug>/brand, логотип — в шапке, подвале,
 * иконке и карточке для соцсетей.
 *
 * Знак логотипа — список фигур в поле 100×100, а не SVG-строка: JSON сайта правят из админки, и произвольная
 * разметка позволила бы подложить скрипт. Цвет фигуры — роль из темы сайта (fg, accent…), поэтому знак сам
 * перекрашивается вместе с темой и на тёмном/светлом фоне (inverse — для печати на акцентном цвете).
 */

const text = z.string().default('')
const num = z.number().finite()
export const ROLES = ['fg', 'bg', 'accent', 'muted', 'surface', 'line', 'none'] as const
const role = z.enum(ROLES)
const paint = { fill: role.default('fg'), stroke: role.default('none'), sw: num.min(0).max(20).default(0), op: num.min(0).max(1).default(1) }
// путь — только команды и числа: ни кавычек, ни скобок
const pathData = z.string().max(4000).regex(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]*$/)

export const shapeSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('path'), d: pathData, ...paint, cap: z.enum(['butt', 'round', 'square']).default('round') }),
  z.object({ t: z.literal('circle'), cx: num, cy: num, r: num.min(0), ...paint }),
  z.object({ t: z.literal('ellipse'), cx: num, cy: num, rx: num.min(0), ry: num.min(0), ...paint }),
  z.object({ t: z.literal('rect'), x: num, y: num, w: num.min(0), h: num.min(0), rx: num.min(0).default(0), rot: num.default(0), ...paint }),
])
export type Shape = z.infer<typeof shapeSchema>

export const logoSchema = z.object({
  shapes: z.array(shapeSchema).max(40).default([]),
  /** надпись логотипа: свой регистр, начертание и разрядка — часть айдентики */
  word: z
    .object({
      text: text,
      font: text, // из lib/fonts.ts; пусто — шрифт заголовков темы
      weight: z.number().int().min(100).max(900).default(600),
      tracking: num.min(-0.2).max(0.6).default(0),
      case: z.enum(['as', 'upper', 'lower']).default('as'),
      italic: z.boolean().default(false),
      /** вторая строка мелко под надписью (например «кофейня · с 2016») */
      sub: text,
    })
    .default({ text: '', font: '', weight: 600, tracking: 0, case: 'as', italic: false, sub: '' }),
  /** знак слева, знак над надписью, только знак, только надпись */
  layout: z.enum(['row', 'stack', 'mark', 'word']).default('row'),
  /** зачем такой знак — для бренд-бука */
  idea: text,
})
export type Logo = z.infer<typeof logoSchema>

const item = z.object({ title: text, text })
export const MOCKUPS = ['cup', 'box', 'bag', 'bottle', 'jar', 'tag', 'card', 'sticker', 'tube', 'menu', 'billboard', 'poster', 'sign', 'apparel', 'vehicle', 'ticket'] as const
const mockup = z.object({ kind: z.enum(MOCKUPS), title: text, text })
export const POSTS = ['quote', 'offer', 'product', 'fact'] as const

export const brandSchema = z.object({
  // ── под водой: стратегия ──
  research: text,
  offering: text,
  competitors: z.array(z.object({ name: text, note: text })).default([]),
  differentiation: text,
  customers: z.array(z.object({ name: text, need: text })).default([]),
  story: text,
  promise: text,
  mission: text,
  vision: text,
  values: z.array(item).default([]),
  voice: z
    .object({ traits: z.array(z.string()).default([]), do: z.array(z.string()).default([]), dont: z.array(z.string()).default([]), sample: text })
    .default({ traits: [], do: [], dont: [], sample: '' }),
  look: z.object({ keywords: z.array(z.string()).default([]), text }).default({ keywords: [], text: '' }),
  // ── над водой: айдентика ──
  logo: logoSchema.optional(),
  palette: z.array(z.object({ name: text, hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), role: text })).default([]),
  type: z.object({ display: text, body: text, notes: text }).default({ display: '', body: '', notes: '' }),
  packaging: z.array(mockup).default([]),
  marketing: z.array(mockup).default([]),
  social: z
    .object({ handle: text, bio: text, posts: z.array(z.object({ kind: z.enum(POSTS), title: text, text })).default([]) })
    .default({ handle: '', bio: '', posts: [] }),
})
export type Brand = z.infer<typeof brandSchema>

export type Colors = { bg: string; fg: string; accent: string; muted: string; surface: string; line: string }
export const roleColor = (r: (typeof ROLES)[number], c: Colors) => (r === 'none' ? 'none' : c[r])

/** Знак строкой SVG — для иконки и карточки соцсетей (там нет React-разметки, только картинка). */
export function markSvg(shapes: Shape[], c: Colors, size = 100): string {
  const attr = (s: Shape) =>
    `fill="${roleColor(s.fill, c)}" stroke="${roleColor(s.stroke, c)}" stroke-width="${s.sw}" opacity="${s.op}"`
  const body = shapes
    .map((s) => {
      if (s.t === 'path') return `<path d="${s.d}" ${attr(s)} stroke-linecap="${s.cap}" stroke-linejoin="round"/>`
      if (s.t === 'circle') return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${attr(s)}/>`
      if (s.t === 'ellipse') return `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" ${attr(s)}/>`
      return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx}" transform="rotate(${s.rot} ${s.x + s.w / 2} ${s.y + s.h / 2})" ${attr(s)}/>`
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${body}</svg>`
}

export const wordText = (w: Logo['word'], name: string) => {
  const t = w.text || name
  return w.case === 'upper' ? t.toUpperCase() : w.case === 'lower' ? t.toLowerCase() : t
}
