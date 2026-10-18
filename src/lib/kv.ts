import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'

/*
 * Хранилище правок «ключ → JSON-строка». Два исполнения с одним интерфейсом:
 * - на Cloudflare (ATLAS_STORE=d1) — таблица `docs` в D1: запись видна сразу во всех
 *   изолятах, в отличие от KV с его минутной задержкой; владельцу сайта важно увидеть
 *   правку при следующем обновлении страницы;
 * - локально — файлы в DATA_DIR/kv, как раньше.
 * Ключи: site:<slug>, tr:<slug>:<lang>, dead:<slug>, pass:<slug>.
 */

type D1 = {
  prepare(sql: string): { bind(...v: unknown[]): { first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; run(): Promise<unknown> } }
}

// функция, а не константа: на Workers process.env наполняется уже внутри запроса
export const onCloudflare = () => process.env.ATLAS_STORE === 'd1'

async function db(): Promise<D1> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  return (env as unknown as { DB: D1 }).DB
}

const DIR = path.join(/*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'kv')
const file = (k: string) => path.join(/*turbopackIgnore: true*/ DIR, `${encodeURIComponent(k)}.json`)

export async function kvGet(k: string): Promise<string | null> {
  if (onCloudflare()) {
    const row = await (await db()).prepare('SELECT v FROM docs WHERE k = ?').bind(k).first<{ v: string }>()
    return row?.v ?? null
  }
  try {
    return await fs.readFile(file(k), 'utf8')
  } catch {
    return null
  }
}

export async function kvPut(k: string, v: string): Promise<void> {
  if (onCloudflare()) {
    await (await db())
      .prepare('INSERT INTO docs (k, v, at) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, at = excluded.at')
      .bind(k, v, new Date().toISOString())
      .run()
    return
  }
  await fs.mkdir(DIR, { recursive: true })
  // запись через временный файл: обрыв посреди записи не оставит полу-JSON
  await fs.writeFile(`${file(k)}.tmp`, v)
  await fs.rename(`${file(k)}.tmp`, file(k))
}

export async function kvDel(k: string): Promise<void> {
  if (onCloudflare()) {
    await (await db()).prepare('DELETE FROM docs WHERE k = ?').bind(k).run()
    return
  }
  await fs.rm(file(k), { force: true })
}

/** Все записи с префиксом — одним запросом. */
export async function kvList(prefix: string): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  if (onCloudflare()) {
    const { results } = await (await db()).prepare('SELECT k, v FROM docs WHERE k >= ? AND k < ?').bind(prefix, `${prefix}￿`).all<{ k: string; v: string }>()
    for (const r of results) out.set(r.k, r.v)
    return out
  }
  let files: string[] = []
  try {
    files = await fs.readdir(DIR)
  } catch {
    return out
  }
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    const k = decodeURIComponent(f.slice(0, -5))
    if (k.startsWith(prefix)) out.set(k, await fs.readFile(path.join(/*turbopackIgnore: true*/ DIR, f), 'utf8'))
  }
  return out
}
