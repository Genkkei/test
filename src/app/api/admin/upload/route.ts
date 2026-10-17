import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isAdmin } from '@/lib/auth'
import { MAX_MEDIA_BYTES, MEDIA_DIR, sniffImage } from '@/lib/media'

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Нужен вход в админку' }, { status: 401 })
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'Нет файла' }, { status: 400 })
  if (file.size > MAX_MEDIA_BYTES) return Response.json({ error: 'Файл больше 8 МБ' }, { status: 413 })
  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = sniffImage(bytes)
  if (!type) return Response.json({ error: 'Нужна картинка JPG, PNG, WebP, AVIF или GIF' }, { status: 415 })
  // имя от содержимого: повторная загрузка того же фото не плодит копии
  const name = `${createHash('sha256').update(bytes).digest('hex').slice(0, 20)}.${type.ext}`
  await mkdir(MEDIA_DIR, { recursive: true })
  await writeFile(path.join(MEDIA_DIR, name), bytes)
  return Response.json({ url: `/media/${name}` })
}
