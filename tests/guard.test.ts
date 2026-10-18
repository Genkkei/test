import { describe, expect, it } from 'vitest'
import { formRefusal, hitLimit } from '@/lib/guard'

const req = (h: Record<string, string>) => new Request('https://sofa.genkai.workers.dev/api/order', { method: 'POST', headers: h })

describe('формы сайта', () => {
  it('чужой Origin — 403', () => expect(formRefusal(req({ origin: 'https://evil.com', host: 'sofa.genkai.workers.dev' }))?.status).toBe(403))
  it('свой Origin — пропускаем', () => expect(formRefusal(req({ origin: 'https://sofa.genkai.workers.dev', host: 'sofa.genkai.workers.dev' }))).toBeNull())
  it('мусор в Origin — 403', () => expect(formRefusal(req({ origin: 'null', host: 'sofa.genkai.workers.dev' }))?.status).toBe(403))
  it('тело больше 16 КБ — 413', () => expect(formRefusal(req({ 'content-length': '20000' }))?.status).toBe(413))
})

describe('лимиты', () => {
  const mem = () => {
    const m = new Map<string, string>()
    return { get: async (k: string) => m.get(k) ?? null, put: async (k: string, v: string) => void m.set(k, v), m }
  }
  it('пятая попытка проходит, шестая — нет', async () => {
    const s = mem()
    for (let i = 0; i < 5; i++) expect(await hitLimit(s, 'k', 5, 1000, 100)).toBe(false)
    expect(await hitLimit(s, 'k', 5, 1000, 100)).toBe(true)
  })
  it('окно сдвигается', async () => {
    const s = mem()
    for (let i = 0; i < 5; i++) await hitLimit(s, 'k', 5, 1000, 100)
    expect(await hitLimit(s, 'k', 5, 1000, 1200)).toBe(false)
  })
  it('испорченная запись в хранилище не отключает лимит', async () => {
    const s = mem()
    s.m.set('k', '{"oops":1}')
    expect(await hitLimit(s, 'k', 1, 1000, 1)).toBe(false)
    expect(await hitLimit(s, 'k', 1, 1000, 2)).toBe(true)
  })
})
