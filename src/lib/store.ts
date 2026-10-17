import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { siteSchema, type Site } from './schema'

/*
 * Два слоя: content/sites — исходные сайты в репозитории (только чтение),
 * DATA_DIR/sites — правки из админки. Правка перекрывает исходник с тем же slug,
 * удаление — файл-надгробие `<slug>.deleted`, чтобы исходник не воскресал после деплоя.
 * Хранилище — файловая система: работает на любом Node-хостинге и в Docker с томом.
 * Для бессерверного хостинга (Vercel, Workers) нужно заменить этот модуль на KV/БД —
 * интерфейс из четырёх функций ниже.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content', 'sites')
const DATA_DIR = path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'sites')

async function readJsonDir(dir: string): Promise<Map<string, unknown>> {
  const out = new Map<string, unknown>()
  let files: string[] = []
  try {
    files = await fs.readdir(dir)
  } catch {
    return out
  }
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    try {
      out.set(file.slice(0, -5), JSON.parse(await fs.readFile(path.join(dir, file), 'utf8')))
    } catch (error) {
      console.error(`[store] не читается ${file}:`, error)
    }
  }
  return out
}

async function tombstones(): Promise<Set<string>> {
  try {
    return new Set((await fs.readdir(DATA_DIR)).filter((f) => f.endsWith('.deleted')).map((f) => f.slice(0, -8)))
  } catch {
    return new Set()
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

export async function listSites(): Promise<Site[]> {
  const [content, data, dead] = await Promise.all([readJsonDir(CONTENT_DIR), readJsonDir(DATA_DIR), tombstones()])
  const merged = new Map(content)
  for (const [slug, raw] of data) merged.set(slug, raw)
  const sites: Site[] = []
  for (const [slug, raw] of merged) {
    if (dead.has(slug)) continue
    const site = parse(raw, slug)
    if (site) sites.push(site)
  }
  return sites.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

export async function getSite(slug: string): Promise<Site | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  if ((await tombstones()).has(slug)) return null
  for (const dir of [DATA_DIR, CONTENT_DIR]) {
    try {
      return parse(JSON.parse(await fs.readFile(path.join(dir, `${slug}.json`), 'utf8')), slug)
    } catch {
      /* нет в этом слое — смотрим следующий */
    }
  }
  return null
}

export async function saveSite(site: Site): Promise<Site> {
  const clean = siteSchema.parse({ ...site, updatedAt: new Date().toISOString() })
  await fs.mkdir(DATA_DIR, { recursive: true })
  const file = path.join(DATA_DIR, `${clean.slug}.json`)
  // запись через временный файл: обрыв посреди записи не оставит полу-JSON
  await fs.writeFile(`${file}.tmp`, JSON.stringify(clean, null, 2))
  await fs.rename(`${file}.tmp`, file)
  await fs.rm(path.join(DATA_DIR, `${clean.slug}.deleted`), { force: true })
  return clean
}

export async function deleteSite(slug: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.rm(path.join(DATA_DIR, `${slug}.json`), { force: true })
  await fs.writeFile(path.join(DATA_DIR, `${slug}.deleted`), new Date().toISOString())
}

/** Сайт, к которому привязан домен (для proxy и canonical). */
export async function siteByHost(host: string): Promise<Site | null> {
  const h = host.toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '')
  const sites = await listSites()
  return sites.find((s) => s.domains.some((d) => d.toLowerCase().replace(/^www\./, '') === h)) ?? null
}
