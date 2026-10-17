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
