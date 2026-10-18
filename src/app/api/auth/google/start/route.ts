import { hostSite } from '@/lib/auth'
import { googleConfigured, googleStart } from '@/lib/google'
import { hitLimit, requestIp } from '@/lib/guard'
import { kvGet, kvPut } from '@/lib/kv'

export async function GET(request: Request) {
  // вход через Google — только на адресе конструктора (адрес возврата зарегистрирован в Google один)
  if ((await hostSite()) || !(await googleConfigured())) return new Response('Вход через Google не настроен', { status: 404 })
  if (await hitLimit({ get: kvGet, put: kvPut }, `rl:google:${requestIp(request)}`, 20, 600_000)) return new Response('Слишком много попыток', { status: 429 })
  return Response.redirect(await googleStart(), 302)
}
