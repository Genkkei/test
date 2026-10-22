// Маршрутизатор сайта: воркер с именем = slug живёт на <slug>.genkai.workers.dev (или на домене
// заказчика) и передаёт запросы конструктору Atlas по service binding — без выхода в интернет.
// Адреса сайта остаются «чистыми»: / и /uz/ снаружи, /<slug> и /<slug>/uz внутри конструктора.
//
// Конструктору уходят:
// - x-atlas-site: чей это сайт — по нему админка пускает владельца только в свой сайт;
// - Host — адрес, на который пришёл запрос, чтобы canonical и проверка Origin у серверных
//   действий видели настоящий домен.

const FILES = {
  '/og.png': '/opengraph-image',
  '/icon.png': '/icon',
  '/llms.txt': '/llms.txt',
  '/llms-full.txt': '/llms-full.txt',
  '/sitemap.xml': '/sitemap.xml',
  '/robots.txt': '/robots.txt',
}
const PASS = ['/_next/', '/tpl/', '/admin', '/api/', '/media/', '/favicon.ico']

// Кэш страниц (KV PAGES, если привязан). Конструктор собирает страницу на каждый запрос — 0,5–2 с до
// первого байта; маршрутизатор отдаёт готовую из KV сразу, а не старше FRESH — обновляет в фоне
// (stale-while-revalidate). Конструктор при сохранении в админке стирает ключи сайта — правка видна сразу.
// Мимо кэша: не GET, служебные пути, вход в админку (кука atlas_admin), не 200 и не HTML.
const FRESH = 60 * 1000
const KEEP = 7 * 24 * 3600
const pageKey = (slug, url) => `${slug}:${url.pathname}${url.search}`
const cacheable = (request, path) =>
  request.method === 'GET' &&
  !PASS.some((p) => path === p || path.startsWith(p)) &&
  !request.headers.has('rsc') && // переходы внутри Next просят не HTML, а данные страницы
  !(request.headers.get('cookie') || '').includes('atlas_admin=')
// заголовки безопасности страницы хранятся вместе с ней (метаданные KV — до 1 КБ)
const KEPT = ['content-security-policy', 'strict-transport-security', 'cross-origin-opener-policy', 'permissions-policy', 'referrer-policy', 'x-content-type-options', 'x-frame-options']

function target(path, slug) {
  if (PASS.some((p) => path === p || path.startsWith(p))) return path
  if (FILES[path]) return `/${slug}${FILES[path]}`
  if (path === `/${slug}` || path.startsWith(`/${slug}/`)) return path
  if (path === '/') return `/${slug}`
  return `/${slug}${path.replace(/\/$/, '')}`
}

// /<slug> → /, /<slug>/uz → /uz/, /<slug>/x → /x — ссылки в HTML смотрят на адрес сайта, а не конструктора
function outward(href, slug) {
  if (!href || !href.startsWith(`/${slug}`)) return null
  const rest = href.slice(slug.length + 1)
  if (rest === '' || rest.startsWith('?') || rest.startsWith('#')) return `/${rest}`
  if (!rest.startsWith('/')) return null
  const m = rest.match(/^\/(uz|en|ru)(\/?)([?#].*)?$/)
  if (m) return `/${m[1]}/${m[3] || ''}`
  return rest
}

class Links {
  constructor(slug, attr) {
    this.slug = slug
    this.attr = attr
  }
  element(el) {
    const v = el.getAttribute(this.attr)
    const out = outward(v, this.slug)
    if (out != null) el.setAttribute(this.attr, out)
  }
}

async function render(request, env, url, slug) {
  const inner = new URL(target(url.pathname, slug) + url.search, url.origin)
  const headers = new Headers(request.headers)
  headers.set('x-atlas-site', slug)
  headers.set('x-forwarded-host', url.host)
  headers.set('x-forwarded-proto', 'https')
  const res = await env.ATLAS.fetch(new Request(inner, { method: request.method, headers, body: request.body, redirect: 'manual' }))

  const out = new Response(res.body, res)
  const loc = out.headers.get('location')
  if (loc) {
    const fixed = outward(loc.replace(/^https?:\/\/[^/]+/, ''), slug)
    if (fixed != null) out.headers.set('location', fixed)
  }
  // файлы сборки с хэшем в имени не меняются никогда — браузер не переспрашивает их на каждом заходе
  if ((url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/tpl/')) && out.status === 200) out.headers.set('cache-control', 'public, max-age=31536000, immutable')
  if (!(out.headers.get('content-type') || '').includes('text/html')) return out
  return new HTMLRewriter()
    .on('a[href]', new Links(slug, 'href'))
    .on('link[href]', new Links(slug, 'href'))
    .on('form[action]', new Links(slug, 'action'))
    .on('iframe[src]', new Links(slug, 'src'))
    .transform(out)
}

const BASE = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' }

async function store(env, key, res) {
  const html = await res.text()
  const h = Object.fromEntries(KEPT.filter((k) => res.headers.has(k)).map((k) => [k, res.headers.get(k)]))
  await env.PAGES.put(key, html, { expirationTtl: KEEP, metadata: { t: Date.now(), h } })
  return { html, h }
}
const page = (html, h, state) => new Response(html, { headers: { ...BASE, ...h, 'x-atlas-cache': state } })

export default {
  async fetch(request, env, ctx) {
    const slug = env.SITE
    const url = new URL(request.url)
    if (!env.PAGES || !cacheable(request, url.pathname)) return render(request, env, url, slug)

    const key = pageKey(slug, url)
    const hit = await env.PAGES.getWithMetadata(key).catch(() => null)
    if (hit?.value) {
      if (Date.now() - (hit.metadata?.t || 0) > FRESH)
        ctx.waitUntil(
          render(request.clone(), env, url, slug)
            .then((r) => (r.status === 200 && (r.headers.get('content-type') || '').includes('text/html') ? store(env, key, r) : null))
            .catch(() => {}),
        )
      return page(hit.value, hit.metadata?.h || {}, 'hit')
    }
    const res = await render(request, env, url, slug)
    if (res.status !== 200 || !(res.headers.get('content-type') || '').includes('text/html')) return res
    const saved = await store(env, key, res).catch(() => null)
    if (!saved) return render(request, env, url, slug)
    return page(saved.html, saved.h, 'miss')
  },
}
