/*
 * Повторяемый аудит безопасности всех сайтов Atlas.
 *
 *   npx tsx scripts/security-audit.mts            — код, данные, зависимости, секреты, тесты, сборка
 *   npx tsx scripts/security-audit.mts --live     — плюс проверка каждого опубликованного сайта по HTTPS
 *   npx tsx scripts/security-audit.mts --skip-build  — не собирать (быстро, если сборка уже есть)
 *
 * Сайты — не отдельные кодовые базы: одно приложение (конструктор), 80+ шаблонов, по файлу данных на
 * сайт и по одинаковому воркеру-маршрутизатору на сайт. Поэтому общие проверки делаются один раз,
 * а поштучные — для каждого сайта: его данные, его шаблон, его переводы и его живой адрес.
 *
 * Результаты: security/results/<slug>.json, security/results/_global.json, security/results/SUMMARY.md.
 * Код выхода 1 — найдено блокирующее нарушение (список в SUMMARY.md). Production не меняется:
 * живые проверки — только GET и заведомо отклоняемые POST без данных.
 */
import { execSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const OUT = path.join(root, 'security/results')
const LIVE = process.argv.includes('--live')
const SKIP_BUILD = process.argv.includes('--skip-build')
const SUB = process.env.WORKERS_SUBDOMAIN || 'genkai'
const ATLAS = process.env.ATLAS_URL || `https://atlas.${SUB}.workers.dev`
mkdirSync(OUT, { recursive: true })

type Check = { id: string; ok: boolean; blocking: boolean; detail?: string }
const sh = (cmd: string) => spawnSync('bash', ['-lc', cmd], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

// --- секреты: шаблоны, по которым ищем случайно закоммиченное (значения в отчёт не попадают) ---
const SECRET_PATTERNS: [string, RegExp][] = [
  ['telegram-bot-token', /\b\d{8,10}:AA[A-Za-z0-9_-]{33}\b/],
  ['cloudflare-api-token', /\b(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN)\s*[=:]\s*["']?[A-Za-z0-9_-]{40}\b/],
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['github-token', /\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{30,}\b/],
  ['anthropic/openai-key', /\bsk-(?:ant-)?[A-Za-z0-9_-]{30,}\b/],
  ['password-assignment', /\b(?:ADMIN_PASSWORD|ADMIN_SECRET)\s*=\s*["']?[^\s"'$]{6,}/],
]
// заведомо выдуманные значения из тестов (tests/auth.test.ts) — не секреты
const FAKE_VALUES = ['master-pass-123', 'changed-pass-456', 'test-secret']
function scanText(text: string): string[] {
  return SECRET_PATTERNS.filter(([, re]) => {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    return [...text.matchAll(g)].some((m) => !FAKE_VALUES.some((f) => m[0].includes(f)))
  }).map(([n]) => n)
}

const global: Check[] = []
const add = (list: Check[], id: string, ok: boolean, blocking: boolean, detail?: string) => list.push({ id, ok, blocking, detail })

// 1. секреты в отслеживаемых файлах и во всей истории git
{
  const files = sh('git ls-files').stdout.split('\n').filter(Boolean)
  const hits: string[] = []
  for (const f of files) {
    if (!existsSync(f) || statSync(f).size > 2_000_000 || /\.(png|jpe?g|webp|avif|gif|woff2?|ttf|pdf|pptx|ico)$/.test(f)) continue
    for (const n of scanText(readFileSync(f, 'utf8'))) hits.push(`${f}: ${n}`)
  }
  add(global, 'secrets-in-tracked-files', hits.length === 0, true, hits.join('; ') || undefined)
  const hist = sh("git log -p --all --no-color -- . ':(exclude)*.png' ':(exclude)*.pdf' ':(exclude)*.pptx' ':(exclude)package-lock.json'").stdout
  const histHits = scanText(hist)
  add(global, 'secrets-in-git-history', histHits.length === 0, true, histHits.length ? `шаблоны: ${histHits.join(', ')} — найти коммит и отозвать ключ` : undefined)
  const gi = readFileSync('.gitignore', 'utf8')
  add(global, 'gitignore-env', ['.env', '.dev.vars'].every((x) => gi.split('\n').includes(x)), true)
  const tracked = files.filter((f) => /(^|\/)\.env($|\.)|\.dev\.vars$|\.pem$/.test(f) && !f.endsWith('.env.example'))
  add(global, 'no-env-files-tracked', tracked.length === 0, true, tracked.join(', ') || undefined)
}

// 2. зависимости
{
  const prod = JSON.parse(sh('npm audit --omit=dev --json').stdout || '{}').metadata?.vulnerabilities ?? {}
  add(global, 'npm-audit-prod', !(prod.high || prod.critical), true, JSON.stringify(prod))
  const all = JSON.parse(sh('npm audit --json').stdout || '{}').metadata?.vulnerabilities ?? {}
  add(global, 'npm-audit-dev', !(all.high || all.critical), false, JSON.stringify(all))
  add(global, 'lockfile-present', existsSync('package-lock.json'), true)
}

// 3. статический анализ кода
{
  const r = sh('npx tsc --noEmit')
  add(global, 'typecheck', r.status === 0, true, r.status ? r.stdout.slice(0, 2000) : undefined)
  // опасный рендеринг HTML: разрешён только JSON-LD с экранированием «<» и наши служебные загрузчики
  const danger = sh("grep -rn 'dangerouslySetInnerHTML' src --include=*.tsx").stdout.split('\n').filter(Boolean)
  const unexpected = danger.filter((l) => !/PHONE_SCALE|MOTION_BOOT|jsonLd/.test(l))
  add(global, 'dangerous-html-allowlist', unexpected.length === 0, true, unexpected.join('\n') || undefined)
  const jsonld = readFileSync('src/components/SiteRenderer.tsx', 'utf8')
  add(global, 'jsonld-escaped', /JSON\.stringify\(buildJsonLd\(site\)\)\.replace\(\/<\/g/.test(jsonld), true)
  const evals = sh("grep -rnE '\\beval\\(|new Function\\(' src").stdout.trim()
  add(global, 'no-eval', !evals, true, evals || undefined)
  const cfg = readFileSync('next.config.ts', 'utf8')
  for (const h of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) add(global, `header-config:${h}`, cfg.includes(h), true)
  const actions = readFileSync('src/app/(main)/admin/actions.ts', 'utf8')
  // каждое серверное действие админки начинает с проверки прав (кроме входа/выхода/запроса области)
  const fns = [...actions.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{\n([^\n]*)/g)]
  const noGuard = fns.filter(([, name, first]) => !['login', 'logout', 'currentScope'].includes(name) && !/guard\(\)|canEdit\(/.test(first)).map(([, n]) => n)
  add(global, 'admin-actions-guarded', noGuard.length === 0, true, noGuard.join(', ') || undefined)
}

// 4. тесты и сборка
{
  const t = sh('npx vitest run')
  add(global, 'unit-tests', t.status === 0, true, t.stdout.split('\n').filter((l) => /Tests|failed|FAIL/.test(l)).join(' | ').slice(0, 500))
  if (!SKIP_BUILD) {
    const b = sh('npm run build')
    add(global, 'build', b.status === 0, true, b.status ? b.stdout.slice(-1500) : undefined)
  }
  // в публичной сборке (то, что уходит в браузер) — ни секретов, ни имён серверных переменных со значениями
  const dirs = ['.next/static', '.open-next/assets/_next'].filter(existsSync)
  const leaks: string[] = []
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.(js|json|html|css|txt)$/.test(e.name)) {
        const s = readFileSync(p, 'utf8')
        for (const n of scanText(s)) leaks.push(`${p}: ${n}`)
        for (const v of ['ADMIN_SECRET', 'CF_API_TOKEN', 'CF_ACCOUNT_ID', 'pass:']) if (s.includes(`"${v}`) || s.includes(`'${v}`)) leaks.push(`${p}: упоминание ${v}`)
      }
    }
  }
  dirs.forEach(walk)
  add(global, 'client-bundle-clean', dirs.length > 0 && leaks.length === 0, true, dirs.length ? leaks.slice(0, 20).join('; ') || undefined : 'сборки нет — проверка не выполнена')
}

// 5. поштучно: каждый сайт
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|sms:|tg:|whatsapp:|#|\/(?!\/)|\?)/i
const SAFE_IMG = /^(https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|webp|gif|avif);)/i
const templates = new Set(readdirSync('src/templates', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name))
const slugs = readdirSync('content/sites').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort()

async function http(url: string, init: RequestInit = {}) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch(url, { redirect: 'manual', ...init, signal: AbortSignal.timeout(20_000) })
    } catch (e) {
      if (i === 2) throw e
    }
  }
  throw new Error('unreachable')
}

const perSite: Record<string, Check[]> = {}
for (const slug of slugs) {
  const c: Check[] = []
  const raw = readFileSync(`content/sites/${slug}.json`, 'utf8')
  const site = JSON.parse(raw)
  add(c, 'slug-format', /^[a-z0-9-]+$/.test(site.slug) && site.slug === slug, true)
  add(c, 'template-exists', templates.has(site.template), true, site.template)
  const unsafe: string[] = []
  const walkJ = (o: unknown, p: string) => {
    if (Array.isArray(o)) o.forEach((v, i) => walkJ(v, `${p}[${i}]`))
    else if (o && typeof o === 'object')
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === 'string' && v.trim() && (k === 'href' || k === 'url') && !SAFE_HREF.test(v.trim())) unsafe.push(`${p}.${k}`)
        else if (typeof v === 'string' && v.trim() && /^(image|ogImage|logo|photo|avatar|poster|cover)$/.test(k) && !SAFE_IMG.test(v.trim())) unsafe.push(`${p}.${k}`)
        else walkJ(v, `${p}.${k}`)
      }
  }
  const trs = ['uz', 'en'].map((l) => `content/sites/i18n/${slug}.${l}.json`)
  walkJ(site, '')
  trs.filter(existsSync).forEach((f) => walkJ(JSON.parse(readFileSync(f, 'utf8')), f))
  add(c, 'content-links-safe', unsafe.length === 0, true, unsafe.slice(0, 10).join(', ') || undefined)
  add(c, 'content-no-secrets', scanText(raw).length === 0, true)
  add(c, 'no-inline-html-in-content', !/<\s*(script|iframe|object|embed)\b/i.test(raw + trs.filter(existsSync).map((f) => readFileSync(f, 'utf8')).join('')), true)
  add(c, 'translations-present', trs.every(existsSync), false)
  perSite[slug] = c
}

