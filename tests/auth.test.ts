import { beforeEach, describe, expect, it, vi } from 'vitest'

// окружение запроса: куки, заголовки и хранилище — в памяти
const jar = new Map<string, string>()
let hdrs = new Headers()
const kv = new Map<string, string>()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (k: string) => (jar.has(k) ? { value: jar.get(k) } : undefined), set: (k: string, v: string) => void jar.set(k, v), delete: (k: string) => void jar.delete(k) }),
  headers: async () => hdrs,
}))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error(`redirect ${u}`) } }))
vi.mock('@/lib/kv', () => ({ kvGet: async (k: string) => kv.get(k) ?? null, kvPut: async (k: string, v: string) => void kv.set(k, v), kvDel: async (k: string) => void kv.delete(k) }))
vi.mock('@/lib/store', () => ({ getSite: async (slug: string) => (slug === 'sofa' ? { domains: ['sofa.genkai.workers.dev', 'sofa.uz'] } : null) }))

process.env.ADMIN_PASSWORD = 'master-pass-123'
process.env.ADMIN_SECRET = 'test-secret'
const auth = await import('@/lib/auth')

const atSite = (host: string, site = 'sofa') => (hdrs = new Headers({ host, 'x-atlas-site': site }))

beforeEach(() => {
  jar.clear()
  kv.clear()
  hdrs = new Headers({ host: 'atlas.genkai.workers.dev' })
})

describe('чей это сайт (x-atlas-site)', () => {
  const domains = async (s: string) => (s === 'sofa' ? ['sofa.uz'] : null)
  it('на адресе конструктора заголовку не верим', async () => expect(await auth.trustedSite('sofa', 'atlas.genkai.workers.dev', domains)).toBeNull())
  it('на адресе превью версии — тоже', async () => expect(await auth.trustedSite('sofa', 'abc123-atlas.genkai.workers.dev', domains)).toBeNull())
  it('на адресе другого сайта — тоже', async () => expect(await auth.trustedSite('sofa', 'kiyim.genkai.workers.dev', domains)).toBeNull())
  it('на вложенном поддомене — тоже', async () => expect(await auth.trustedSite('sofa', 'sofa.evil.genkai.workers.dev', domains)).toBeNull())
  it('на своём адресе workers.dev — верим', async () => expect(await auth.trustedSite('sofa', 'sofa.genkai.workers.dev', domains)).toBe('sofa'))
  it('на своём домене — верим', async () => expect(await auth.trustedSite('sofa', 'SOFA.uz', domains)).toBe('sofa'))
  it('мусор в заголовке — нет', async () => expect(await auth.trustedSite('../x', 'x', domains)).toBeNull())
})

describe('вход и сессии', () => {
  it('без куки — не вошёл', async () => expect(await auth.adminScope()).toBeNull())
  it('общий пароль — область «*»', async () => {
    expect(await auth.checkLogin('master-pass-123')).toBe('*')
    await auth.startSession('*')
    expect(await auth.adminScope()).toBe('*')
  })
  it('неверный пароль — null', async () => expect(await auth.checkLogin('wrong')).toBeNull())
  it('пароль сайта действует только на адресе этого сайта', async () => {
    await auth.setSitePassword('sofa', 'site-pass-1')
    expect(await auth.checkLogin('site-pass-1')).toBeNull()
    atSite('sofa.genkai.workers.dev')
    expect(await auth.checkLogin('site-pass-1')).toBe('sofa')
  })
  it('сессия сайта не действует на адресе конструктора (нельзя поднять себе права)', async () => {
    await auth.setSitePassword('sofa', 'site-pass-1')
    atSite('sofa.genkai.workers.dev')
    await auth.startSession('sofa')
    expect(await auth.adminScope()).toBe('sofa')
    expect(await auth.canEdit('kiyim')).toBe(false)
    hdrs = new Headers({ host: 'atlas.genkai.workers.dev', 'x-atlas-site': 'sofa' })
    expect(await auth.adminScope()).toBeNull()
  })
  it('подмена области в куке ломает подпись', async () => {
    await auth.setSitePassword('sofa', 'site-pass-1')
    atSite('sofa.genkai.workers.dev')
    await auth.startSession('sofa')
    const [, exp, sig] = jar.get('atlas_admin')!.split('.')
    jar.set('atlas_admin', `*.${exp}.${sig}`)
    hdrs = new Headers({ host: 'atlas.genkai.workers.dev' })
    expect(await auth.adminScope()).toBeNull()
  })
  it('смена пароля сайта закрывает прежние сессии', async () => {
    await auth.setSitePassword('sofa', 'site-pass-1')
    atSite('sofa.genkai.workers.dev')
    await auth.startSession('sofa')
    expect(await auth.adminScope()).toBe('sofa')
    await auth.setSitePassword('sofa', 'site-pass-2')
    expect(await auth.adminScope()).toBeNull()
  })
  it('смена общего пароля закрывает сессии владельца', async () => {
    await auth.startSession('*')
    process.env.ADMIN_PASSWORD = 'changed-pass-456'
    expect(await auth.adminScope()).toBeNull()
    process.env.ADMIN_PASSWORD = 'master-pass-123'
  })
  it('просроченная сессия не действует', async () => {
    vi.useFakeTimers()
    await auth.startSession('*')
    vi.setSystemTime(Date.now() + 31 * 24 * 3600 * 1000)
    expect(await auth.adminScope()).toBeNull()
    vi.useRealTimers()
  })
  it('пароль хранится хэшем, не открытым текстом', async () => {
    await auth.setSitePassword('sofa', 'site-pass-1')
    expect(kv.get('pass:sofa')).not.toContain('site-pass-1')
  })
  it('лимит неудачных входов: 8 за 10 минут с адреса', async () => {
    for (let i = 0; i < 8; i++) await auth.loginFailed('1.2.3.4')
    expect(await auth.loginLimited('1.2.3.4')).toBe(true)
    expect(await auth.loginLimited('5.6.7.8')).toBe(false)
  })
})
