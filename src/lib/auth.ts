import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/*
 * Один пароль владельца (ADMIN_PASSWORD), сессия — подписанная кука «срок.подпись».
 * В dev без пароля работает «admin», в продакшене без пароля админка закрыта:
 * лучше закрытая админка, чем открытая с паролем по умолчанию.
 */

const COOKIE = 'atlas_admin'
const TTL = 60 * 60 * 24 * 7

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD
  return process.env.NODE_ENV === 'production' ? null : 'admin'
}

function secret(): string {
  return process.env.ADMIN_SECRET || `atlas:${adminPassword() ?? 'closed'}`
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function checkPassword(input: string): boolean {
  const pass = adminPassword()
  return !!pass && safeEqual(sign(input), sign(pass))
}

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + TTL)
  ;(await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL,
  })
}

export async function endSession() {
  ;(await cookies()).delete(COOKIE)
}

export async function isAdmin(): Promise<boolean> {
  if (!adminPassword()) return false
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return false
  const [exp, sig] = raw.split('.')
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false
  return Number(exp) > Date.now() / 1000
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}

// Неудачные попытки входа по адресу: 8 за 10 минут. В памяти процесса — для одного сервера достаточно.
const attempts = new Map<string, number[]>()
export function loginLimited(ip: string): boolean {
  const now = Date.now()
  const list = (attempts.get(ip) || []).filter((t) => now - t < 600_000)
  attempts.set(ip, list)
  return list.length >= 8
}
export function loginFailed(ip: string) {
  attempts.set(ip, [...(attempts.get(ip) || []), Date.now()])
}
