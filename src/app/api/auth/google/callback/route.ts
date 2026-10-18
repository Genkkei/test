import { loginFailed, startSession, clientIp } from '@/lib/auth'
import { googleFinish } from '@/lib/google'

export async function GET(request: Request) {
  const url = new URL(request.url)
  try {
    await googleFinish(url.searchParams.get('state') || '', url.searchParams.get('code') || '')
    await startSession('*')
    return Response.redirect(new URL('/admin', url).toString(), 302)
  } catch (e) {
    await loginFailed(await clientIp())
    const msg = url.searchParams.get('error') === 'access_denied' ? 'Вход через Google отменён' : e instanceof Error ? e.message : 'Ошибка входа'
    return Response.redirect(new URL(`/admin/login?err=${encodeURIComponent(msg.slice(0, 160))}`, url).toString(), 302)
  }
}
