// Развёртывание сайта в аккаунте Cloudflare владельца. Запускается GitHub Actions при каждом push
// (.github/workflows/deploy.yml) или вручную:
//
//   CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… ADMIN_PASSWORD=… ADMIN_SECRET=… node scripts/client-deploy.mjs
//
// Что делает (повторный запуск безопасен — всё, что уже есть, переиспользуется):
//  1. адрес *.workers.dev аккаунта (если его нет — регистрирует);
//  2. база D1 и хранилище фото R2 (создаёт, если нет), таблица правок;
//  3. фото сайта из seed/media → R2;
//  4. сборка и выкладка приложения <slug>-app с секретами;
//  5. воркер-адрес <slug> → https://<slug>.<поддомен>.workers.dev.
// Имя сайта и прочее — в atlas.client.json (его пишет программа переноса).
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const cfg = JSON.parse(readFileSync('atlas.client.json', 'utf8'))
const { slug } = cfg
const TOKEN = need('CLOUDFLARE_API_TOKEN')
const ACCOUNT = need('CLOUDFLARE_ACCOUNT_ID')
const APP = `${slug}-app`
const DB = `${slug}-db`
const BUCKET = `${slug}-media`

function need(name) {
  const v = process.env[name]
  if (!v) {
    console.error(`Нет переменной ${name}. В GitHub: Settings → Secrets and variables → Actions.`)
    process.exit(1)
  }
  return v
}

async function cf(p, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${p}`, { ...init, headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', ...(init.headers || {}) } })
  const data = await res.json().catch(() => null)
  return { ok: !!data?.success, status: res.status, result: data?.result, errors: data?.errors || [] }
}

const wrangler = (args, opts = {}) => execFileSync('npx', ['wrangler', ...args], { stdio: opts.input ? ['pipe', 'inherit', 'inherit'] : 'inherit', input: opts.input, env: process.env })
const step = (t) => console.log(`\n=== ${t} ===`)

step('1. Адрес workers.dev')
let sub = (await cf(`/accounts/${ACCOUNT}/workers/subdomain`)).result?.subdomain
if (!sub) {
  const want = `${slug}-${Math.random().toString(36).slice(2, 6)}`
  const r = await cf(`/accounts/${ACCOUNT}/workers/subdomain`, { method: 'PUT', body: JSON.stringify({ subdomain: want }) })
  if (!r.ok) throw new Error(`Не удалось зарегистрировать адрес workers.dev: ${r.errors.map((e) => e.message).join('; ')}`)
  sub = want
}
const appUrl = `https://${APP}.${sub}.workers.dev`
const siteUrl = `https://${slug}.${sub}.workers.dev`
console.log(siteUrl)

step('2. База D1 и хранилище R2')
let db = ((await cf(`/accounts/${ACCOUNT}/d1/database?name=${DB}`)).result || []).find((d) => d.name === DB)
if (!db) {
  const r = await cf(`/accounts/${ACCOUNT}/d1/database`, { method: 'POST', body: JSON.stringify({ name: DB }) })
  if (!r.ok) throw new Error(`D1: ${r.errors.map((e) => e.message).join('; ')}`)
  db = r.result
}
const dbId = db.uuid || db.id
const bucket = await cf(`/accounts/${ACCOUNT}/r2/buckets/${BUCKET}`)
if (!bucket.ok) {
  const r = await cf(`/accounts/${ACCOUNT}/r2/buckets`, { method: 'POST', body: JSON.stringify({ name: BUCKET }) })
  if (!r.ok) throw new Error(`R2: ${r.errors.map((e) => e.message).join('; ')} — включите R2 в панели Cloudflare (R2 → Purchase/Enable, бесплатный объём).`)
}
const sql = readFileSync('d1/migrations/0001_docs.sql', 'utf8')
const q = await cf(`/accounts/${ACCOUNT}/d1/database/${dbId}/query`, { method: 'POST', body: JSON.stringify({ sql }) })
if (!q.ok) throw new Error(`D1 таблица: ${q.errors.map((e) => e.message).join('; ')}`)

writeFileSync(
  'wrangler.jsonc',
  JSON.stringify(
    {
      $schema: './node_modules/wrangler/config-schema.json',
      name: APP,
      main: '.open-next/worker.js',
      compatibility_date: '2026-10-01',
      compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
      workers_dev: true,
      assets: { directory: '.open-next/assets', binding: 'ASSETS' },
      d1_databases: [{ binding: 'DB', database_name: DB, database_id: dbId, migrations_dir: 'd1/migrations' }],
      r2_buckets: [{ binding: 'MEDIA', bucket_name: BUCKET }],
      vars: { ATLAS_STORE: 'd1', ATLAS_URL: appUrl, SITE_URL: siteUrl, ATLAS_SERVICE: APP },
      observability: { enabled: true },
    },
    null,
    2,
  ),
)

step('3. Фото сайта')
const media = existsSync('seed/media') ? readdirSync('seed/media') : []
for (const f of media) wrangler(['r2', 'object', 'put', `${BUCKET}/${f}`, '--file', path.join('seed/media', f), '--remote'])
console.log(`фото: ${media.length}`)

step('4. Сборка и выкладка приложения')
// адрес сайта — в данные, чтобы canonical и карта сайта указывали на него
const sitePath = `content/sites/${slug}.json`
const site = JSON.parse(readFileSync(sitePath, 'utf8'))
const host = new URL(siteUrl).host
if (!site.domains?.includes(host)) {
  site.domains = [...(site.domains || []).filter((d) => !d.endsWith('.workers.dev')), host]
  writeFileSync(sitePath, JSON.stringify(site, null, 2) + '\n')
}
execFileSync('npx', ['opennextjs-cloudflare', 'build'], { stdio: 'inherit', env: { ...process.env, SITE_URL: siteUrl, ATLAS_URL: appUrl } })
wrangler(['deploy'])
for (const [k, v] of [
  ['ADMIN_PASSWORD', process.env.ADMIN_PASSWORD],
  ['ADMIN_SECRET', process.env.ADMIN_SECRET],
  ['CF_API_TOKEN', TOKEN],
  ['CF_ACCOUNT_ID', ACCOUNT],
])
  if (v) wrangler(['secret', 'put', k], { input: v })

step('5. Адрес сайта')
mkdirSync('.wrangler', { recursive: true })
writeFileSync(
  '.wrangler/router.json',
  JSON.stringify({ name: slug, main: path.resolve('workers/router/index.js'), compatibility_date: '2026-10-01', workers_dev: true, services: [{ binding: 'ATLAS', service: APP }], vars: { SITE: slug } }),
)
wrangler(['deploy', '--config', '.wrangler/router.json'])

console.log(`\nГотово.\nСайт:    ${siteUrl}\nАдминка: ${siteUrl}/admin\n`)
