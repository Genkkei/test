// Презентация в стиле КП cero point: HTML 1920×1080 → PDF (точные шрифты и свечение) и PNG слайдов.
//   node docs/deck/build.mjs   (из корня репозитория)
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import pw from '/opt/node22/lib/node_modules/playwright/index.js'
import { slides } from './content.mjs'

const root = process.cwd()
const out = path.join(root, 'docs/deck/out')
mkdirSync(out, { recursive: true })

// числа — из данных, а не руками
const sites = readdirSync('content/sites').filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(`content/sites/${f}`, 'utf8')))
const forSale = sites.filter((s) => s.listing?.forSale !== false)
const templates = readdirSync('src/templates', { withFileTypes: true }).filter((d) => d.isDirectory()).length
const by = (list) => forSale.filter((s) => list.includes(s.slug)).length
const COFFEE = 'brewlab crema origin dripbar kofego reserve bodrost tong karamel matcha qahvauy arabica nurkofe tunkofe kofemania noir coldbrew kitobkofe plastinka kofeofis'.split(' ')
const FURN = 'scandi velvet modul loftmebel sofa duradgor uyut forma royalmebel monomebel elit mebeluy obivka atelye yorug dizayn bolalar bogmebel daraxt smartmebel'.split(' ')
const METAL = 'sandon vorota kuznitsa ornament laser karkas xrom metallform olovtemir konstruktsiya qora uchqun kovkaart prokat panjara svarka temirsanat darvoza zarhal temirchi'.split(' ')
const counts = { sites: forSale.length, templates, coffee: by(COFFEE), furniture: by(FURN), metal: by(METAL) }
const deck = slides(counts)

