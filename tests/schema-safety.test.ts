import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { siteSchema } from '@/lib/schema'

const base = JSON.parse(readFileSync('content/sites/sofa.json', 'utf8'))

const withCta = (href: string) => siteSchema.parse({ ...base, nav: { cta: { label: 'x', href } } }).nav.cta.href

describe('ссылки из админки', () => {
  it.each(['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'data:text/html,<script>', 'vbscript:x', '//evil.com/x', 'file:///etc/passwd'])('опасная %s обнуляется', (h) => {
    expect(withCta(h)).toBe('')
  })
  it.each(['https://t.me/x', 'http://a.uz', 'tel:+998901234567', 'mailto:a@b.uz', '#order', '/uz/', '?q=1', 'tg://resolve?domain=x'])('безопасная %s остаётся', (h) => {
    expect(withCta(h)).toBe(h)
  })
  it('соцсети тоже проверяются', () => {
    const s = siteSchema.parse({ ...base, business: { ...base.business, socials: [{ name: 'x', url: 'javascript:alert(1)' }] } })
    expect(s.business.socials[0].url).toBe('')
  })
  it('картинка: data:image можно, data:text/html и javascript: — нет', () => {
    const img = (image: string) => siteSchema.parse({ ...base, seo: { ...base.seo, ogImage: image } }).seo.ogImage
    expect(img('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
    expect(img('data:text/html;base64,AAAA')).toBe('')
    expect(img('javascript:alert(1)')).toBe('')
    expect(img('https://x.uz/a.jpg')).toBe('https://x.uz/a.jpg')
  })
})

describe('данные всех сайтов', () => {
  const files = readdirSync('content/sites').filter((f) => f.endsWith('.json'))
  it('найдено больше 100 сайтов', () => expect(files.length).toBeGreaterThan(100))
  it.each(files)('%s проходит схему и не теряет ссылок при проверке', (f) => {
    const raw = JSON.parse(readFileSync(`content/sites/${f}`, 'utf8'))
    const parsed = siteSchema.parse(raw)
    expect(parsed.slug).toMatch(/^[a-z0-9-]+$/)
    expect(JSON.stringify(parsed.nav)).toBe(JSON.stringify(siteSchema.shape.nav.parse(raw.nav)))
  })
})
