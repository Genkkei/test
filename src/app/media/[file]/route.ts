import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MEDIA_DIR, mimeOf } from '@/lib/media'

export async function GET(_req: Request, ctx: RouteContext<'/media/[file]'>) {
  const { file } = await ctx.params
  const mime = /^[a-f0-9]{20}\.[a-z]{3,4}$/.test(file) ? mimeOf(file) : null
  if (!mime) return new Response('Not found', { status: 404 })
  try {
    const bytes = await readFile(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, file))
    return new Response(new Uint8Array(bytes), {
      headers: { 'content-type': mime, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
