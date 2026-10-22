// Выгрузка сайтов в статику — по папке на сайт, готовой к раздаче с любого статического хостинга.
// Сайт берётся с работающего продакшн-сервера (next build && next start) вместе со служебными
// файлами: llms.txt, обложка, иконка, robots и sitemap для его домена.
//
//   node scripts/export-sites.mjs http://localhost:3200 out [slug ...]
//   node scripts/export-sites.mjs http://localhost:3200 out --deploy   # + каждый сайт на Cloudflare Workers
//
// --deploy: воркер с именем = slug, только статические файлы (без кода), адрес <slug>.<поддомен>.workers.dev.
// Нужны CLOUDFLARE_API_TOKEN и CLOUDFLARE_ACCOUNT_ID.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

// Сокет keep-alive сервера закрывается, пока wrangler грузит предыдущий сайт: запрос повторяем.
const fetchRaw = globalThis.fetch
const fetch = async (url, opts) => {
  for (let a = 1; ; a++) {
    try { return await fetchRaw(url, opts) } catch (e) { if (a >= 4) throw e; await new Promise((r) => setTimeout(r, 1000 * a)) }
  }
}

const args = process.argv.slice(2)
const deploy = args.includes('--deploy')
const [base = 'http://localhost:3200', out = 'out', ...only] = args.filter((a) => a !== '--deploy')
const catalog = await (await fetch(`${base}/catalog.json`)).json()
const all = catalog.map((c) => c.slug)
const slugs = only.length ? only : all

async function grab(url, file, binary = false) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  writeFileSync(file, binary ? Buffer.from(await res.arrayBuffer()) : await res.text())
}

for (const slug of slugs) {
  const item = catalog.find((c) => c.slug === slug)
  const dir = path.join(out, slug)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  // языковые версии: основной язык — в корне, остальные — /uz/, /en/; ссылки переключателя
  // ведут внутрь конструктора (/<slug>/uz) — здесь они переписываются в корень домена
  const langs = item?.langs ?? ['ru']
  for (const l of langs) {
    const primary = l === langs[0]
    const res = await fetch(`${base}/${slug}${primary ? '' : `/${l}`}`)
    if (!res.ok) throw new Error(`${slug}/${l} → ${res.status}`)
    const html = (await res.text())
      .replace(new RegExp(`href="/${slug}/(${langs.join('|')})"`, 'g'), 'href="/$1/"')
      .replace(new RegExp(`href="/${slug}"`, 'g'), 'href="/"')
    const file = primary ? path.join(dir, 'index.html') : path.join(dir, l, 'index.html')
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, html)
  }
  await grab(`${base}/${slug}/llms.txt`, path.join(dir, 'llms.txt'))
  await grab(`${base}/${slug}/llms-full.txt`, path.join(dir, 'llms-full.txt'))
  await grab(`${base}/${slug}/opengraph-image`, path.join(dir, 'og.png'), true)
  await grab(`${base}/${slug}/icon`, path.join(dir, 'icon.png'), true)
  const origin = (item?.url ?? `https://${slug}`).replace(/\/(uz|en)$/, '')
  writeFileSync(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
  writeFileSync(
    path.join(dir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${langs
      .map((l, i) => {
        const loc = i === 0 ? origin : `${origin}/${l}/`
        const alts = langs.map((x, j) => `<xhtml:link rel="alternate" hreflang="${x}" href="${j === 0 ? origin : `${origin}/${x}/`}"/>`).join('')
        return `<url><loc>${loc}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>${alts}<image:image><image:loc>${origin}/og.png</image:loc></image:image></url>`
      })
      .join('\n')}\n</urlset>\n`,
  )
  cpSync('.next/static', path.join(dir, '_next/static'), { recursive: true })
  cpSync('public/tpl', path.join(dir, 'tpl'), { recursive: true })
  console.log(`✓ ${slug} → ${dir}`)
  if (deploy) {
    execFileSync('npx', ['wrangler', 'deploy', '--name', slug, '--assets', dir, '--compatibility-date', '2026-10-01'], { stdio: 'inherit' })
  }
}
