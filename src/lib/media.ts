import 'server-only'
import path from 'node:path'

export const MEDIA_DIR = path.join(/*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'media')
export const MAX_MEDIA_BYTES = 8 * 1024 * 1024

const TYPES: { ext: string; mime: string; test: (b: Uint8Array) => boolean }[] = [
  { ext: 'jpg', mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', mime: 'image/png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'gif', mime: 'image/gif', test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  { ext: 'webp', mime: 'image/webp', test: (b) => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP' },
  { ext: 'avif', mime: 'image/avif', test: (b) => String.fromCharCode(...b.slice(4, 12)).startsWith('ftypavi') },
]

/** Тип — по байтам, а не по имени файла или заголовку браузера. SVG не принимается: в нём бывает скрипт. */
export function sniffImage(bytes: Uint8Array) {
  return TYPES.find((t) => t.test(bytes)) ?? null
}

// видео и превью к нему кладёт только scripts/media.mjs (стоки и генерация), через админку их не загрузить
const SERVE_ONLY: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm' }

export function mimeOf(file: string): string | null {
  const ext = file.split('.').pop()?.toLowerCase()
  return TYPES.find((t) => t.ext === ext)?.mime ?? (ext ? SERVE_ONLY[ext] ?? null : null)
}

type R2Body = { arrayBuffer(): Promise<ArrayBuffer>; body: ReadableStream; size: number; range?: { offset: number; length: number } }
type R2 = {
  put(k: string, v: Uint8Array, o?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
  get(k: string, o?: { range?: { offset: number; length?: number } | { suffix: number } }): Promise<R2Body | null>
  head(k: string): Promise<{ size: number } | null>
}

async function bucket(): Promise<R2> {
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  const { env } = await getCloudflareContext({ async: true })
  return (env as unknown as { MEDIA: R2 }).MEDIA
}

/** Фото: на Cloudflare — бакет R2 (binding MEDIA), локально — папка DATA_DIR/media. */
export async function mediaPut(name: string, bytes: Uint8Array, mime: string): Promise<void> {
  if (process.env.ATLAS_STORE === 'd1') {
    await (await bucket()).put(name, bytes, { httpMetadata: { contentType: mime } })
    return
  }
  const { mkdir, writeFile } = await import('node:fs/promises')
  await mkdir(MEDIA_DIR, { recursive: true })
  await writeFile(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, name), bytes)
}

export async function mediaGet(name: string): Promise<Uint8Array | null> {
  try {
    if (process.env.ATLAS_STORE === 'd1') {
      const obj = await (await bucket()).get(name)
      return obj ? new Uint8Array(await obj.arrayBuffer()) : null
    }
    const { readFile } = await import('node:fs/promises')
    return new Uint8Array(await readFile(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, name)))
  } catch {
    return null
  }
}

/** Файл частями (заголовок Range): без этого Safari не играет видео. На Cloudflare — поток из R2. */
export async function mediaRange(name: string, range: string | null): Promise<{ body: BodyInit; size: number; start: number; end: number } | null> {
  const m = range?.match(/^bytes=(\d*)-(\d*)$/)
  try {
    if (process.env.ATLAS_STORE === 'd1') {
      const b = await bucket()
      const head = await b.head(name)
      if (!head) return null
      const size = head.size
      let start = 0
      let end = size - 1
      if (m) {
        if (m[1]) start = Number(m[1])
        if (m[2]) end = Math.min(Number(m[2]), size - 1)
        if (!m[1] && m[2]) { start = Math.max(0, size - Number(m[2])); end = size - 1 }
      }
      if (start > end || start >= size) return null
      const obj = await b.get(name, { range: { offset: start, length: end - start + 1 } })
      return obj ? { body: obj.body, size, start, end } : null
    }
    const bytes = await mediaGet(name)
    if (!bytes) return null
    const size = bytes.length
    let start = 0
    let end = size - 1
    if (m) {
      if (m[1]) start = Number(m[1])
      if (m[2]) end = Math.min(Number(m[2]), size - 1)
      if (!m[1] && m[2]) { start = Math.max(0, size - Number(m[2])); end = size - 1 }
    }
    if (start > end || start >= size) return null
    return { body: bytes.slice(start, end + 1) as unknown as BodyInit, size, start, end }
  } catch {
    return null
  }
}
