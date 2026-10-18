import { describe, expect, it } from 'vitest'

process.env.ADMIN_SECRET = 'test-secret'
const { sealToken, openToken, webhookSecret } = await import('@/lib/bot')
const TOKEN = '1234567890:' + 'A'.repeat(35)

describe('токен бота в базе', () => {
  it('хранится зашифрованным и расшифровывается', async () => {
    const s = await sealToken(TOKEN)
    expect(s).not.toContain('AAAA')
    expect(s.startsWith('v1.')).toBe(true)
    expect(await openToken(s)).toBe(TOKEN)
  })
  it('каждый раз новый шифртекст', async () => expect(await sealToken(TOKEN)).not.toBe(await sealToken(TOKEN)))
  it('подделанный шифртекст не открывается', async () => {
    const s = await sealToken(TOKEN)
    const bad = s.slice(0, -3) + (s.endsWith('A') ? 'BBB' : 'AAA')
    await expect(openToken(bad)).rejects.toThrow()
  })
  it('старая запись (открытый токен) читается', async () => expect(await openToken(TOKEN)).toBe(TOKEN))
  it('секрет вебхука зависит от токена и не равен ему', () => {
    expect(webhookSecret(TOKEN)).not.toContain(TOKEN)
    expect(webhookSecret(TOKEN)).not.toBe(webhookSecret(TOKEN.replace('A', 'B')))
  })
})
