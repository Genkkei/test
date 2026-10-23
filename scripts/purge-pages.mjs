// Стирает кэш готовых страниц (KV ATLAS_PAGES) у всех сайтов — после каждой выкладки конструктора:
// в кэше лежит HTML со ссылками на файлы прежней сборки, которых в новой версии уже нет.
//   node scripts/purge-pages.mjs            # все сайты
//   node scripts/purge-pages.mjs forno nord # выбранные
const NS = '853cb4952bfb433e8740a3261abf2b7f'
const ACC = process.env.CLOUDFLARE_ACCOUNT_ID || 'b19fb6e4449b69192095103413f15b31'
const TOKEN = process.env.CLOUDFLARE_API_TOKEN
if (!TOKEN) throw new Error('нужен CLOUDFLARE_API_TOKEN')
const api = (p, init = {}) =>
  fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/storage/kv/namespaces/${NS}${p}`, { ...init, headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', ...(init.headers || {}) } }).then((r) => r.json())
const only = process.argv.slice(2)
let keys = []
let cursor = ''
do {
  const r = await api(`/keys?limit=1000${cursor ? `&cursor=${cursor}` : ''}`)
  keys.push(...r.result.map((k) => k.name))
  cursor = r.result_info?.cursor || ''
} while (cursor)
if (only.length) keys = keys.filter((k) => only.some((s) => k.startsWith(`${s}:`)))
for (let i = 0; i < keys.length; i += 5000) await api('/bulk/delete', { method: 'POST', body: JSON.stringify(keys.slice(i, i + 5000)) })
console.log(`кэш страниц: стёрто ${keys.length}`)
