import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { kvGet, kvPut } from './kv'

/*
 * Два вида входа:
 * - владелец конструктора — пароль ADMIN_PASSWORD, доступ ко всем сайтам (область «*»);
 * - владелец сайта — свой пароль (хэш в хранилище, pass:<slug>), доступ только к своему сайту.
 * Сессия — подписанная кука «область.срок.подпись». На адресе сайта маршрутизатор ставит
 * заголовок x-atlas-site: так админка понимает, чей это сайт, а вход владельца сайта на
 * чужом адресе невозможен — кука живёт на своём домене, а область сверяется с заголовком.
 * В dev без ADMIN_PASSWORD работает «admin»; в продакшене без него вход владельца
 * конструктора закрыт (пароли сайтов работают).
 */

const COOKIE = 'atlas_admin'
const TTL = 60 * 60 * 24 * 30
const LEGACY_UNTIL = Date.parse('2026-10-25T00:00:00Z')

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

/** Сайт, на адресе которого открыта админка (заголовок маршрутизатора), или null — адрес конструктора. */
export async function hostSite(): Promise<string | null> {
  const h = await headers()
  return trustedSite(h.get('x-atlas-site'), h.get('host'), async (slug) => (await import('./store')).getSite(slug).then((x) => x?.domains ?? null))
}

/**
 * Заголовку x-atlas-site верим, только если сам адрес запроса (Host, его снаружи не подделать —
 * по нему Cloudflare выбирает воркер) принадлежит этому сайту: <slug>.<поддомен>.workers.dev или
 * домен из его настроек. Иначе кто угодно прислал бы заголовок прямо конструктору — на его
 * основной адрес или на адреса превью версий — и вошёл бы как «на адресе сайта».
 */
export async function trustedSite(header: string | null, host: string | null, domainsOf: (slug: string) => Promise<string[] | null>): Promise<string | null> {
  if (!header || !host || !/^[a-z0-9-]+$/.test(header)) return null
  const hn = host.toLowerCase().replace(/:\d+$/, '')
  if (hn.startsWith(`${header}.`) && hn.endsWith('.workers.dev') && hn.split('.').length === 4) return header
  const domains = await domainsOf(header)
  return domains?.some((d) => d.toLowerCase() === hn) ? header : null
}

/** Адрес посетителя: Cloudflare ставит cf-connecting-ip сам, подделать его снаружи нельзя (x-forwarded-for — можно). */
export async function clientIp(): Promise<string> {
  const h = await headers()
  return h.get('cf-connecting-ip') || h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
}

// --- пароли сайтов: PBKDF2 через WebCrypto, 100 000 итераций (потолок Workers) ---

const enc = new TextEncoder()
const b64 = (b: ArrayBuffer | Uint8Array) => Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString('base64url')

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as unknown as BufferSource, iterations: 100_000 }, key, 256)
  return b64(bits)
}

export async function setSitePassword(slug: string, password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  await kvPut(`pass:${slug}`, `${b64(salt)}.${await derive(password, salt)}`)
}

export async function hasSitePassword(slug: string): Promise<boolean> {
  return !!(await kvGet(`pass:${slug}`))
}

async function checkSitePassword(slug: string, input: string): Promise<boolean> {
  const stored = await kvGet(`pass:${slug}`)
  if (!stored) return false
  const [salt, hash] = stored.split('.')
  return safeEqual(await derive(input, new Uint8Array(Buffer.from(salt, 'base64url'))), hash)
}

/** Пароль, который легко продиктовать: три слова-слога и цифры. */
export function makePassword(): string {
  const parts = ['ko', 'ra', 'mi', 'ta', 'lu', 'ne', 'so', 'vi', 'da', 'pe', 'zu', 'ba', 'ri', 'go', 'ma', 'ti']
  const r = crypto.getRandomValues(new Uint8Array(8))
  const word = (i: number) => parts[r[i] % 16] + parts[r[i + 1] % 16]
  return `${word(0)}-${word(2)}-${word(4)}-${1000 + ((r[6] * 256 + r[7]) % 9000)}`
}

