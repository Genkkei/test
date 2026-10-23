import { chromium } from 'playwright-core'
const [, , slug, OUT, BASE = 'http://localhost:3100'] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', ...(BASE.includes('localhost') ? {} : { proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined }) })
for (const mob of [false, true]) {
  const ctx = await b.newContext({ viewport: mob ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mob, hasTouch: mob })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)))
  if (BASE.includes('localhost')) await p.route(/^https?:\/\/(?!localhost)/, (x) => x.abort())
  await p.goto(`${BASE}/${slug}/brand`, { waitUntil: 'load' })
  await p.waitForTimeout(1500)
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  let shot = 0
  for (let y = 0; y < H; y += 300) {
    await p.evaluate((y) => scrollTo(0, y), y)
    await p.waitForTimeout(120)
    const near = await p.evaluate(() => {
      const v = document.querySelector('.bb-venn__svg, .bb-pattern, .bb-stripes')
      return [...document.querySelectorAll('.bb-venn__svg, .bb-pattern, .bb-stripes')].map((e) => { const r = e.getBoundingClientRect(); return r.top > 0 && r.top < innerHeight * 0.6 ? e.className.baseVal ?? e.className : '' }).filter(Boolean)
    })
    if (near.length && !mob && shot < 6) { await p.screenshot({ path: `${OUT}/mid-${shot++}.png` }) }
  }
  await p.waitForTimeout(2500)
  // всё ли проявилось: ищем видимые по раскладке, но прозрачные или сдвинутые элементы
  const stuck = await p.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('.bb [data-a] *, .bb [data-a]')) {
      const cs = getComputedStyle(el)
      if (+cs.opacity < 0.5 && !el.closest('.bb-explore__item:not(.bb-explore__item--chosen)') && !el.matches('.bb-hero__col b, .bb-flow__steps li')) {
        const r = el.getBoundingClientRect(); if (r.width && r.height) out.push(`${el.tagName}.${el.className?.baseVal ?? el.className} opacity ${cs.opacity}`)
      }
    }
    const words = [...document.querySelectorAll('[data-a="split"] [style*="translate"]')].filter((w) => !/translateY\(0%\)|translateY\(0px\)|translate\(0/.test(w.style.transform) && w.style.transform)
    words.forEach((w) => out.push('слово сдвинуто: ' + w.textContent + ' ' + w.style.transform))
    return out.slice(0, 15)
  })
  console.log(mob ? 'телефон' : 'компьютер', errs.length ? 'ОШИБКИ ' + errs.join(' | ') : 'без ошибок', stuck.length ? '\n  ✗ ' + stuck.join('\n  ✗ ') : '✓ всё проявилось')
  await ctx.close()
}
await b.close()