const nm = (p) => `file://${root}/node_modules/${p}`
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const css = `
@font-face{font-family:U;src:url(${nm('@fontsource-variable/unbounded/files/unbounded-cyrillic-wght-normal.woff2')});font-weight:200 900;unicode-range:U+0400-04FF}
@font-face{font-family:U;src:url(${nm('@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2')});font-weight:200 900}
@font-face{font-family:T;src:url(${nm('@fontsource-variable/inter-tight/files/inter-tight-cyrillic-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0400-04FF}
@font-face{font-family:T;src:url(${nm('@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2')});font-weight:100 900}
@font-face{font-family:T;font-style:italic;src:url(${nm('@fontsource-variable/inter-tight/files/inter-tight-cyrillic-wght-italic.woff2')});font-weight:100 900;unicode-range:U+0400-04FF}
@font-face{font-family:T;font-style:italic;src:url(${nm('@fontsource-variable/inter-tight/files/inter-tight-latin-wght-italic.woff2')});font-weight:100 900}
@font-face{font-family:M;src:url(${nm('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')});font-weight:100 800}
@font-face{font-family:M;src:url(${nm('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-cyrillic-wght-normal.woff2')});font-weight:100 800;unicode-range:U+0400-04FF}
:root{--ink:#05050f;--electric:#5a4cf2;--glow:#b9adff;--paper:#e8e7ee;--white:#f6f5ff;--dim:rgb(246 245 255/.55);--muted:rgb(5 5 15/.66);--line:rgb(5 5 15/.14)}
@page{size:1920px 1080px;margin:0}
*{box-sizing:border-box}html,body{margin:0;background:#222}
.s{position:relative;width:1920px;height:1080px;overflow:hidden;padding:96px 120px 80px;display:grid;grid-template-rows:auto 1fr auto;background:var(--paper);color:var(--ink);font:28px/1.45 T,sans-serif;break-after:page}
.s.dark,.s.cover,.s.end{color:var(--white);background:
 linear-gradient(rgb(246 245 255/.05) 1px,transparent 1px) -1px -1px/40px 40px,
 linear-gradient(90deg,rgb(246 245 255/.05) 1px,transparent 1px) -1px -1px/40px 40px,
 radial-gradient(70% 50% at 100% 100%,rgb(90 76 242/.85),transparent 70%),
 radial-gradient(60% 45% at 0% 100%,rgb(11 31 92/.95),transparent 75%),
 radial-gradient(45% 30% at 88% 4%,rgb(58 13 120/.6),transparent 75%),var(--ink)}
.s:not(.dark):not(.cover):not(.end){background:
 linear-gradient(var(--line) 1px,transparent 1px) -1px -1px/40px 40px,
 linear-gradient(90deg,var(--line) 1px,transparent 1px) -1px -1px/40px 40px,var(--paper);background-blend-mode:normal}
.top{display:flex;justify-content:space-between;align-items:baseline;font:500 18px/1 M,monospace;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.top b{font:800 34px/1 U,sans-serif;letter-spacing:-.04em;text-transform:none;opacity:1}
.main{align-self:center;display:grid;gap:34px}
.lab{font-style:italic;font-size:30px;color:var(--electric)}.dark .lab,.cover .lab{color:var(--glow)}
h1,h2{margin:0;font-family:U,sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.04em;line-height:1}
h1{font-size:104px}h2{font-size:60px;max-width:1600px}
.lead{max-width:1280px;margin:0;color:var(--muted);font-size:31px}.dark .lead{color:var(--dim)}
.plate{margin:0;font:400 36px/1.55 U,sans-serif;letter-spacing:-.03em;max-width:1500px}
.plate span{background:var(--white);color:var(--ink);padding:6px 14px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.meta{display:flex;gap:80px}.meta dt{font:500 17px M,monospace;letter-spacing:.1em;text-transform:uppercase;opacity:.6}.meta dd{margin:8px 0 0;font-size:28px}
.foot{display:flex;justify-content:space-between;font:500 16px M,monospace;letter-spacing:.1em;text-transform:uppercase;opacity:.55;padding-top:24px}
.card{background:#fff;border:1px solid var(--line);padding:30px 34px;position:relative}
.dark .card{background:rgb(246 245 255/.06);border-color:rgb(246 245 255/.16)}
.card::after{content:'';position:absolute;right:-1px;top:-1px;width:34px;height:34px;background:linear-gradient(225deg,var(--paper) 50%,rgb(5 5 15/.12) 50%)}
.dark .card::after{background:linear-gradient(225deg,#0b0b1d 50%,rgb(246 245 255/.18) 50%)}
.card b{display:block;font:700 30px/1.2 U,sans-serif;letter-spacing:-.03em;margin-bottom:12px}
.card span{color:var(--muted);font-size:25px;line-height:1.45}.dark .card span{color:var(--dim)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:26px}.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:26px}
.n{font:500 20px M,monospace;color:var(--electric);display:block;margin-bottom:14px}.dark .n{color:var(--glow)}
.stat b{font:800 84px/1 U,sans-serif;white-space:nowrap;letter-spacing:-.05em;margin-bottom:18px}
.plan.best{background:var(--white);color:var(--ink)}.plan.best span,.plan.best li{color:var(--muted)}
.plan .price{font:800 52px/1 U,sans-serif;letter-spacing:-.04em;margin:6px 0 22px;display:block}
.plan ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}.plan li{padding-left:30px;position:relative;font-size:24px;color:var(--dim)}
.plan li::before{content:'';position:absolute;left:0;top:.7em;width:18px;height:2px;background:var(--glow)}.plan.best li::before{background:var(--electric)}
.note{font-size:24px;color:var(--muted);max-width:1600px;margin:0}.dark .note{color:var(--dim)}
table{border-collapse:collapse;width:100%;font-size:27px}td{padding:14px 22px;border-top:1px solid var(--line)}td:first-child{font:700 28px U,sans-serif}
tr.mid td{background:#fff}
.funnel{display:grid;grid-template-columns:repeat(4,1fr);gap:0}.funnel div{padding:24px 28px;border-left:2px solid var(--electric)}.funnel b{display:block;font:800 56px/1 U,sans-serif;letter-spacing:-.04em}.funnel span{font-size:22px;color:var(--muted)}
.steps{display:grid;gap:12px}.steps .card{display:grid;grid-template-columns:80px 1fr;align-items:start;padding:16px 28px}
.steps i{font:800 52px/1 U,sans-serif;font-style:normal;color:var(--electric)}.dark .steps i{color:var(--glow)}
.steps b{margin-bottom:4px;font-size:27px}.steps .card span{font-size:24px}
.pre{white-space:pre-wrap;font:400 24px/1.6 M,monospace;background:var(--white);color:var(--ink);padding:28px 32px}
.list{margin:0;padding:0;list-style:none;display:grid;gap:14px}.list li{padding-left:40px;position:relative;font-size:28px}
.list li::before{content:'';position:absolute;left:0;top:.62em;width:22px;height:2px;background:var(--glow)}
.list.no li::before{background:#ff6b6b;height:3px}
.check li{display:flex;gap:22px;align-items:center;font-size:31px}.check li::before{content:'';width:34px;height:34px;flex:none;border:2px solid var(--glow);position:static}
.bar{position:absolute;left:120px;right:120px;bottom:150px;height:70px;background:repeating-linear-gradient(90deg,var(--white) 0 3px,transparent 3px 7px,var(--white) 7px 8px,transparent 8px 14px,var(--white) 14px 18px,transparent 18px 21px);opacity:.85;max-width:620px}
`

