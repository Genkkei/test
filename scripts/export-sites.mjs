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
  await grab(`${base}/${slug}`, path.join(dir, 'index.html'))
  await grab(`${base}/${slug}/llms.txt`, path.join(dir, 'llms.txt'))
  await grab(`${base}/${slug}/llms-full.txt`, path.join(dir, 'llms-full.txt'))
  await grab(`${base}/${slug}/opengraph-image`, path.join(dir, 'og.png'), true)
  await grab(`${base}/${slug}/icon`, path.join(dir, 'icon.png'), true)
  const origin = item?.url ?? `https://${slug}`
  writeFileSync(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
  writeFileSync(
    path.join(dir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n<url><loc>${origin}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><image:image><image:loc>${origin}/og.png</image:loc></image:image></url>\n</urlset>\n`,
  )
  cpSync('.next/static', path.join(dir, '_next/static'), { recursive: true })
  console.log(`✓ ${slug} → ${dir}`)
  if (deploy) {
    execFileSync('npx', ['wrangler', 'deploy', '--name', slug, '--assets', dir, '--compatibility-date', '2026-10-01'], { stdio: 'inherit' })
  }
}
