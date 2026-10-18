import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { siteSchema, type Site } from './schema'
import { EXTRA_LANGS, mergeTranslation } from './i18n'
import { kvDel, kvGet, kvList, kvPut, onCloudflare } from './kv'

/*
 * Два слоя: исходные сайты из content/ (только чтение) и правки из админки в хранилище
 * (kv.ts: файлы локально, D1 на Cloudflare). Правка перекрывает исходник с тем же slug,
 * удаление — надгробие dead:<slug>, чтобы исходник не воскресал после деплоя.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content', 'sites')

/*
 * Исходники: локально — файлы content/sites (правка JSON видна без пересборки),
 * на Cloudflare — модуль seeds.generated.ts (scripts/seeds.mjs), файлов там нет.
 */
async function seedSites(): Promise<Map<string, unknown>> {
  if (onCloudflare()) return new Map(Object.entries((await import('./seeds.generated')).SITES))
  const out = new Map<string, unknown>()
  let files: string[] = []
  try {
    files = await fs.readdir(CONTENT_DIR)
  } catch {
    return out
  }
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    try {
      out.set(f.slice(0, -5), JSON.parse(await fs.readFile(path.join(CONTENT_DIR, f), 'utf8')))
    } catch (error) {
      console.error(`[store] не читается ${f}:`, error)
    }
  }
  return out
}

async function seedTranslation(slug: string, lang: string): Promise<Record<string, unknown> | null> {
  if (onCloudflare()) return (await import('./seeds.generated')).TRANSLATIONS[`${slug}.${lang}`] ?? null
  try {
    return JSON.parse(await fs.readFile(path.join(CONTENT_DIR, 'i18n', `${slug}.${lang}.json`), 'utf8'))
  } catch {
    return null
  }
}

function parse(raw: unknown, slug: string): Site | null {
  const result = siteSchema.safeParse(raw)
  if (!result.success) {
    console.error(`[store] сайт ${slug} не прошёл схему:`, result.error.issues.slice(0, 3))
    return null
  }
  return result.data
}

const json = (v: string | null) => (v == null ? null : JSON.parse(v))

export async function listSites(): Promise<Site[]> {
  const [seeds, edits, dead] = await Promise.all([seedSites(), kvList('site:'), kvList('dead:')])
  const merged = new Map(seeds)
  for (const [k, v] of edits) merged.set(k.slice(5), JSON.parse(v))
  const sites: Site[] = []
  for (const [slug, raw] of merged) {
    if (dead.has(`dead:${slug}`)) continue
    const site = parse(raw, slug)
    if (site) sites.push(site)
  }
  return sites.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

async function readTranslation(slug: string, lang: string): Promise<Record<string, unknown> | null> {
  return json(await kvGet(`tr:${slug}:${lang}`)) ?? (await seedTranslation(slug, lang))
}

/** Основной сайт без перевода — для редактора и слияния. */
async function readBase(slug: string): Promise<Site | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  const [edit, dead] = await Promise.all([kvGet(`site:${slug}`), kvGet(`dead:${slug}`)])
  if (dead) return null
  const raw = json(edit) ?? (await seedSites()).get(slug)
  return raw ? parse(raw, slug) : null
}

/** Сайт на основном языке или, если передан lang и есть перевод, — на нём. */
export async function getSite(slug: string, lang?: string): Promise<Site | null> {
  const base = await readBase(slug)
  if (!base || !lang || lang === base.lang) return base
  const tr = await readTranslation(slug, lang)
  return tr ? mergeTranslation(base, tr, lang) : null
}

/** Языки, на которых сайт есть: основной + те, для которых лежит перевод. */
export async function siteLangs(slug: string): Promise<string[]> {
  const base = await readBase(slug)
  if (!base) return []
  const out = [base.lang]
  for (const l of EXTRA_LANGS) if (l !== base.lang && (await readTranslation(slug, l))) out.push(l)
  return out
}

export async function saveTranslation(slug: string, lang: string, data: Record<string, unknown>): Promise<void> {
  await kvPut(`tr:${slug}:${lang}`, JSON.stringify(data))
}

export async function saveSite(site: Site): Promise<Site> {
  const clean = siteSchema.parse({ ...site, updatedAt: new Date().toISOString() })
  await kvPut(`site:${clean.slug}`, JSON.stringify(clean))
  await kvDel(`dead:${clean.slug}`)
  return clean
}

export async function deleteSite(slug: string): Promise<void> {
  await kvDel(`site:${slug}`)
  // надгробие, чтобы исходник из content/ не воскресал
  await kvPut(`dead:${slug}`, new Date().toISOString())
}

/** Сайт, к которому привязан домен (для proxy и canonical). */
export async function siteByHost(host: string): Promise<Site | null> {
  const h = host.toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '')
  const sites = await listSites()
  return sites.find((s) => s.domains.some((d) => d.toLowerCase().replace(/^www\./, '') === h)) ?? null
}

/** Переводы сайта под новым адресом — для копии сайта клиенту. */
export async function copyTranslations(from: string, to: string): Promise<void> {
  for (const l of EXTRA_LANGS) {
    const tr = await readTranslation(from, l)
    if (tr) await saveTranslation(to, l, tr)
  }
}

/** Перевод как он хранится (для переноса сайта заказчику). */
export async function rawTranslation(slug: string, lang: string): Promise<Record<string, unknown> | null> {
  return readTranslation(slug, lang)
}
