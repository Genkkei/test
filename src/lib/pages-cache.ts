import 'server-only'

/*
 * Кэш готовых страниц сайтов (KV PAGES, его читают маршрутизаторы workers/router/index.js).
 * После правки в админке ключи сайта стираются: следующая загрузка соберёт страницу заново.
 * Локально и без привязки PAGES — ничего не делает.
 */

type KV = { list(o: { prefix: string; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>; delete(k: string): Promise<void> }

export const PAGES_KV_ID = '853cb4952bfb433e8740a3261abf2b7f'

export async function purgePages(slug: string): Promise<void> {
  if (process.env.ATLAS_STORE !== 'd1') return
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env, ctx } = await getCloudflareContext({ async: true })
  const kv = (env as unknown as { PAGES?: KV }).PAGES
  if (!kv) return
  const run = async () => {
    let cursor: string | undefined
    do {
      const page = await kv.list({ prefix: `${slug}:`, cursor })
      await Promise.all(page.keys.map((k) => kv.delete(k.name)))
      cursor = page.list_complete ? undefined : page.cursor
    } while (cursor)
  }
  ctx.waitUntil(run().catch(() => {}))
}
