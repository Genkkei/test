// Шрифты сайтов — свои у каждого (владелец, 24.10: «у каждого сайта свой шрифт»).
// Раньше все сайты делили 25 гарнитур из globals.css. Теперь любой шрифт Fontsource с кириллицей (их ~300)
// скачивается сюда один раз: public/fonts/<id>/*.woff2 + public/fonts/<id>.<hash>.css (кириллица, латиница,
// латиница-расширенная — узбекский), а сайт подключает только свои (SiteRenderer → FONT_CSS).
//
//   node scripts/fonts.mjs            — все шрифты из content/sites (theme.display/body, craft.label, логотип)
//   node scripts/fonts.mjs "Oi" ...   — плюс перечисленные
// Сеть нужна только для новых шрифтов: скачанное лежит в public/fonts и в git.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const PUB = path.join(ROOT, 'public/fonts')
const SUBSETS = ['cyrillic', 'latin', 'latin-ext']
const WEIGHTS = [300, 400, 500, 600, 700, 800, 900]
// уже есть в globals.css — сайту не нужно подключать отдельно
const GLOBAL = new Set(['Unbounded', 'Inter Tight', 'Manrope', 'Onest', 'Playfair Display', 'Cormorant Garamond', 'Jost', 'Golos Text', 'JetBrains Mono', 'Dela Gothic One', 'Tenor Sans', 'Prata', 'Montserrat', 'Oswald', 'Yeseva One', 'Rubik Mono One', 'Rubik', 'Lora', 'Nunito', 'Russo One', 'Exo 2', 'Raleway', 'Literata', 'Caveat'])

const want = new Set(process.argv.slice(2))
for (const dir of ['content/sites']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    if (!f.endsWith('.json')) continue
    const s = JSON.parse(fs.readFileSync(path.join(ROOT, dir, f), 'utf8'))
    for (const n of [s.theme?.display, s.theme?.body, s.craft?.label, s.brand?.logo?.word?.font]) if (n) want.add(n)
  }
}

const idOf = (family) => family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
async function get(url, bin = false) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url).catch(() => null)
    if (r?.ok) return bin ? Buffer.from(await r.arrayBuffer()) : r.json()
    if (r && r.status === 404) return null
    await new Promise((ok) => setTimeout(ok, 800 * (i + 1)))
  }
  return null
}

const out = {}
const cats = {}
fs.mkdirSync(PUB, { recursive: true })
const existing = fs.existsSync(path.join(ROOT, 'src/lib/fonts.generated.ts')) ? fs.readFileSync(path.join(ROOT, 'src/lib/fonts.generated.ts'), 'utf8') : ''
for (const family of [...want].sort()) {
  if (GLOBAL.has(family)) continue
  const id = idOf(family)
  const dir = path.join(PUB, id)
  const cssName = fs.existsSync(PUB) ? fs.readdirSync(PUB).find((f) => f.startsWith(id + '.') && f.endsWith('.css')) : null
  const metaFile = path.join(dir, 'meta.json')
  if (cssName && fs.existsSync(metaFile)) {
    out[family] = `/fonts/${cssName}`
    cats[family] = JSON.parse(fs.readFileSync(metaFile, 'utf8')).category
    continue
  }
  const meta = await get(`https://api.fontsource.org/v1/fonts/${id}`)
  if (!meta) {
    console.error(`✗ ${family}: нет в Fontsource`)
    process.exitCode = 1
    continue
  }
  if (!meta.subsets.includes('cyrillic')) {
    console.error(`✗ ${family}: без кириллицы — не годится для русских сайтов`)
    process.exitCode = 1
    continue
  }
  fs.mkdirSync(dir, { recursive: true })
  const faces = []
  const subsets = SUBSETS.filter((s) => meta.subsets.includes(s))
  const styles = meta.styles.includes('italic') ? ['normal', 'italic'] : ['normal']
  for (const style of styles) {
    for (const sub of subsets) {
      if (meta.variable) {
        const file = `${sub}-wght-${style}.woff2`
        const buf = await get(`https://cdn.jsdelivr.net/fontsource/fonts/${id}:vf@latest/${file}`, true)
        if (!buf) continue
        fs.writeFileSync(path.join(dir, file), buf)
        const ws = meta.weights
        faces.push({ file, weight: `${Math.min(...ws)} ${Math.max(...ws)}`, style, sub })
      } else {
        for (const w of meta.weights.filter((x) => WEIGHTS.includes(x))) {
          const file = `${sub}-${w}-${style}.woff2`
          const buf = await get(`https://cdn.jsdelivr.net/fontsource/fonts/${id}@latest/${file}`, true)
          if (!buf) continue
          fs.writeFileSync(path.join(dir, file), buf)
          faces.push({ file, weight: String(w), style, sub })
        }
      }
    }
  }
  if (!faces.length) {
    console.error(`✗ ${family}: файлы не скачались`)
    process.exitCode = 1
    continue
  }
  const css = faces
    .map((f) => `@font-face{font-family:'${family}';font-style:${f.style};font-display:swap;font-weight:${f.weight};src:url(/fonts/${id}/${f.file}) format('woff2');unicode-range:${meta.unicodeRange[f.sub]}}`)
    .join('\n')
  const hash = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10)
  for (const f of fs.readdirSync(PUB)) if (f.startsWith(id + '.') && f.endsWith('.css')) fs.rmSync(path.join(PUB, f))
  fs.writeFileSync(path.join(PUB, `${id}.${hash}.css`), css + '\n')
  fs.writeFileSync(metaFile, JSON.stringify({ family, category: meta.category, variable: meta.variable, weights: meta.weights, styles: meta.styles }) + '\n')
  out[family] = `/fonts/${id}.${hash}.css`
  cats[family] = meta.category
  console.log(`✓ ${family} — ${faces.length} файлов`)
}

const ts = `// создаётся scripts/fonts.mjs — не править руками
export const FONT_CSS: Record<string, string> = ${JSON.stringify(out, null, 2)}
export const FONT_CATEGORY: Record<string, string> = ${JSON.stringify(cats, null, 2)}
`
if (ts !== existing) fs.writeFileSync(path.join(ROOT, 'src/lib/fonts.generated.ts'), ts)
console.log(`шрифтов сайтов: ${Object.keys(out).length}`)
