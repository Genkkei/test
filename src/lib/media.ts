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

export function mimeOf(file: string): string | null {
  const ext = file.split('.').pop()?.toLowerCase()
  return TYPES.find((t) => t.ext === ext)?.mime ?? null
}

type R2 = {
  put(k: string, v: Uint8Array, o?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
  get(k: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>
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
