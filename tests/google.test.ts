import { describe, expect, it, vi } from 'vitest'

const kv = new Map<string, string>()
vi.mock('@/lib/kv', () => ({ kvGet: async (k: string) => kv.get(k) ?? null, kvPut: async (k: string, v: string) => void kv.set(k, v), kvDel: async (k: string) => void kv.delete(k) }))
process.env.ADMIN_SECRET = 'test-secret'
const { checkClaims, idClaims, googleStart } = await import('@/lib/google')
const { saveIntegrations, integrations, integrationsView } = await import('@/lib/settings')

const ok = { iss: 'https://accounts.google.com', aud: 'cid', exp: 2e9, nonce: 'n1', email: 'a@gmail.com', email_verified: true }
const want = { aud: 'cid', nonce: 'n1', now: 1.9e9 }

describe('проверка токена Google', () => {
  it('правильный — проходит', () => expect(checkClaims(ok, want)).toBeNull())
  it.each([
    ['чужой выдатель', { iss: 'https://evil.com' }],
    ['другое приложение', { aud: 'other' }],
    ['истёк', { exp: 1.8e9 }],
    ['чужой nonce', { nonce: 'n2' }],
    ['почта не подтверждена', { email_verified: false }],
  ])('%s — отказ', (_, patch) => expect(checkClaims({ ...ok, ...patch }, want)).not.toBeNull())
  it('разбор id_token', () => {
    const jwt = `x.${Buffer.from(JSON.stringify(ok)).toString('base64url')}.y`
    expect(idClaims(jwt).email).toBe('a@gmail.com')
  })
})

describe('настройки входов', () => {
  it('секреты хранятся зашифрованными и наружу не отдаются', async () => {
    await saveIntegrations({ googleClientId: '1-a.apps.googleusercontent.com', googleClientSecret: 'GOCSPX-supersecret', adminEmails: ['A@Gmail.com', 'не почта'] })
    expect([...kv.values()].join(' ')).not.toContain('supersecret')
    expect((await integrations()).googleClientSecret).toBe('GOCSPX-supersecret')
    expect((await integrations()).adminEmails).toEqual(['a@gmail.com'])
    expect(JSON.stringify(await integrationsView())).not.toContain('supersecret')
  })
  it('пустой секрет при сохранении не стирает прежний', async () => {
    await saveIntegrations({ googleClientSecret: '' })
    expect((await integrations()).googleClientSecret).toBe('GOCSPX-supersecret')
  })
  it('вход через Google: PKCE и одноразовое состояние', async () => {
    process.env.ATLAS_URL = 'https://atlas.example.dev'
    const u = new URL(await googleStart())
    expect(u.searchParams.get('code_challenge_method')).toBe('S256')
    expect(u.searchParams.get('redirect_uri')).toBe('https://atlas.example.dev/api/auth/google/callback')
    expect(kv.has(`gstate:${u.searchParams.get('state')}`)).toBe(true)
  })
})
