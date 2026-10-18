// Та же презентация редактируемым PPTX: тексты — настоящие текстовые блоки, фоны со свечением —
// картинками из build.mjs (градиенты PowerPoint не умеет). Шрифты — из комплекта Office
// (Arial Black / Arial / Courier New): Unbounded у получателя может не стоять.
//   node docs/deck/build.mjs && node docs/deck/pptx.mjs
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { slides } from './content.mjs'

const require = createRequire(process.env.PPTX_NODE_MODULES || '/tmp/claude-0/pptxenv/package.json')
const pptxgen = require('pptxgenjs')
const out = path.join(process.cwd(), 'docs/deck/out')
const counts = JSON.parse(readFileSync(path.join(out, 'counts.json'), 'utf8'))
const deck = slides(counts)

const THEME = {
  name: 'cero point',
  headFontFace: 'Arial Black',
  bodyFontFace: 'Arial',
  colors: { dk1: '05050F', lt1: 'FFFFFF', dk2: '1B1B2B', lt2: 'E8E7EE', accent1: '5A4CF2', accent2: 'B9ADFF', accent3: '0B1F5C', accent4: '3A0D78', accent5: 'F6F5FF', accent6: 'FF6B6B', hlink: '5A4CF2', folHlink: '3A0D78' },
}
const C = { ink: '05050F', electric: '5A4CF2', glow: 'B9ADFF', paper: 'E8E7EE', white: 'F6F5FF', muted: '4A4A5A', dim: 'B4B3C6', card: 'FFFFFF', cardDark: '15152A', lineL: 'CFCFD8', lineD: '34344E' }

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE' // 13.333 × 7.5
pres.title = 'cero point — готовые сайты: настройка, продажа, передача'
pres.author = 'cero point'
pres.company = 'cero point'
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }

const W = 13.333
const X = 0.83
const CW = W - 2 * X
for (const [name, bg, fg] of [['DARK', 'bg-dark.png', C.white], ['LIGHT', 'bg-light.png', C.ink]]) {
  pres.defineSlideMaster({
    title: name,
    background: { path: path.join(out, bg) },
    objects: [
      { text: { text: 'cero point', options: { x: X, y: 0.45, w: 3, h: 0.4, fontFace: 'Arial Black', fontSize: 16, color: fg, margin: 0 } } },
      { text: { text: 'point.cero.uz/sites', options: { x: X, y: 6.95, w: 4, h: 0.3, fontFace: 'Courier New', fontSize: 9, color: fg, transparency: 40, margin: 0 } } },
    ],
    slideNumber: { x: W - X - 1, y: 6.95, w: 1, h: 0.3, fontFace: 'Courier New', fontSize: 9, color: fg, align: 'right' },
  })
}

const dark = (s) => s.kind === 'cover' || s.kind === 'end' || !!s.dark
const T = (slide, text, o) => slide.addText(text, { isTextBox: true, margin: 0, valign: 'top', ...o })

function header(slide, s, d) {
  const lab = (s.label || '').replace(/^\d+ \/ /, '')
  T(slide, (s.label || '').toUpperCase(), { x: W - X - 5, y: 0.47, w: 5, h: 0.3, fontFace: 'Courier New', fontSize: 9, color: d ? C.white : C.ink, transparency: 30, align: 'right', objectName: 'section' })
  T(slide, lab, { x: X, y: 1.05, w: CW, h: 0.4, fontSize: 15, italic: true, color: d ? C.glow : C.electric, objectName: 'label' })
  T(slide, s.title.toUpperCase(), { x: X, y: 1.45, w: CW, h: 0.95, fontFace: 'Arial Black', fontSize: 30, color: d ? C.white : C.ink, fit: 'shrink', objectName: 'title' })
  if (s.lead) T(slide, s.lead, { x: X, y: 2.42, w: CW * 0.85, h: 0.6, fontSize: 13, color: d ? C.dim : C.muted, objectName: 'lead' })
}

function card(slide, d, x, y, w, h, title, body, num) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: d ? C.cardDark : C.card }, line: { color: d ? C.lineD : C.lineL, width: 0.75 }, objectName: `card ${title}` })
  // загнутый угол листа — как на сайте cero point
  slide.addShape(pres.shapes.RIGHT_TRIANGLE, { x: x + w - 0.22, y, w: 0.22, h: 0.22, fill: { color: d ? C.lineD : C.lineL }, line: { color: d ? C.lineD : C.lineL, width: 0 }, rotate: 180, objectName: 'corner' })
  let ty = y + 0.18
  if (num) {
    T(slide, num, { x: x + 0.22, y: ty, w: w - 0.44, h: 0.25, fontFace: 'Courier New', fontSize: 10, color: d ? C.glow : C.electric })
    ty += 0.3
  }
  T(slide, title, { x: x + 0.22, y: ty, w: w - 0.5, h: 0.4, fontFace: 'Arial Black', fontSize: 13, color: d ? C.white : C.ink, fit: 'shrink' })
  T(slide, body, { x: x + 0.22, y: ty + 0.42, w: w - 0.44, h: h - (ty - y) - 0.55, fontSize: 11, color: d ? C.dim : C.muted, fit: 'shrink' })
}

