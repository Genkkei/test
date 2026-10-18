import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { kvDel, kvGet, kvPut } from './kv'
import { atlasBase, integrations } from './settings'

/*
 * Вход в админку конструктора через Google (OpenID Connect, код + PKCE). Пускаем только почты из списка
 * «кто может входить через Google» и только подтверждённые Google. Токен приходит напрямую от Google по
 * TLS в обмен на одноразовый код — его поля проверяем (выдатель, кому выдан, срок, nonce).
 */

const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN = 'https://oauth2.googleapis.com/token'

export const googleCallback = () => `${atlasBase()}/api/auth/google/callback`

export async function googleConfigured(): Promise<boolean> {
  const i = await integrations()
  return !!(i.googleClientId && i.googleClientSecret && i.adminEmails.length && atlasBase().startsWith('https://'))
}

export async function googleStart(): Promise<string> {
  const i = await integrations()
  const state = randomBytes(24).toString('base64url')
  const verifier = randomBytes(32).toString('base64url')
  const nonce = randomBytes(16).toString('base64url')
  await kvPut(`gstate:${state}`, JSON.stringify({ verifier, nonce, exp: Date.now() + 600_000 }))
  const u = new URL(AUTH)
  u.searchParams.set('client_id', i.googleClientId)
  u.searchParams.set('redirect_uri', googleCallback())
  u.searchParams.set('response_type', 'code')
  u.searchParams.set('scope', 'openid email')
  u.searchParams.set('state', state)
  u.searchParams.set('nonce', nonce)
  u.searchParams.set('code_challenge', createHash('sha256').update(verifier).digest('base64url'))
  u.searchParams.set('code_challenge_method', 'S256')
  u.searchParams.set('prompt', 'select_account')
  return u.toString()
}

/** Почта, которой разрешён вход, или ошибка с понятным текстом. */
export async function googleFinish(state: string, code: string): Promise<string> {
  if (!/^[A-Za-z0-9_-]{32}$/.test(state) || !code) throw new Error('Неверный ответ Google')
  const raw = await kvGet(`gstate:${state}`)
  await kvDel(`gstate:${state}`)
  const st = raw ? (JSON.parse(raw) as { verifier: string; nonce: string; exp: number }) : null
  if (!st || st.exp < Date.now()) throw new Error('Вход устарел — нажмите «Войти через Google» ещё раз')
  const i = await integrations()
  const res = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: i.googleClientId, client_secret: i.googleClientSecret, redirect_uri: googleCallback(), grant_type: 'authorization_code', code_verifier: st.verifier }),
  })
  const tok = (await res.json().catch(() => null)) as { id_token?: string; error_description?: string } | null
  if (!tok?.id_token) throw new Error(tok?.error_description || 'Google не подтвердил вход')
  const claims = idClaims(tok.id_token)
  const problem = checkClaims(claims, { aud: i.googleClientId, nonce: st.nonce, now: Date.now() / 1000 })
  if (problem) throw new Error(problem)
  const email = String(claims.email).toLowerCase()
  if (!i.adminEmails.includes(email)) throw new Error(`Почте ${email} вход в админку не разрешён`)
  return email
}

export function idClaims(jwt: string): Record<string, unknown> {
  const part = jwt.split('.')[1]
  if (!part) throw new Error('Неверный ответ Google')
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
}

/** Проверка полей id_token: null — всё верно, иначе — что не так. */
export function checkClaims(c: Record<string, unknown>, want: { aud: string; nonce: string; now: number }): string | null {
  if (c.iss !== 'https://accounts.google.com' && c.iss !== 'accounts.google.com') return 'Токен выдан не Google'
  if (c.aud !== want.aud) return 'Токен выдан другому приложению'
  if (typeof c.exp !== 'number' || c.exp < want.now) return 'Токен Google истёк'
  if (c.nonce !== want.nonce) return 'Ответ Google не к этому входу'
  if (c.email_verified !== true || typeof c.email !== 'string') return 'Почта в Google не подтверждена'
  return null
}
