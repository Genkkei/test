// Раскадровка сайта (навык site-craft): вход первого экрана по времени и прокрутка — компьютер и телефон,
// плюс контактный лист. Порядок кадров должен совпасть с craft.sequence, пустых кадров быть не должно.
//   node scripts/film.mjs <slug> <папка> [адрес=http://localhost:3100]
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const [, , slug, OUT, BASE = 'http://localhost:3100'] = process.argv
if (!slug || !OUT) throw new Error('node scripts/film.mjs <slug> <папка> [адрес]')
fs.mkdirSync(OUT, { recursive: true })
const local = BASE.includes('localhost')
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
  ...(local || !process.env.HTTPS_PROXY ? {} : { proxy: { server: process.env.HTTPS_PROXY } }),
})
const shots = []
for (const [w, h, tag, mob] of [[1440, 900, 'd', false], [390, 844, 'm', true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)))
  if (local) await p.route(/^https?:\/\/(?!localhost)/, (x) => x.abort())
  const url = local ? `${BASE}/${slug}` : BASE
  await p.goto(url, { waitUntil: 'commit' })
  const t0 = Date.now()
  for (const t of [150, 400, 700, 1000, 1400, 2000, 3000]) {
    await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)))
    const f = `${OUT}/${tag}-t${String(t).padStart(4, '0')}.jpg`
    await p.screenshot({ path: f, type: 'jpeg', quality: 70 })
    shots.push(f)
  }
  await p.waitForTimeout(800)
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  let i = 0
  for (let y = h * 0.8; y < H && i < 14; y += h * 0.8, i++) {
    await p.mouse.wheel(0, h * 0.8)
    await p.waitForTimeout(700)
    const f = `${OUT}/${tag}-s${String(i).padStart(2, '0')}.jpg`
    await p.screenshot({ path: f, type: 'jpeg', quality: 70 })
    shots.push(f)
  }
  if (errs.length) console.log(`${tag}: ошибки — ${errs.join(' | ')}`)
  await ctx.close()
}
await b.close()
// контактные листы: вход отдельно, прокрутка отдельно
const py = `
import sys,glob
from PIL import Image
out,pat,cols,w=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
fs=sorted(glob.glob(pat))
if fs:
  ims=[Image.open(f).convert('RGB') for f in fs]; ims=[i.resize((w,int(i.height*w/i.width))) for i in ims]
  hh=max(i.height for i in ims); s=Image.new('RGB',(cols*(w+6),((len(ims)+cols-1)//cols)*(hh+6)),(255,0,90))
  for k,i in enumerate(ims): s.paste(i,((k%cols)*(w+6),(k//cols)*(hh+6)))
  s.save(out,quality=78)
`
for (const [name, pat, cols, w] of [['enter-d', 'd-t*.jpg', 4, 420], ['scroll-d', 'd-s*.jpg', 4, 420], ['enter-m', 'm-t*.jpg', 7, 200], ['scroll-m', 'm-s*.jpg', 7, 200]])
  execFileSync('python3', ['-c', py, `${OUT}/${name}.jpg`, `${OUT}/${pat}`, String(cols), String(w)])
console.log(`кадров: ${shots.length} → ${OUT}/enter-d.jpg, scroll-d.jpg, enter-m.jpg, scroll-m.jpg`)
