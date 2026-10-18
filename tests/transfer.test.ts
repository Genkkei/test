import { beforeEach, describe, expect, it, vi } from 'vitest'

const kv = new Map<string, string>()
vi.mock('@/lib/kv', () => ({
  kvGet: async (k: string) => kv.get(k) ?? null,
  kvPut: async (k: string, v: string) => void kv.set(k, v),
  kvDel: async (k: string) => void kv.delete(k),
  kvList: async (p: string) => new Map([...kv].filter(([k]) => k.startsWith(p))),
}))
process.env.ADMIN_SECRET = 'test-secret'
const x = await import('@/lib/transfer')

beforeEach(() => kv.clear())

describe('перенос: ссылка для заказчика', () => {
  it('ссылка открывает свой перенос, в базе — только хэш', async () => {
    const { t, link } = await x.createTransfer('sofa', 'Sofa')
    expect((await x.transferByLink(link))?.id).toBe(t.id)
    expect([...kv.keys(), ...kv.values()].join(' ')).not.toContain(link)
  })
  it('чужая или испорченная ссылка — ничего', async () => {
    await x.createTransfer('sofa', 'Sofa')
    expect(await x.transferByLink('A'.repeat(43))).toBeNull()
    expect(await x.transferByLink('../../etc')).toBeNull()
  })
  it('просроченная ссылка не открывается, пока перенос не начат', async () => {
    const { t, link } = await x.createTransfer('sofa', 'Sofa')
    await x.saveTransfer({ ...t, expiresAt: new Date(Date.now() - 1000).toISOString() })
    expect(await x.transferByLink(link)).toBeNull()
  })
  it('ключи заказчика шифруются и не попадают в то, что видит браузер', async () => {
    const { t } = await x.createTransfer('sofa', 'Sofa')
    const full = { ...t, gh: { token: await x.sealKey('ghp_SECRETSECRETSECRETSECRET'), login: 'client' }, cf: { token: await x.sealKey('cf-SECRET-cf-SECRET-cf-SECRET-123'), accountId: 'a', accountName: 'Client', subdomain: 'client' } }
    await x.saveTransfer(full)
    expect([...kv.values()].join(' ')).not.toContain('SECRET')
    expect(JSON.stringify(x.publicView(full))).not.toMatch(/SECRET|v1\./)
    expect(await x.openKey(full.gh.token)).toBe('ghp_SECRETSECRETSECRETSECRET')
  })
  it('удаление убирает и ссылку', async () => {
    const { t, link } = await x.createTransfer('sofa', 'Sofa')
    await x.deleteTransfer(t)
    expect(await x.transferByLink(link)).toBeNull()
    expect(kv.size).toBe(0)
  })
})
