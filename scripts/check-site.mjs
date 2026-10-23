// Нужен playwright-core и Chromium в /opt/pw-browsers/chromium; сайт — на локальном сервере (npm run build && npx next start -p 3100).
// Проверка одного сайта перед выкладкой: node check-site.mjs <slug> <out-dir> [base]
// Телефон и компьютер: ошибки, ширина, разорванные слова, перекрытые кнопки, якоря, меню, логотип;
// маршруты: языки, бренд-бук, иконка, карточка. Снимки — во всю страницу.
import { chromium } from 'playwright-core'
import fs from 'node:fs'

// снимок во всю страницу кадрами (fullPage в Chromium повторяет куски страницы с холстами и липкими слоями)
async function stitch(p, file) {
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  const h = p.viewportSize().height
  const parts = []
  for (let y = 0; y < H; y += h) {
    await p.evaluate((y) => scrollTo(0, y), y)
    await p.waitForTimeout(250)
    const buf = await p.screenshot()
    parts.push({ y: Math.min(y, H - h), buf })
  }
  fs.mkdirSync(file + '.parts', { recursive: true })
  parts.forEach((x, i) => fs.writeFileSync(`${file}.parts/${String(i).padStart(2, '0')}_${x.y}.png`, x.buf))
  await p.evaluate(() => scrollTo(0, 0))
}

const [, , slug, OUT, BASE = 'http://localhost:3100'] = process.argv
fs.mkdirSync(OUT, { recursive: true })
const site = JSON.parse(fs.readFileSync(`content/sites/${slug}.json`, 'utf8'))
const report = { slug, problems: [], notes: [] }
const bad = (m) => report.problems.push(m)

for (const path of ['', '/uz', '/en', '/brand', '/icon', '/opengraph-image', '/llms.txt']) {
  const r = await fetch(`${BASE}/${slug}${path}`)
  if (r.status !== 200 && !(path === '/brand' && !site.brand)) bad(`маршрут ${path || '/'} → ${r.status}`)
}

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

async function inspect(p, tag) {
  return p.evaluate((tag) => {
    const out = []
    const vis = (el) => {
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) return false
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const s = getComputedStyle(n)
        if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false
      }
      return true
    }
    if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`${tag}: страница шире экрана на ${document.documentElement.scrollWidth - innerWidth}px`)
    // слова, разорванные переносом
    const broken = new Set()
    for (const el of document.querySelectorAll('h1, h2, h3, .btn, button, a, [class*="title"], [class*="price"]')) {
      if (!vis(el) || el.closest('.na-actor, [aria-hidden="true"], .marquee, [class*="marquee"]')) continue
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let t; (t = walker.nextNode()); ) {
        const re = /[\p{L}\p{N}]{4,}/gu
        for (let m; (m = re.exec(t.data)); ) {
          const range = document.createRange()
          range.setStart(t, m.index)
          range.setEnd(t, m.index + m[0].length)
          const tops = new Set([...range.getClientRects()].filter((r) => r.width > 1).map((r) => Math.round(r.top)))
          if (tops.size > 1) broken.add(m[0])
        }
      }
    }
    if (broken.size) out.push(`${tag}: слова разорваны переносом — ${[...broken].slice(0, 8).join(', ')}`)
    // якоря
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      const h = a.getAttribute('href')
      if (h.length > 1 && h !== '#top' && h !== '#order' && !document.querySelector(h)) out.push(`${tag}: ссылка ${h} ведёт в никуда («${a.textContent.trim().slice(0, 30)}»)`)
    }
    // логотип в шапке
    const logo = document.querySelector('header .brand-logo, .atlas-hdr .brand-logo')
    if (window.__brand && (!logo || !vis(logo))) out.push(`${tag}: логотип в шапке не виден`)
    // логотип целиком в своём блоке и на экране
    for (const lg of document.querySelectorAll('.brand-logo')) {
      if (!vis(lg)) continue
      const w = lg.querySelector('.brand-logo__word') || lg
      const r0 = lg.getBoundingClientRect(), r1 = w.getBoundingClientRect()
      const r = { left: Math.min(r0.left, r1.left), right: Math.max(r0.right, r1.right, r1.left + w.scrollWidth) }
      if (r.right > innerWidth + 1 || r.left < -1) { out.push(`${tag}: логотип вылезает за экран`); continue }
      for (let n = lg.parentElement; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n)
        if (/hidden|clip/.test(s.overflowX + s.overflow)) {
          const nr = n.getBoundingClientRect()
          if (r.right > nr.right + 1 || r.left < nr.left - 1) out.push(`${tag}: логотип обрезан краем ${n.tagName.toLowerCase()}.${String(n.className).slice(0, 30)}`)
          break
        }
      }
    }
    // пустые ссылки и кнопки
    for (const el of document.querySelectorAll('a, button')) {
      if (!vis(el)) continue
      if (!(el.textContent.trim() || el.getAttribute('aria-label') || el.querySelector('svg, img'))) out.push(`${tag}: пустая кнопка/ссылка ${el.outerHTML.slice(0, 80)}`)
    }
    return out
  }, tag)
}

