import { mediaGet, mimeOf } from '@/lib/media'

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params
  const mime = /^[a-f0-9]{20}\.[a-z]{3,4}$/.test(file) ? mimeOf(file) : null
  const bytes = mime ? await mediaGet(file) : null
  if (!bytes || !mime) return new Response('Not found', { status: 404 })
  return new Response(bytes as unknown as BodyInit, {
    headers: { 'content-type': mime, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' },
  })
}