/** Проверка пароля: на адресе сайта — пароль сайта или общий; на адресе конструктора — только общий. Возвращает область. */
export async function checkLogin(input: string): Promise<string | null> {
  const master = adminPassword()
  // общий пароль можно выключить, когда настроен вход через Google (Настройки → Входы)
  const passwordOn = (await (await import('./settings')).integrations()).passwordLogin
  if (master && passwordOn && safeEqual(sign(input), sign(master))) return '*'
  const site = await hostSite()
  if (site && (await checkSitePassword(site, input))) return site
  return null
}

/**
 * Отпечаток пароля области входит в подпись куки: сменили или сбросили пароль — все прежние
 * сессии этой области перестают действовать сразу, а не через 30 дней. Для общей области «*» —
 * отпечаток ADMIN_PASSWORD.
 */
async function passVersion(scope: string): Promise<string> {
  // для «*» в отпечаток входит и список почт Google: убрали почту из списка — её вход закрыт
  const src = scope === '*' ? `master:${adminPassword() ?? ''}:${(await (await import('./settings')).integrations()).adminEmails.join(',')}` : `site:${(await kvGet(`pass:${scope}`)) ?? ''}`
  return sign(src).slice(0, 12)
}

export async function startSession(scope: string) {
  const exp = String(Math.floor(Date.now() / 1000) + TTL)
  const body = `${scope}.${exp}`
  ;(await cookies()).set(COOKIE, `${body}.${sign(`${body}.${await passVersion(scope)}`)}`, {
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

/** Область текущей сессии: «*» (все сайты), slug или null. */
export async function adminScope(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return null
  const parts = raw.split('.')
  if (parts.length !== 3) return null
  const [scope, exp, sig] = parts
  if (!/^(\*|[a-z0-9-]+)$/.test(scope) || Number(exp) < Date.now() / 1000) return null
  const current = safeEqual(sig, sign(`${scope}.${exp}.${await passVersion(scope)}`))
  // куки старого образца (без отпечатка пароля) принимаем до LEGACY_UNTIL, чтобы смена схемы не
  // выкинула разом всех, кто уже вошёл; после этой даты они недействительны
  const legacy = !current && Date.now() < LEGACY_UNTIL && safeEqual(sig, sign(`${scope}.${exp}`))
  if (!current && !legacy) return null
  // кука владельца сайта годится только на адресе его сайта
  if (scope !== '*' && scope !== (await hostSite())) return null
  return scope
}

export async function isAdmin(): Promise<boolean> {
  return !!(await adminScope())
}

export async function isMaster(): Promise<boolean> {
  return (await adminScope()) === '*'
}

/** Может ли текущая сессия править этот сайт. */
export async function canEdit(slug: string): Promise<boolean> {
  const scope = await adminScope()
  return scope === '*' || scope === slug
}

export async function requireAdmin(): Promise<string> {
  const scope = await adminScope()
  if (!scope) redirect('/admin/login')
  return scope
}

export async function requireSite(slug: string): Promise<string> {
  const scope = await requireAdmin()
  if (scope !== '*' && scope !== slug) redirect(`/admin/sites/${scope}`)
  return scope
}

// Неудачные попытки входа по адресу: 8 за 10 минут, в хранилище — общий счёт для всех изолятов.
// Плюс общий счёт на адрес сайта (60 за 10 минут): перебор с тысячи адресов упрётся в него.
async function fails(key: string): Promise<number[]> {
  return (JSON.parse((await kvGet(key)) || '[]') as number[]).filter((t) => Date.now() - t < 600_000)
}
export async function loginLimited(ip: string): Promise<boolean> {
  if ((await fails(`fail:${ip}`)).length >= 8) return true
  return (await fails(`fail:site:${(await hostSite()) || '*'}`)).length >= 60
}
export async function loginFailed(ip: string) {
  for (const key of [`fail:${ip}`, `fail:site:${(await hostSite()) || '*'}`]) await kvPut(key, JSON.stringify([...(await fails(key)).slice(-80), Date.now()]))
}
