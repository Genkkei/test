import { randomBytes } from 'node:crypto'
import { oauthConfigured } from '@/lib/github'
import { kvPut } from '@/lib/kv'
import { transferByLink } from '@/lib/transfer'

/** «Войти через GitHub» со страницы переноса: состояние запроса хранится 10 минут и одноразово. */
export async function GET(request: Request) {
  const link = new URL(request.url).searchParams.get('link') || ''
  const t = await transferByLink(link)
  if (!t || !(await oauthConfigured())) return new Response('Ссылка недействительна', { status: 404 })
  const state = randomBytes(24).toString('base64url')
  await kvPut(`xfer-state:${state}`, JSON.stringify({ id: t.id, exp: Date.now() + 600_000 }))
  const base = (process.env.ATLAS_URL || '').replace(/\/$/, '')
  const u = new URL('https://github.com/login/oauth/authorize')
  u.searchParams.set('client_id', (await (await import('@/lib/settings')).integrations()).githubClientId)
  u.searchParams.set('redirect_uri', `${base}/api/transfer/github/callback`)
  u.searchParams.set('scope', 'repo workflow')
  u.searchParams.set('state', state)
  u.searchParams.set('allow_signup', 'true')
  return Response.redirect(u.toString(), 302)
}
