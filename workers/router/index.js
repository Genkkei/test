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
const PASS = ['/_next/', '/admin', '/api/', '/media/', '/favicon.ico']

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

export default {
  async fetch(request, env) {
    const slug = env.SITE
    const url = new URL(request.url)
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
    if (!(out.headers.get('content-type') || '').includes('text/html')) return out
    return new HTMLRewriter()
      .on('a[href]', new Links(slug, 'href'))
      .on('link[href]', new Links(slug, 'href'))
      .on('form[action]', new Links(slug, 'action'))
      .on('iframe[src]', new Links(slug, 'src'))
      .transform(out)
  },
}