async function covered(p, tag) {
  // каждая видимая кнопка и ссылка: в центре — она сама, а не что-то поверх
  const n = await p.evaluate(() => document.querySelectorAll('main a, main button, header a, header button, footer a').length)
  const out = []
  for (let i = 0; i < n; i++) {
    const r = await p.evaluate((i) => {
      const el = document.querySelectorAll('main a, main button, header a, header button, footer a')[i]
      const s = getComputedStyle(el)
      if (el.getBoundingClientRect().width < 2 || s.visibility === 'hidden' || el.closest('[hidden], [aria-hidden="true"]')) return null
      el.scrollIntoView({ block: 'center' })
      return null
    }, i)
    await p.waitForTimeout(30)
    const res = await p.evaluate((i) => {
      const el = document.querySelectorAll('main a, main button, header a, header button, footer a')[i]
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2 || getComputedStyle(el).visibility === 'hidden' || el.closest('[hidden], [aria-hidden="true"]')) return null
      let o = 1
      for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity
      if (o < 0.05) return null
      const x = r.left + r.width / 2, y = r.top + r.height / 2
      if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return null
      const top = document.elementFromPoint(x, y)
      if (!top || el === top || el.contains(top) || top.contains(el)) return null
      return `«${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}» закрыта элементом ${top.tagName.toLowerCase()}.${String(top.className).slice(0, 40)}`
    }, i)
    if (res) out.push(`${tag}: ${res}`)
  }
  return out
}

for (const [w, h, tag, mob] of [[390, 844, 'телефон', true], [1280, 800, 'компьютер', false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)))
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource|favicon|net::ERR/.test(m.text()) && errs.push(m.text().slice(0, 150)))
  await p.addInitScript((has) => (window.__brand = has), !!site.brand?.logo)
  await p.route(/^https?:\/\/(?!localhost)/, (x) => x.abort())
  await p.goto(`${BASE}/${slug}`, { waitUntil: 'load' })
  await p.waitForTimeout(1500)
  report.problems.push(...(await inspect(p, tag)))
  await stitch(p, `${OUT}/site-${mob ? 'm' : 'd'}`)
  report.problems.push(...(await covered(p, tag)))
  // меню телефона
  if (mob) {
    await p.evaluate(() => scrollTo(0, 0))
    const btn = p.locator('.site [aria-expanded="false"]').first()
    if (await btn.count()) {
      await btn.tap()
      await p.waitForTimeout(600)
      await p.screenshot({ path: `${OUT}/menu-m.png` })
      const m = await p.evaluate(() => {
        const panel = document.querySelector('[data-open]')
        if (!panel) return { open: false }
        const r = panel.getBoundingClientRect()
        const links = [...panel.querySelectorAll('a')].filter((a) => a.getBoundingClientRect().height > 0 && a.getBoundingClientRect().top >= 0 && a.getBoundingClientRect().bottom <= innerHeight)
        return { open: true, covers: r.top <= 1 && r.height >= innerHeight - 2, links: links.length, all: panel.querySelectorAll('a').length }
      })
      if (!m.open) bad('телефон: меню не открывается')
      else {
        if (!m.covers) bad('телефон: меню не на весь экран')
        if (m.links < m.all) bad(`телефон: в меню видно ${m.links} пунктов из ${m.all}`)
        const a = p.locator('[data-open] a[href^="#"]').nth(1)
        if (await a.count()) {
          const href = await a.getAttribute('href')
          await a.tap()
          await p.waitForTimeout(1800)
          const r = await p.evaluate((h) => ({ closed: !document.querySelector('[data-open]'), top: Math.round(document.querySelector(h)?.getBoundingClientRect().top ?? -9999) }), href)
          if (!r.closed) bad('телефон: меню не закрылось после выбора раздела')
          if (r.top < -5 || r.top > 260) bad(`телефон: пункт меню ${href} не привёл к разделу (верх ${r.top})`)
        }
      }
    } else bad('телефон: нет кнопки меню')
  }
  if (errs.length) bad(`${tag}: ошибки — ${[...new Set(errs)].slice(0, 3).join(' | ')}`)
  await ctx.close()

  // бренд-бук
  if (site.brand?.logo) {
    const c2 = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob, reducedMotion: 'reduce' })
    const q = await c2.newPage()
    const e2 = []
    q.on('pageerror', (e) => e2.push(String(e).slice(0, 150)))
    await q.route(/^https?:\/\/(?!localhost)/, (x) => x.abort())
    await q.goto(`${BASE}/${slug}/brand`, { waitUntil: 'load' })
    await q.waitForTimeout(2500)
    const bi = await q.evaluate(() => {
      const out = []
      if (document.documentElement.scrollWidth > innerWidth + 1) out.push(`страница шире экрана на ${document.documentElement.scrollWidth - innerWidth}px`)
      // текст макетов не вылезает за свою сцену
      for (const st of document.querySelectorAll('.mk__stage')) {
        const box = st.getBoundingClientRect()
        for (const t of st.querySelectorAll('p, b, span, .brand-logo')) {
          const r = t.getBoundingClientRect()
          if (r.width && (r.right > box.right + 1 || r.bottom > box.bottom + 1 || r.left < box.left - 1)) {
            out.push(`макет «${st.parentElement.querySelector('figcaption b')?.textContent}»: «${t.textContent.trim().slice(0, 24)}» вылезает за край`)
            break
          }
        }
      }
      for (const s of document.querySelectorAll('.bb-block')) if (!s.querySelector('.bb-block__body')?.textContent.trim() && !s.querySelector('svg, iframe')) out.push(`пустой раздел «${s.querySelector('h2')?.textContent}»`)
      return out
    })
    report.problems.push(...bi.map((x) => `бренд-бук, ${tag}: ${x}`))
    if (e2.length) bad(`бренд-бук, ${tag}: ошибки — ${e2.slice(0, 2).join(' | ')}`)
    await stitch(q, `${OUT}/book-${mob ? 'm' : 'd'}`)
    await c2.close()
  }
}
await b.close()
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1))
console.log(report.problems.length ? report.problems.map((x) => '✗ ' + x).join('\n') : '✓ проблем не найдено')