function grid(slide, d, items, cols, top, bottom = 6.75, numbered = true) {
  const gap = 0.22
  const rows = Math.ceil(items.length / cols)
  const w = (CW - gap * (cols - 1)) / cols
  const h = (bottom - top - gap * (rows - 1)) / rows
  items.forEach(([a, b], i) => card(slide, d, X + (i % cols) * (w + gap), top + Math.floor(i / cols) * (h + gap), w, h, a, b, numbered ? String(i + 1).padStart(2, '0') : ''))
}

function steps(slide, d, items, top, bottom) {
  const gap = 0.12
  const h = Math.min(0.85, (bottom - top - gap * (items.length - 1)) / items.length)
  items.forEach(([a, b], i) => {
    const y = top + i * (h + gap)
    slide.addShape(pres.shapes.RECTANGLE, { x: X, y, w: CW, h, fill: { color: d ? C.cardDark : C.card }, line: { color: d ? C.lineD : C.lineL, width: 0.75 }, objectName: `step ${i + 1}` })
    T(slide, String(i + 1), { x: X + 0.2, y: y + 0.1, w: 0.5, h: h - 0.2, fontFace: 'Arial Black', fontSize: 24, color: d ? C.glow : C.electric, valign: 'middle' })
    T(slide, [
      { text: a, options: { fontFace: 'Arial Black', fontSize: 13, color: d ? C.white : C.ink, breakLine: true } },
      { text: b, options: { fontSize: 11, color: d ? C.dim : C.muted } },
    ], { x: X + 0.85, y: y + 0.08, w: CW - 1.1, h: h - 0.16, valign: 'middle', fit: 'shrink' })
  })
}

function note(slide, d, text, y) {
  T(slide, text, { x: X, y, w: CW, h: 0.45, fontSize: 11, color: d ? C.dim : C.muted, objectName: 'note' })
}

