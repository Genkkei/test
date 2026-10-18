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
