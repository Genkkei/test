// Маршрутизаторы сайтов: на каждый сайт — воркер с именем = slug (адрес <slug>.genkai.workers.dev),
// который передаёт запросы конструктору atlas по service binding (workers/router/index.js).
//
//   node scripts/deploy-routers.mjs            # все сайты из content/sites
//   node scripts/deploy-routers.mjs nord kvant  # выбранные
//
// Повторный запуск безопасен: воркер просто перевыкладывается. Заменяет прежнюю статическую выгрузку.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync('content/sites').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
const dir = path.resolve('.wrangler/routers')
mkdirSync(dir, { recursive: true })
let ok = 0
for (const slug of slugs) {
  const cfg = path.join(dir, `${slug}.json`)
  writeFileSync(
    cfg,
    JSON.stringify({
      name: slug,
      main: path.resolve('workers/router/index.js'),
      compatibility_date: '2026-10-01',
      workers_dev: true,
      services: [{ binding: 'ATLAS', service: 'atlas' }],
      // кэш готовых страниц (src/lib/pages-cache.ts)
      kv_namespaces: [{ binding: 'PAGES', id: '853cb4952bfb433e8740a3261abf2b7f' }],
      vars: { SITE: slug },
    }),
  )
  for (let a = 1; a <= 3; a++) {
    try {
      execFileSync('npx', ['wrangler', 'deploy', '--config', cfg], { stdio: 'pipe' })
      console.log(`✓ ${slug} → https://${slug}.genkai.workers.dev`)
      ok++
      break
    } catch (e) {
      if (a === 3) console.error(`✗ ${slug}: ${String(e.stderr || e.message).split('\n').filter((l) => /ERROR|✘/.test(l)).join(' ')}`)
    }
  }
}
console.log(`${ok}/${slugs.length}`)
