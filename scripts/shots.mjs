// Скриншоты сайтов: компьютер + телефон, с WebGL через SwiftShader.
// Страница снимается кадрами по высоте экрана (fullPage ломается на fixed-холстах и 100svh)
// и склеивается в один длинный PNG, если доступен python3 с Pillow.
// node scripts/shots.mjs http://localhost:3100 /tmp/shots nord prism ...
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright') } catch { pw = require('/opt/node22/lib/node_modules/playwright') }
const [base = 'http://localhost:3100', out = '/tmp/shots', ...paths] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const errors = []
for (const p of paths.length ? paths : ['']) {
  for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 })
    page.on('pageerror', (e) => errors.push(`${p} ${name}: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${p} ${name} console: ${m.text()}`) })
    await page.goto(`${base}/${p}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2600)
    const slug = (p || 'home').replace(/\//g, '_')
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    const frames = []
    let prev = -1
    for (let y = 0, i = 0; y < height && i < 30; y += vp.height, i++) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(i === 0 ? 300 : 1400)
      const real = await page.evaluate(() => Math.round(window.scrollY))
      if (real === prev) break
      const f = `${out}/${slug}-${name}-${String(i).padStart(2, '0')}.png`
      await page.screenshot({ path: f })
      // последний кадр упирается в конец страницы: отрезаем то, что уже было на предыдущем
      frames.push(`${f}:${prev < 0 ? 0 : Math.max(0, prev + vp.height - real)}`)
      prev = real
    }
    try { execFileSync('python3', ['-c', `import sys;from PIL import Image\nfs=[a.rsplit(':',1) for a in sys.argv[2:]];ims=[Image.open(f).crop((0,int(c),Image.open(f).width,Image.open(f).height)) for f,c in fs];w=ims[0].width;h=sum(i.height for i in ims);o=Image.new('RGB',(w,h));y=0\nfor i in ims:\n o.paste(i,(0,y));y+=i.height\no.save(sys.argv[1])`, `${out}/${slug}-${name}.png`, ...frames]) } catch (e) { errors.push(String(e)) }
    await page.close()
  }
}
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no errors')
