import { describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { buildClientProject } from '@/lib/export'

describe('проект для заказчика', async () => {
  const p = await buildClientProject('loftmebel')
  const paths = Object.keys(p.files)
  it('только его сайт', () => {
    expect(paths.filter((f) => f.startsWith('content/sites/') && f.endsWith('.json')).every((f) => f.includes('loftmebel'))).toBe(true)
  })
  it('только его шаблон и зависимости', () => {
    const tpls = new Set(paths.filter((f) => f.startsWith('src/templates/') && f.split('/').length > 3).map((f) => f.split('/')[2]))
    expect(tpls.size).toBeLessThanOrEqual(2)
  })
  it('без наших документов, тестов, отчётов и секретов', () => {
    expect(paths.some((f) => /^(docs|security|tests)\//.test(f))).toBe(false)
    expect(paths.some((f) => /\.env$|\.dev\.vars$/.test(f))).toBe(false)
    expect(JSON.stringify(p.files)).not.toMatch(/(ADMIN_PASSWORD|ADMIN_SECRET|CF_API_TOKEN|CLOUDFLARE_API_TOKEN)=[A-Za-z0-9_-]{6,}/)
  })
  it('есть выкладка и инструкция', () => {
    expect(paths).toContain('.github/workflows/deploy.yml')
    expect(paths).toContain('scripts/client-deploy.mjs')
    expect(paths).toContain('atlas.client.json')
  })
  it('сайт не помечен как демо из каталога', () => {
    expect(JSON.parse(p.files['content/sites/loftmebel.json'] as string).listing.forSale).toBe(false)
  })
  if (process.env.EXPORT_DIR) {
    it('выгрузка на диск', () => {
      const dir = process.env.EXPORT_DIR!
      rmSync(dir, { recursive: true, force: true })
      for (const [f, v] of Object.entries(p.files)) {
        mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
        writeFileSync(path.join(dir, f), typeof v === 'string' ? v : Buffer.from(v.b64, 'base64'))
      }
    })
  }
})

describe('реестры шаблонов в проекте', async () => {
  const p = await buildClientProject('sofa')
  it('импорт типов сохраняется, чужие шаблоны убраны', () => {
    const reg = p.files['src/templates/registry.ts'] as string
    expect(reg).toMatch(/from '\.\/types'/)
    expect(reg).toMatch(/import \{ template as sofa \} from '\.\/sofa'/)
    expect(reg).not.toMatch(/from '\.\/silk'/)
    expect(reg).toMatch(/TemplateDef\[\] = \[sofa\]/)
  })
})