// 6. живые проверки каждого опубликованного сайта
if (LIVE) {
  const queue = [...slugs]
  const worker = async () => {
    for (let slug = queue.shift(); slug; slug = queue.shift()) {
      const c = perSite[slug]
      const base = `https://${slug}.${SUB}.workers.dev`
      try {
        for (const l of ['', 'uz/', 'en/']) {
          const r = await http(`${base}/${l}`)
          add(c, `live-page-200:/${l}`, r.status === 200, true, String(r.status))
          if (l === '') {
            const h = r.headers
            add(c, 'live-csp', (h.get('content-security-policy') || '').includes("object-src 'none'"), true)
            add(c, 'live-hsts', (h.get('strict-transport-security') || '').includes('max-age='), true)
            add(c, 'live-nosniff', h.get('x-content-type-options') === 'nosniff', true)
            add(c, 'live-frame', !!h.get('x-frame-options'), true)
            const html = await r.text()
            add(c, 'live-html-no-secrets', scanText(html).length === 0 && !/ADMIN_SECRET|CF_API_TOKEN/.test(html), true)
            add(c, 'live-no-stack-trace', !/at\s+\S+\s+\(.*\.js:\d+:\d+\)/.test(html), true)
          } else await r.body?.cancel()
        }
        const adm = await http(`${base}/admin/login`)
        const admHtml = await adm.text()
        add(c, 'live-admin-not-cacheable', (adm.headers.get('cache-control') || '').includes('no-store'), true)
        add(c, 'live-admin-noindex', (adm.headers.get('x-robots-tag') || '').includes('noindex'), true)
        add(c, 'live-admin-no-framing', adm.headers.get('x-frame-options') === 'DENY', true)
        add(c, 'live-admin-knows-site', admHtml.includes('Вход в админку сайта'), true)
        const priv = await http(`${base}/admin`)
        add(c, 'live-admin-requires-login', [302, 303, 307, 308].includes(priv.status) && (priv.headers.get('location') || '').includes('/admin/login'), true, `${priv.status} ${priv.headers.get('location')}`)
        await priv.body?.cancel()
        const up = await http(`${base}/api/admin/upload`, { method: 'POST' })
        add(c, 'live-upload-requires-login', up.status === 401, true, String(up.status))
        await up.body?.cancel()
        const evil = await http(`${base}/api/lead`, { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{}' })
        add(c, 'live-form-rejects-foreign-origin', evil.status === 403, true, String(evil.status))
        await evil.body?.cancel()
        const cross = await http(`${base}/api/order`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: slug === 'sofa' ? 'kiyim' : 'sofa', lines: [] }) })
        add(c, 'live-form-bound-to-site', cross.status === 403, true, String(cross.status))
        await cross.body?.cancel()
        const big = await http(`${base}/api/order`, { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '50000' }, body: 'x'.repeat(50_000) })
        add(c, 'live-form-body-limit', big.status === 413, true, String(big.status))
        await big.body?.cancel()
        const trav = await http(`${base}/media/..%2F..%2Fwrangler.jsonc`)
        add(c, 'live-media-traversal', [400, 404].includes(trav.status), true, String(trav.status))
        await trav.body?.cancel()
      } catch (e) {
        add(c, 'live-reachable', false, true, String(e))
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker))
  // подделка заголовка сайта на адресе конструктора
  const spoof = await http(`${ATLAS}/admin/login`, { headers: { 'x-atlas-site': 'sofa' } })
  add(global, 'live-atlas-ignores-spoofed-site-header', (await spoof.text()).includes('Вход в конструктор'), true)
  const login = await http(`${ATLAS}/admin`)
  add(global, 'live-atlas-admin-requires-login', [302, 303, 307, 308].includes(login.status), true, String(login.status))
  await login.body?.cancel()
}

