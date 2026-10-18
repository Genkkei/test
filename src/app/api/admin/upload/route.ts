import { createHash } from 'node:crypto'
import { adminScope } from '@/lib/auth'
import { hitLimit } from '@/lib/guard'
import { kvGet, kvPut } from '@/lib/kv'
import { MAX_MEDIA_BYTES, mediaPut, sniffImage } from '@/lib/media'

export async function POST(request: Request) {
  const scope = await adminScope()
  if (!scope) return Response.json({ error: 'Нужен вход в админку' }, { status: 401 })
  // 120 файлов в час на область входа: украденная сессия не забьёт хранилище
  if (await hitLimit({ get: kvGet, put: kvPut }, `rl:upload:${scope}`, 120, 3_600_000)) return Response.json({ error: 'Слишком много загрузок, подождите час' }, { status: 429 })
  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'Нет файла' }, { status: 400 })
  if (file.size > MAX_MEDIA_BYTES) return Response.json({ error: 'Файл больше 8 МБ' }, { status: 413 })
  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = sniffImage(bytes)
  if (!type) return Response.json({ error: 'Нужна картинка JPG, PNG, WebP, AVIF или GIF' }, { status: 415 })
  // имя от содержимого: повторная загрузка того же фото не плодит копии
  const name = `${createHash('sha256').update(bytes).digest('hex').slice(0, 20)}.${type.ext}`
  await mediaPut(name, bytes, type.mime)
  return Response.json({ url: `/media/${name}` })
}
