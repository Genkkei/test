import { exchangeCode, githubUser, missingScopes } from '@/lib/github'
import { kvDel, kvGet } from '@/lib/kv'
import { getTransfer, linkOf, saveTransfer, sealKey } from '@/lib/transfer'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state') || ''
  const code = url.searchParams.get('code') || ''
  if (!/^[A-Za-z0-9_-]{32}$/.test(state)) return new Response('Неверный запрос', { status: 400 })
  const raw = await kvGet(`xfer-state:${state}`)
  await kvDel(`xfer-state:${state}`)
  const st = raw ? (JSON.parse(raw) as { id: string; exp: number }) : null
  const t = st && st.exp > Date.now() ? await getTransfer(st.id) : null
  if (!t || !code) return new Response('Вход устарел — начните со ссылки ещё раз', { status: 400 })
  const back = `/transfer/${await linkOf(t)}`
  try {
    const token = await exchangeCode(code)
    const u = await githubUser(token)
    if (missingScopes(u).length) throw new Error('GitHub выдал не все права')
    t.gh = { token: await sealKey(token), login: u.login }
    await saveTransfer(t)
    return Response.redirect(new URL(back, url).toString(), 302)
  } catch (e) {
    return Response.redirect(new URL(`${back}?gh=${encodeURIComponent(e instanceof Error ? e.message : 'ошибка')}`, url).toString(), 302)
  }
}