function frame(s, i, body) {
  const cls = s.kind === 'cover' || s.kind === 'end' ? s.kind : s.dark ? 'dark' : ''
  return `<section class="s ${cls}"><div class="top"><b>cero point</b><span>${esc(s.label || 'Готовые сайты')}</span></div><div class="main">${body}</div><div class="foot"><span>point.cero.uz/sites</span><span>${String(i + 1).padStart(2, '0')} / ${String(deck.length).padStart(2, '0')}</span></div></section>`
}
const head = (s) => `${s.label ? `<p class="lab">${esc(s.label.replace(/^\d+ \/ /, ''))}</p>` : ''}<h2>${esc(s.title)}</h2>${s.lead ? `<p class="lead">${esc(s.lead)}</p>` : ''}`
const card = (t, d, n) => `<div class="card">${n ? `<span class="n">${n}</span>` : ''}<b>${esc(t)}</b><span>${esc(d)}</span></div>`

const render = {
  cover: (s) => `<p class="lab">${esc(s.label)}</p><h1>${esc(s.title)}</h1><p class="plate"><span>${esc(s.plate)}</span></p><dl class="meta">${s.meta.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`,
  stats: (s) => `${head(s)}<div class="g4">${s.stats.map(([a, b]) => `<div class="card stat"><b${a.length > 5 ? ' style="font-size:58px"' : ''}>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>`,
  flow: (s) => `${head(s)}<div class="g4">${s.items.map(([a, b], i) => card(a, b, `0${i + 1} →`)).join('')}</div>`,
  cards: (s) => `${head(s)}<div class="${s.items.length > 4 ? 'g3' : 'g2'}">${s.items.map(([a, b], i) => card(a, b, String(i + 1).padStart(2, '0'))).join('')}</div>`,
  prices: (s) => `${head(s)}<div class="g3">${s.plans.map(([n, p, l]) => `<div class="card plan${n.includes('★') ? ' best' : ''}"><b>${esc(n)}</b><span class="price">${esc(p)}</span><ul>${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div><p class="note">${esc(s.note)}</p>`,
  scenarios: (s) => `${head(s)}<div class="funnel">${s.funnel.map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div><table>${s.rows.map((r, i) => `<tr${i === 1 ? ' class="mid"' : ''}>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table><p class="note">${esc(s.note)}</p>`,
  script: (s) => `${head(s)}<div class="steps">${s.steps.map(([a, b], i) => `<div class="card"><i>${i + 1}</i><div><b>${esc(a)}</b><span>${esc(b)}</span></div></div>`).join('')}</div>`,
  steps: (s) => `${head(s)}<div class="steps">${s.steps.map(([a, b], i) => `<div class="card"><i>${i + 1}</i><div><b>${esc(a)}</b><span>${esc(b)}</span></div></div>`).join('')}</div>${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}`,
  handover: (s) => `${head(s)}<div class="g3"><div><p class="lab">Отправить</p><ul class="list">${s.send.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><p class="lab">Никогда не отправлять</p><ul class="list no">${s.never.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><p class="lab">Сообщение клиенту</p><div class="pre">${esc(s.message)}</div></div></div>`,
  qa: (s) => `${head(s)}<div class="g3">${s.items.map(([a, b]) => card(a, b)).join('')}</div>`,
  checklist: (s) => `${head(s)}<ul class="list check">${s.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`,
  end: (s) => `<h1>${esc(s.title)}</h1><p class="plate"><span>${esc(s.plate)}</span></p><div class="bar"></div>`,
}

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>cero point — готовые сайты</title><style>${css}</style></head><body>${deck.map((s, i) => frame(s, i, render[s.kind](s))).join('\n')}</body></html>`
writeFileSync(path.join(out, 'deck.html'), html)

const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
await p.goto(`file://${path.join(out, 'deck.html')}`, { waitUntil: 'load' })
await p.evaluate(() => document.fonts.ready)
await p.pdf({ path: path.join(out, 'cero-point-gotovye-sajty.pdf'), width: '1920px', height: '1080px', printBackground: true })
const els = await p.$$('section.s')
for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`) })
await b.close()
console.log(JSON.stringify(counts), `${deck.length} слайдов → ${out}`)

// Фоны для PPTX: тёмный (свечение и сетка) и светлый лист — снимком пустого слайда.
{
  const b2 = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  const p2 = await b2.newPage({ viewport: { width: 1920, height: 1080 } })
  for (const [name, cls] of [['bg-dark', 'dark'], ['bg-light', '']]) {
    await p2.setContent(`<style>${css}</style><section class="s ${cls}"></section>`)
    await p2.locator('section').screenshot({ path: path.join(out, `${name}.png`) })
  }
  await b2.close()
  writeFileSync(path.join(out, 'counts.json'), JSON.stringify(counts))
}
