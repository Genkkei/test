import 'server-only'
import { SNAPSHOT } from './export-snapshot.generated'
import { EXTRA_LANGS } from './i18n'
import { mediaGet } from './media'
import { getSite, rawTranslation } from './store'

/*
 * Проект одного сайта для переноса заказчику: тот же движок, но только его сайт, его шаблон, его фото
 * и инструкция. Чужие сайты, остальные шаблоны, наши документы и служебные скрипты в него не попадают.
 */

export type ProjectFile = string | { b64: string }
export type ClientProject = { slug: string; name: string; files: Record<string, ProjectFile> }

const WORKFLOW = `name: Выкладка в Cloudflare
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: deploy
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: node scripts/client-deploy.mjs
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          ADMIN_PASSWORD: \${{ secrets.ADMIN_PASSWORD }}
          ADMIN_SECRET: \${{ secrets.ADMIN_SECRET }}
`

function readme(name: string, slug: string): string {
  return `# ${name} — сайт

Сайт работает на Cloudflare Workers в вашем аккаунте. Код — в этом репозитории, он ваш.

## Как устроено

- Сайт: \`https://${slug}.<ваш поддомен>.workers.dev\`, админка — тот же адрес + \`/admin\`.
- Тексты, цены, фото, контакты, языки, заявки в Telegram — меняются в админке, без программиста.
- Каждый push в ветку \`main\` сам выкладывает сайт (вкладка **Actions** в GitHub).
- Данные правок — база D1 \`${slug}-db\`, фото — хранилище R2 \`${slug}-media\` в вашем Cloudflare.

## Секреты (GitHub → Settings → Secrets and variables → Actions)

| Имя | Что это |
|---|---|
| CLOUDFLARE_API_TOKEN | ключ вашего Cloudflare (права: Workers, D1, R2, настройки аккаунта) |
| CLOUDFLARE_ACCOUNT_ID | номер вашего аккаунта Cloudflare |
| ADMIN_PASSWORD | пароль входа в админку |
| ADMIN_SECRET | ключ подписи сессий и шифрования токенов; при смене все выходят из админки |

Сменить пароль админки: поменяйте ADMIN_PASSWORD здесь и нажмите Actions → «Выкладка в Cloudflare» → Run workflow.

## Свой домен

Админка → «Публикация и домен» → впишите домен (например, mycafe.uz) → пропишите у регистратора два
NS-сервера Cloudflare, которые покажет админка → через 1–24 часа нажмите ещё раз.

## Вручную, без GitHub

\`\`\`bash
npm ci
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… ADMIN_PASSWORD=… ADMIN_SECRET=… node scripts/client-deploy.mjs
\`\`\`
`
}

export async function buildClientProject(slug: string): Promise<ClientProject> {
  const site = await getSite(slug)
  if (!site) throw new Error('Нет такого сайта')
  const tpl = site.template
  // шаблон сайта и шаблоны, из которых он что-то берёт (import '../oak/objects')
  const keep = new Set([tpl])
  for (let grew = true; grew; ) {
    grew = false
    for (const [p, v] of Object.entries(SNAPSHOT)) {
      const m = p.match(/^src\/templates\/([^/]+)\//)
      if (!m || !keep.has(m[1]) || typeof v !== 'string') continue
      for (const [, dep] of v.matchAll(/from '\.\.\/([a-z0-9-]+)\//g)) if (!keep.has(dep)) (keep.add(dep), (grew = true))
    }
  }
  const files: Record<string, ProjectFile> = {}
  for (const [p, v] of Object.entries(SNAPSHOT)) {
    const t = p.match(/^src\/templates\/([^/]+)\//)?.[1]
    if (t && !keep.has(t)) continue
    if (p === 'README.md' || p === 'wrangler.jsonc') continue
    files[p] = v
  }
  // реестры шаблонов — только шаблон этого сайта
  for (const reg of ['src/templates/registry.ts', 'src/templates/meta.ts']) {
    const src = files[reg]
    if (typeof src !== 'string') continue
    files[reg] = src
      .split('\n')
      .filter((l) => {
        const m = l.match(/^import \{ (?:template|meta) as \w+ \} from '\.\/([a-z0-9-]+)(\/meta)?'/)
        return !m || m[1] === tpl
      })
      .join('\n')
      .replace(/\[([^\]]*)\]/g, (all, inner: string) => {
        const ids = inner.split(',').map((s) => s.trim()).filter(Boolean)
        return ids.length > 1 && ids.every((s) => /^[a-z0-9]+$/.test(s)) && ids.includes(tpl) ? `[${tpl}]` : all
      })
  }
  // данные: сайт с правками из админки, переводы, фото
  const data = { ...site, domains: [], listing: { ...site.listing, forSale: false } }
  files[`content/sites/${slug}.json`] = JSON.stringify(data, null, 2) + '\n'
  for (const l of EXTRA_LANGS) {
    if (l === site.lang) continue
    const tr = await rawTranslation(slug, l)
    if (tr) files[`content/sites/i18n/${slug}.${l}.json`] = JSON.stringify(tr, null, 2) + '\n'
  }
  const media = [...new Set(JSON.stringify(data).match(/\/media\/[a-f0-9]{20}\.[a-z]{3,4}/g) ?? [])]
  for (const m of media) {
    const bytes = await mediaGet(m.slice(7))
    if (bytes) files[`seed/media/${m.slice(7)}`] = { b64: Buffer.from(bytes).toString('base64') }
  }
  files['atlas.client.json'] = JSON.stringify({ slug, name: site.name, template: tpl, exportedAt: new Date().toISOString() }, null, 2) + '\n'
  files['.github/workflows/deploy.yml'] = WORKFLOW
  files['README.md'] = readme(site.name, slug)
  files['wrangler.jsonc'] = '// Пишется scripts/client-deploy.mjs при каждой выкладке (имена базы и хранилища вашего аккаунта).\n{}\n'
  return { slug, name: site.name, files }
}