for (const s of deck) {
  const d = dark(s)
  const slide = pres.addSlide({ masterName: d ? 'DARK' : 'LIGHT' })
  if (s.kind === 'cover' || s.kind === 'end') {
    if (s.label) T(slide, s.label, { x: X, y: 1.5, w: CW, h: 0.4, fontSize: 16, italic: true, color: C.glow })
    T(slide, s.title.toUpperCase(), { x: X, y: s.kind === 'cover' ? 2.0 : 2.6, w: CW, h: 2.0, fontFace: 'Arial Black', fontSize: 44, color: C.white, fit: 'shrink', objectName: 'title' })
    T(slide, s.plate, { x: X, y: s.kind === 'cover' ? 4.15 : 4.8, w: CW * 0.8, h: 0.8, fontSize: 16, color: C.ink, fill: { color: C.white }, margin: [6, 10, 6, 10], objectName: 'plate' })
    if (s.meta)
      s.meta.forEach(([a, b], i) => {
        T(slide, [
          { text: a.toUpperCase(), options: { fontFace: 'Courier New', fontSize: 9, color: C.dim, breakLine: true } },
          { text: b, options: { fontSize: 14, color: C.white } },
        ], { x: X + i * 2.9, y: 5.6, w: 2.8, h: 0.7 })
      })
    slide.addNotes(s.kind === 'cover' ? 'Обложка: что это за документ и для кого.' : 'Финал.')
    continue
  }
  header(slide, s, d)
  const top = s.lead ? 3.15 : 2.6
  if (s.kind === 'stats') {
    const w = (CW - 0.22 * 3) / 4
    s.stats.forEach(([a, b], i) => {
      const x = X + i * (w + 0.22)
      slide.addShape(pres.shapes.RECTANGLE, { x, y: top + 0.2, w, h: 2.4, fill: { color: C.card }, line: { color: C.lineL, width: 0.75 } })
      T(slide, a, { x: x + 0.22, y: top + 0.45, w: w - 0.44, h: 1.0, fontFace: 'Arial Black', fontSize: a.length > 5 ? 26 : 44, color: C.ink, fit: 'shrink' })
      T(slide, b, { x: x + 0.22, y: top + 1.55, w: w - 0.44, h: 0.9, fontSize: 12, color: C.muted })
    })
  } else if (s.kind === 'flow') grid(slide, d, s.items, 4, top + 0.2, 5.6)
  else if (s.kind === 'cards' || s.kind === 'qa') grid(slide, d, s.items, s.items.length > 4 ? 3 : 2, top, 6.7, s.kind === 'cards')
  else if (s.kind === 'prices') {
    const w = (CW - 0.44) / 3
    s.plans.forEach(([n, p, l], i) => {
      const x = X + i * (w + 0.22)
      const best = n.includes('★')
      slide.addShape(pres.shapes.RECTANGLE, { x, y: top, w, h: 3.0, fill: { color: best ? C.white : C.cardDark }, line: { color: best ? C.white : C.lineD, width: 0.75 } })
      T(slide, n, { x: x + 0.22, y: top + 0.18, w: w - 0.44, h: 0.35, fontFace: 'Arial Black', fontSize: 13, color: best ? C.ink : C.white })
      T(slide, p, { x: x + 0.22, y: top + 0.55, w: w - 0.44, h: 0.55, fontFace: 'Arial Black', fontSize: 22, color: best ? C.ink : C.white })
      T(slide, l.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < l.length - 1 } })), { x: x + 0.22, y: top + 1.2, w: w - 0.44, h: 1.7, fontSize: 11, color: best ? C.muted : C.dim, paraSpaceAfter: 4, fit: 'shrink' })
    })
    note(slide, d, s.note, top + 3.2)
  } else if (s.kind === 'scenarios') {
    const w = CW / 4
    s.funnel.forEach(([a, b], i) => {
      slide.addShape(pres.shapes.LINE, { x: X + i * w, y: top, w: 0, h: 0.9, line: { color: C.electric, width: 2 } })
      T(slide, [
        { text: a, options: { fontFace: 'Arial Black', fontSize: 24, color: C.ink, breakLine: true } },
        { text: b, options: { fontSize: 10, color: C.muted } },
      ], { x: X + i * w + 0.15, y: top, w: w - 0.25, h: 0.95 })
    })
    slide.addTable(
      s.rows.map((r, i) => r.map((c, j) => ({ text: c, options: { fontFace: j === 0 ? 'Arial Black' : 'Arial', fontSize: 12, color: C.ink, fill: { color: i === 1 ? C.card : C.paper } } }))),
      { x: X, y: top + 1.15, w: CW, colW: [2.2, 2.6, 2.4, CW - 7.2], rowH: 0.45, border: { type: 'solid', color: C.lineL, pt: 0.75 } },
    )
    note(slide, d, s.note, top + 2.75)
  } else if (s.kind === 'script' || s.kind === 'steps') {
    steps(slide, d, s.steps, top, s.note ? 6.1 : 6.75)
    if (s.note) note(slide, d, s.note, 6.2)
  } else if (s.kind === 'handover') {
    const w = (CW - 0.44) / 3
    const cols = [['Отправить', s.send, C.glow], ['Никогда не отправлять', s.never, 'FF6B6B']]
    cols.forEach(([t, list, col], i) => {
      T(slide, t, { x: X + i * (w + 0.22), y: top, w, h: 0.35, fontSize: 14, italic: true, color: C.glow })
      T(slide, list.map((x, j) => ({ text: x, options: { bullet: { code: '2014' }, breakLine: j < list.length - 1 } })), { x: X + i * (w + 0.22), y: top + 0.45, w, h: 3.2, fontSize: 13, color: C.white, paraSpaceAfter: 8 })
      void col
    })
    T(slide, 'Сообщение клиенту', { x: X + 2 * (w + 0.22), y: top, w, h: 0.35, fontSize: 14, italic: true, color: C.glow })
    T(slide, s.message, { x: X + 2 * (w + 0.22), y: top + 0.45, w, h: 2.4, fontFace: 'Courier New', fontSize: 11, color: C.ink, fill: { color: C.white }, margin: [10, 12, 10, 12] })
  } else if (s.kind === 'checklist') {
    T(slide, s.items.map((x, j) => ({ text: x, options: { bullet: { code: '25A1' }, breakLine: j < s.items.length - 1 } })), { x: X, y: top, w: CW, h: 3.9, fontSize: 17, color: C.white, paraSpaceAfter: 10 })
  }
  slide.addNotes(`${s.title}. ${s.lead || ''}`.trim())
}

const file = path.join(out, 'cero-point-gotovye-sajty.pptx')
await pres.writeFile({ fileName: file })
const { applyTheme } = require('/root/.claude/skills/synced/54da08c0-f935-4f2f-a573-b7440d5eef75_48c284ee-db41-4e38-a829-d61e31b3a980/pptx/scripts/apply_theme.js')
await applyTheme(file, THEME)
console.log('→', file)
