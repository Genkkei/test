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

describe('секреты для GitHub (crypto_box_seal)', () => {
  it('libsodium открывает то, что запечатал наш код', async () => {
    const sodium = (await import('libsodium-wrappers')).default
    await sodium.ready
    const kp = sodium.crypto_box_keypair()
    const { sealedBox } = await import('@/lib/seal')
    const sealed = sealedBox('секрет-123', Buffer.from(kp.publicKey).toString('base64'))
    const opened = sodium.crypto_box_seal_open(Buffer.from(sealed, 'base64'), kp.publicKey, kp.privateKey)
    expect(new TextDecoder().decode(opened)).toBe('секрет-123')
  })
  it('цели шифрования разделены', async () => {
    const { seal, unseal } = await import('@/lib/seal')
    const s = await seal('bot-token', 'x')
    await expect(unseal('transfer', s)).rejects.toThrow()
  })
})