// --- отчёт ---
const failedBlocking = (l: Check[]) => l.filter((x) => !x.ok && x.blocking)
writeFileSync(path.join(OUT, '_global.json'), JSON.stringify(global, null, 2))
for (const [s, l] of Object.entries(perSite)) writeFileSync(path.join(OUT, `${s}.json`), JSON.stringify(l, null, 2))
const rows = Object.entries(perSite).map(([s, l], i) => `| ${i + 1} | ${s} | ${l.length} | ${l.filter((x) => x.ok).length} | ${failedBlocking(l).map((x) => x.id).join(', ') || '—'} |`)
const gBad = failedBlocking(global)
const sitesBad = Object.entries(perSite).filter(([, l]) => failedBlocking(l).length)
const md = [
  `# Сводка аудита — ${new Date().toISOString()}`,
  '',
  `Режим: ${LIVE ? 'код + живые адреса' : 'только код'}. Сайтов: ${slugs.length}. Шаблонов: ${templates.size}.`,
  '',
  '## Общие проверки',
  '',
  '| Проверка | Итог | Блокирует | Подробности |',
  '|---|---|---|---|',
  ...global.map((x) => `| ${x.id} | ${x.ok ? 'OK' : 'НЕТ'} | ${x.blocking ? 'да' : 'нет'} | ${(x.detail || '').replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 200)} |`),
  '',
  '## Сайты',
  '',
  '| № | Сайт | Проверок | Пройдено | Блокирующие нарушения |',
  '|---|---|---|---|---|',
  ...rows,
  '',
  `Итог: общих блокирующих нарушений — ${gBad.length}, сайтов с блокирующими нарушениями — ${sitesBad.length}.`,
].join('\n')
writeFileSync(path.join(OUT, 'SUMMARY.md'), md + '\n')
console.log(`общие: ${global.filter((x) => x.ok).length}/${global.length}; сайты с нарушениями: ${sitesBad.length}/${slugs.length}`)
for (const x of gBad) console.log('НАРУШЕНИЕ', x.id, x.detail?.slice(0, 300) ?? '')
for (const [s, l] of sitesBad) console.log('САЙТ', s, failedBlocking(l).map((x) => `${x.id}(${x.detail ?? ''})`).join(', '))
process.exit(gBad.length || sitesBad.length ? 1 : 0)
