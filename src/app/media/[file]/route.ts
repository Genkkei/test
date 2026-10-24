import { mediaRange, mimeOf } from '@/lib/media'

// Имя — 20 hex и расширение (фото из админки) или <slug>-<20 hex>.<ext> (стоки и генерация scripts/media.mjs).
const NAME = /^(?:[a-z0-9-]{1,40}-)?[a-f0-9]{20}\.[a-z0-9]{3,4}$/

export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params
  const mime = NAME.test(file) ? mimeOf(file) : null
  if (!mime) return new Response('Not found', { status: 404 })
  const range = req.headers.get('range')
  const part = await mediaRange(file, range)
  if (!part) return new Response('Not found', { status: range ? 416 : 404 })
  const headers: Record<string, string> = {
    'content-type': mime,
    'cache-control': 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
    'accept-ranges': 'bytes',
    'content-length': String(part.end - part.start + 1),
  }
  if (!range) return new Response(part.body, { headers })
  headers['content-range'] = `bytes ${part.start}-${part.end}/${part.size}`
  return new Response(part.body, { status: 206, headers })
}
