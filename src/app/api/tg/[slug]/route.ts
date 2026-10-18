import { handleUpdate } from '@/lib/bot'
import { getSite } from '@/lib/store'
import { siteUrl } from '@/lib/seo'

/** Вебхук Telegram. Отвечаем 200 всегда: иначе Telegram повторяет запрос и держит очередь. */
export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  // Telegram шлёт короткие апдейты; большое тело — не от него
  if (Number(request.headers.get('content-length') || 0) > 65_536 || !/^[a-z0-9-]+$/.test(slug)) return new Response('ok')
  const site = await getSite(slug)
  if (site) {
    const update = await request.json().catch(() => ({}))
    await handleUpdate(slug, request.headers.get('x-telegram-bot-api-secret-token'), update, site.name, siteUrl(site)).catch((e) => console.error('[tg]', slug, e))
  }
  return new Response('ok')
}
