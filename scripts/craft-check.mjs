// Уникальность каталога (навык site-craft): у каждого сайта свой шаблон, display-шрифт, раскладка первого
// экрана и ведущий приём движения. Сайт без отпечатка — в списке «нет craft» (пока переделка не закончена,
// это предупреждение; совпадения — ошибка).  node scripts/craft-check.mjs [--strict]
import fs from 'node:fs'
const dir = 'content/sites'
const sites = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')))
const by = (key) => {
  const m = new Map()
  for (const s of sites) {
    const v = key(s)
    if (!v) continue
    m.set(v, [...(m.get(v) || []), s.slug])
  }
  return [...m].filter(([, l]) => l.length > 1)
}
let bad = 0
const report = (title, list) => {
  if (!list.length) return
  bad += list.length
  console.log(`✗ ${title}`)
  for (const [v, l] of list) console.log(`   ${v}: ${l.join(', ')}`)
}
// та же схема, что в src/lib/craft.ts: неверный отпечаток не проходит схему сайта — и сайт отдаёт 404
const word = /^[a-z0-9-]{2,40}$/
const ease = /^-?[0-9.]+,\s*-?[0-9.]+,\s*-?[0-9.]+,\s*-?[0-9.]+$/
const invalid = sites
  .filter((s) => s.craft)
  .map((s) => {
    const c = s.craft
    const why = []
    if (typeof c.concept !== 'string' || c.concept.length < 8 || c.concept.length > 200) why.push(`concept ${c.concept?.length ?? 0} симв. (8–200)`)
    for (const k of ['skeleton', 'signature', 'surface']) if (!word.test(c[k] ?? '')) why.push(`${k} «${c[k]}»`)
    if (!Array.isArray(c.sequence) || c.sequence.length < 2 || c.sequence.length > 8 || !c.sequence.every((x) => word.test(x))) why.push('sequence')
    if (!ease.test(c.ease ?? '')) why.push(`ease «${c.ease}»`)
    return [s.slug, why.join(', ')]
  })
  .filter(([, why]) => why)
report('отпечаток не проходит схему (сайт будет 404)', invalid)
report('один шаблон у нескольких сайтов', by((s) => s.template))
report('один display-шрифт', by((s) => s.theme.display))
report('одна раскладка первого экрана', by((s) => s.craft?.skeleton))
report('один ведущий приём', by((s) => s.craft?.signature))
report('одна пара текст+метки', by((s) => s.craft && `${s.theme.body} + ${s.craft.label}`))
const none = sites.filter((s) => !s.craft).map((s) => s.slug)
console.log(`сайтов: ${sites.length}, с отпечатком: ${sites.length - none.length}`)
if (none.length && process.argv.includes('--strict')) bad += none.length
if (bad) process.exitCode = 1
else console.log('✓ все уникальны')
