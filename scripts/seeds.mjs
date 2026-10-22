// Исходные сайты и переводы из content/ — одним модулем: в воркере Cloudflare нет файловой системы репозитория.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
const dir = 'content/sites'
const sites = {}
const tr = {}
for (const f of readdirSync(dir)) if (f.endsWith('.json')) sites[f.slice(0, -5)] = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'))
for (const f of readdirSync(`${dir}/i18n`)) if (f.endsWith('.json')) tr[f.slice(0, -5)] = JSON.parse(readFileSync(`${dir}/i18n/${f}`, 'utf8'))
writeFileSync('src/lib/seeds.generated.ts', `// Сгенерировано scripts/seeds.mjs — не править руками.\nexport const SITES: Record<string, unknown> = ${JSON.stringify(sites)}\nexport const TRANSLATIONS: Record<string, Record<string, unknown>> = ${JSON.stringify(tr)}\n`)
console.log(`seeds: ${Object.keys(sites).length} сайтов, ${Object.keys(tr).length} переводов`)

// Код маршрутизатора строкой — админка выкладывает его воркером сайта через API Cloudflare.
writeFileSync('src/lib/router-script.generated.ts', `// Сгенерировано scripts/seeds.mjs из workers/router/index.js — не править руками.\nexport const ROUTER_SCRIPT = ${JSON.stringify(readFileSync('workers/router/index.js', 'utf8'))}\n`)

// Стили шаблонов — отдельным файлом на шаблон (public/tpl/<id>.<хэш>.css), страница подключает только свой.
// Раньше style.css импортировался в index.tsx каждого шаблона, и в каждую страницу попадали стили всех
// шаблонов — ~270 КБ сжатого CSS, который блокирует первую отрисовку. Вложенность CSS разворачивается для
// старых Safari, файл сжимается; хэш в имени — браузер держит файл в кэше, пока шаблон не изменится.
{
  const { createHash } = await import('node:crypto')
  const { existsSync, mkdirSync, rmSync } = await import('node:fs')
  let transform = null
  try {
    ;({ transform } = await import('lightningcss'))
  } catch {}
  rmSync('public/tpl', { recursive: true, force: true })
  mkdirSync('public/tpl', { recursive: true })
  const map = {}
  for (const id of readdirSync('src/templates')) {
    const f = `src/templates/${id}/style.css`
    if (!existsSync(f)) continue
    const raw = readFileSync(f)
    const css = transform
      ? transform({ filename: f, code: raw, minify: true, targets: { safari: 14 << 16, chrome: 90 << 16, firefox: 90 << 16 } }).code
      : raw
    if (!css.length) continue // заготовка шаблона без своих стилей
    const name = `${id}.${createHash('sha1').update(css).digest('hex').slice(0, 10)}.css`
    writeFileSync(`public/tpl/${name}`, css)
    map[id] = `/tpl/${name}`
  }
  writeFileSync('src/templates/styles.generated.ts', `// Сгенерировано scripts/seeds.mjs — не править руками.\nexport const TPL_CSS: Record<string, string> = ${JSON.stringify(map)}\n`)
  console.log(`стили: ${Object.keys(map).length} шаблонов`)
}

// Снимок исходного кода для «Перенести заказчику»: программа переноса собирает из него репозиторий
// заказчика прямо на сервере. Это серверный модуль — в браузер он не попадает (проверяет security-audit).
// Данные сайтов, документы, отчёты и наши служебные скрипты в снимок не входят.
{
  const { execSync } = await import('node:child_process')
  const SKIP = /^(content\/sites\/|docs\/|security\/|tests\/|data\/|\.github\/)|^scripts\/(?!seeds\.mjs$|client-deploy\.mjs$)|^vitest\.config\.ts$|\.generated\.ts$|^README-client\.md$/
  let list = []
  try {
    list = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').filter(Boolean)
  } catch {}
  const BIN = /\.(woff2?|ttf|png|jpe?g|webp|avif|gif|ico|pdf)$/i
  const files = {}
  for (const f of list) {
    if (SKIP.test(f)) continue
    try {
      files[f] = BIN.test(f) ? { b64: readFileSync(f).toString('base64') } : readFileSync(f, 'utf8')
    } catch {}
  }
  writeFileSync('src/lib/export-snapshot.generated.ts', `// Сгенерировано scripts/seeds.mjs — не править руками.\nexport const SNAPSHOT: Record<string, string | { b64: string }> = ${JSON.stringify(files)}\n`)
  console.log(`снимок кода: ${Object.keys(files).length} файлов`)
}
