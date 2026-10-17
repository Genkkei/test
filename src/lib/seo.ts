import type { Metadata } from 'next'
import type { Section, SectionOf, Site } from './schema'
import { HREFLANG, OG_LOCALE, pick } from './i18n'

/*
 * SEO, AEO и GEO собираются из одних и тех же данных сайта:
 * метаданные, JSON-LD, сводка-ответ и llms.txt не могут разойтись между собой,
 * потому что ни одна из этих строк не пишется руками отдельно.
 */

export const PLATFORM_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/** Корень сайта: свой домен, если привязан, иначе путь внутри конструктора. */
export function siteRoot(site: Site): string {
  const domain = site.domains[0]
  return domain ? `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : `${PLATFORM_URL}/${site.slug}`
}

/** Основной язык сайта (у языковой версии — язык оригинала). */
export function primaryLang(site: Site): string {
  return site.baseLang ?? site.lang
}

/** Адрес сайта на языке lang: основной язык — в корне, остальные — /uz, /en. */
export function langUrl(site: Site, lang: string): string {
  if (lang === primaryLang(site)) return siteRoot(site)
  // на своём домене версия лежит папкой (/uz/ — так её отдаёт статический хостинг), в конструкторе — /<slug>/uz
  return site.domains[0] ? `${siteRoot(site)}/${lang}/` : `${siteRoot(site)}/${lang}`
}

/** Публичный адрес этой версии сайта (с учётом её языка). */
export function siteUrl(site: Site): string {
  return langUrl(site, site.lang)
}

/**
 * Адрес служебного файла сайта. На своём домене файлы лежат в корне (/og.png, /llms.txt) —
 * так их отдаёт и статическая выгрузка, и proxy конструктора; без домена — путь внутри конструктора.
 */
export function siteAsset(site: Site, file: 'og' | 'icon' | 'llms' | 'llms-full'): string {
  const own = { og: 'og.png', icon: 'icon.png', llms: 'llms.txt', 'llms-full': 'llms-full.txt' }[file]
  const inside = { og: 'opengraph-image', icon: 'icon', llms: 'llms.txt', 'llms-full': 'llms-full.txt' }[file]
  return site.domains[0] ? `${siteRoot(site)}/${own}` : `${PLATFORM_URL}/${site.slug}/${inside}`
}

export function sectionsOf<T extends Section['type']>(site: Site, type: T): SectionOf<T>[] {
  return site.sections.filter((s): s is SectionOf<T> => s.type === type && s.enabled)
}

export function firstOf<T extends Section['type']>(site: Site, type: T): SectionOf<T> | undefined {
  return sectionsOf(site, type)[0]
}

export function seoTitle(site: Site): string {
  return site.seo.title || [site.name, site.tagline].filter(Boolean).join(' — ')
}

export function seoDescription(site: Site): string {
  if (site.seo.description) return site.seo.description
  const hero = firstOf(site, 'hero')
  return clip(site.seo.answer || hero?.subtitle || site.tagline, 158)
}

export function clip(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`
}

export function buildMetadata(site: Site, langs: string[] = [site.lang]): Metadata {
  const url = siteUrl(site)
  const title = seoTitle(site)
  const description = seoDescription(site)
  const images = site.seo.ogImage ? [site.seo.ogImage] : [siteAsset(site, 'og')]
  return {
    metadataBase: new URL(url),
    title: { absolute: title },
    description,
    keywords: site.seo.keywords,
    alternates: {
      canonical: url,
      languages: langs.length > 1 ? { ...Object.fromEntries(langs.map((l) => [HREFLANG[l] ?? l, langUrl(site, l)])), 'x-default': langUrl(site, primaryLang(site)) } : undefined,
    },
    robots: site.seo.index ? { index: true, follow: true, 'max-image-preview': 'large' } : { index: false, follow: false },
    openGraph: { type: 'website', url, title, description, siteName: site.name, locale: OG_LOCALE[site.lang] ?? site.lang, alternateLocale: langs.filter((l) => l !== site.lang).map((l) => OG_LOCALE[l] ?? l), images },
    twitter: { card: 'summary_large_image', title, description, images },
    // без своего домена — относительный путь: иконка грузится с того же сервера, на каком порту он ни был
    icons: { icon: site.domains[0] ? siteAsset(site, 'icon') : `/${site.slug}/icon` },
    other: { 'llms-txt': siteAsset(site, 'llms') },
  }
}

function postalAddress(site: Site) {
  const b = site.business
  if (!b.street && !b.city) return undefined
  return {
    '@type': 'PostalAddress',
    streetAddress: b.street || undefined,
    addressLocality: b.city || undefined,
    addressRegion: b.region || undefined,
    postalCode: b.postalCode || undefined,
    addressCountry: b.country || undefined,
  }
}

/** Граф JSON-LD: организация нужного типа + сайт + FAQ + услуги/меню/цены + хлебные крошки. */
export function buildJsonLd(site: Site): object {
  const url = siteUrl(site)
  const b = site.business
  const orgId = `${url}#org`
  const isLocal = b.type !== 'Organization' && b.type !== 'SoftwareCompany'
  const graph: object[] = []

  const services = sectionsOf(site, 'services').flatMap((s) => s.items)
  const pricing = sectionsOf(site, 'pricing').flatMap((s) => s.items)
  const menus = sectionsOf(site, 'menu')
  const faqs = sectionsOf(site, 'faq').flatMap((s) => s.items).filter((f) => f.q && f.a)
  const reviews = sectionsOf(site, 'testimonials').flatMap((s) => s.items).filter((r) => r.quote && r.author)

  const org: Record<string, unknown> = {
    '@type': b.type === 'SoftwareCompany' ? 'Organization' : b.type,
    '@id': orgId,
    name: site.name,
    legalName: b.legalName || undefined,
    description: seoDescription(site),
    slogan: site.tagline || undefined,
    url,
    image: siteAsset(site, 'og'),
    logo: siteAsset(site, 'icon'),
    telephone: b.phone || undefined,
    email: b.email || undefined,
    foundingDate: b.founded || undefined,
    areaServed: b.areaServed || undefined,
    sameAs: b.socials.map((s) => s.url).filter(Boolean),
    knowsAbout: site.seo.keywords.length ? site.seo.keywords : undefined,
  }
  if (isLocal) {
    org.address = postalAddress(site)
    org.priceRange = b.priceRange || undefined
    if (b.hours.length) org.openingHours = b.hours
    if (b.lat && b.lng) org.geo = { '@type': 'GeoCoordinates', latitude: Number(b.lat), longitude: Number(b.lng) }
    if (b.street || b.city) org.hasMap = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([b.street, b.city].filter(Boolean).join(', '))}`
  }
  if (services.length || pricing.length) {
    org.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: firstOf(site, 'services')?.title || pick(site.lang, { ru: 'Услуги', uz: 'Xizmatlar', en: 'Services' }),
      itemListElement: [
        ...services.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, description: s.text || undefined },
          ...priceSpec(s.price),
        })),
        ...pricing.map((p) => ({
          '@type': 'Offer',
          name: p.name,
          description: p.features.join('; ') || undefined,
          ...priceSpec(p.price),
        })),
      ],
    }
  }
  // Отзывы без рейтинга: выдуманные звёзды нарушают правила структурированных данных
  if (reviews.length) {
    org.review = reviews.map((r) => ({ '@type': 'Review', reviewBody: r.quote, author: { '@type': 'Person', name: r.author } }))
  }
  if (menus.length && ['Restaurant', 'Bakery', 'CafeOrCoffeeShop'].includes(b.type)) {
    org.hasMenu = {
      '@type': 'Menu',
      name: menus[0].title || pick(site.lang, { ru: 'Меню', uz: 'Menyu', en: 'Menu' }),
      hasMenuSection: menus.flatMap((m) =>
        m.groups.map((g) => ({
          '@type': 'MenuSection',
          name: g.name,
          hasMenuItem: g.items.map((i) => ({ '@type': 'MenuItem', name: i.name, description: i.text || undefined, ...priceSpec(i.price) })),
        })),
      ),
    }
  }
  graph.push(org)

  graph.push({
    '@type': 'WebSite',
    '@id': `${url}#website`,
    url,
    name: site.name,
    inLanguage: site.lang,
    publisher: { '@id': orgId },
  })

  graph.push({
    '@type': 'WebPage',
    '@id': `${url}#page`,
    url,
    name: seoTitle(site),
    description: seoDescription(site),
    isPartOf: { '@id': `${url}#website` },
    about: { '@id': orgId },
    inLanguage: site.lang,
    dateModified: site.updatedAt || undefined,
    // голосовые ассистенты читают сводку и заголовок
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]', 'h1'] },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: site.name, item: url }],
    },
  })

  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })
  }

  const steps = sectionsOf(site, 'process')[0]
  if (steps?.items.length) {
    graph.push({
      '@type': 'HowTo',
      name: steps.title || `${pick(site.lang, { ru: 'Как мы работаем', uz: 'Qanday ishlaymiz', en: 'How we work' })} — ${site.name}`,
      step: steps.items.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': strip(graph) }
}

/** «от 450 000 сум» → число и валюта; если цену не разобрать — без priceSpecification. */
function priceSpec(price: string) {
  const digits = price.replace(/[^\d]/g, '')
  if (!digits) return {}
  const currency = /\$|usd/i.test(price) ? 'USD' : /€|eur/i.test(price) ? 'EUR' : 'UZS'
  return { price: Number(digits), priceCurrency: currency }
}

function strip<T>(value: T): T {
  if (Array.isArray(value)) return value.map(strip).filter((v) => v !== undefined) as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const s = strip(v)
      if (s === undefined || s === '' || (Array.isArray(s) && s.length === 0)) continue
      out[k] = s
    }
    return out as T
  }
  return value
}

/** GEO: сводка для генеративных движков. Собирается из данных, а не пишется руками. */
export function buildLlms(site: Site, full: boolean): string {
  const b = site.business
  const lines: string[] = [`# ${site.name}`, '', `> ${site.seo.answer || seoDescription(site)}`, '']
  const facts = [
    site.niche && `Сфера: ${site.niche}`,
    b.city && `Город: ${[b.city, b.country].filter(Boolean).join(', ')}`,
    b.street && `Адрес: ${b.street}`,
    b.phone && `Телефон: ${b.phone}`,
    b.email && `Почта: ${b.email}`,
    b.hours.length && `Часы работы: ${b.hours.join('; ')}`,
    b.priceRange && `Ценовой уровень: ${b.priceRange}`,
    `Сайт: ${siteUrl(site)}`,
  ].filter(Boolean)
  lines.push('## Факты', '', ...facts.map((f) => `- ${f}`), '')

  for (const s of site.sections.filter((x) => x.enabled)) {
    const title = s.title || s.label
    switch (s.type) {
      case 'about':
        if (full && s.text) lines.push(`## ${title || pick(site.lang, { ru: 'О компании', uz: 'Kompaniya haqida', en: 'About' })}`, '', s.text, '')
        break
      case 'services':
        if (s.items.length) lines.push(`## ${title || pick(site.lang, { ru: 'Услуги', uz: 'Xizmatlar', en: 'Services' })}`, '', ...s.items.map((i) => `- ${i.title}${i.price ? ` — ${i.price}` : ''}${full && i.text ? `: ${i.text}` : ''}`), '')
        break
      case 'pricing':
        if (s.items.length) lines.push(`## ${title || pick(site.lang, { ru: 'Цены', uz: 'Narxlar', en: 'Prices' })}`, '', ...s.items.map((i) => `- ${i.name}: ${i.price} ${i.period}${full ? ` (${i.features.join(', ')})` : ''}`), '')
        break
      case 'menu':
        for (const g of s.groups) lines.push(`## ${g.name}`, '', ...g.items.map((i) => `- ${i.name}${i.price ? ` — ${i.price}` : ''}${full && i.text ? `: ${i.text}` : ''}`), '')
        break
      case 'works':
        if (full && s.items.length) lines.push(`## ${title || pick(site.lang, { ru: 'Работы', uz: 'Ishlar', en: 'Work' })}`, '', ...s.items.map((i) => `- ${i.title} (${[i.category, i.year].filter(Boolean).join(', ')})${i.text ? `: ${i.text}` : ''}`), '')
        break
      case 'process':
        if (full && s.items.length) lines.push(`## ${title || pick(site.lang, { ru: 'Как мы работаем', uz: 'Qanday ishlaymiz', en: 'How we work' })}`, '', ...s.items.map((i, n) => `${n + 1}. ${i.title} — ${i.text}`), '')
        break
      case 'faq':
        if (s.items.length) lines.push(`## ${title || pick(site.lang, { ru: 'Частые вопросы', uz: 'Ko‘p so‘raladigan savollar', en: 'FAQ' })}`, '', ...s.items.flatMap((i) => [`### ${i.q}`, '', i.a, '']))
        break
    }
  }
  if (!full) lines.push('## Подробнее', '', `- [Полная версия](${siteAsset(site, 'llms-full')})`, '')
  return lines.join('\n')
}

export type SeoCheck = { ok: boolean; label: string; hint: string }

/** Чек-лист для админки: то, что реально влияет на выдачу и на цитирование в ИИ-ответах. */
export function auditSite(site: Site): SeoCheck[] {
  const t = seoTitle(site)
  const d = seoDescription(site)
  const faqs = sectionsOf(site, 'faq').flatMap((s) => s.items)
  const local = !['Organization', 'SoftwareCompany'].includes(site.business.type)
  const imgs = site.sections.flatMap((s) => ('image' in s && s.image ? [s.image] : []))
  return [
    { ok: t.length >= 30 && t.length <= 65, label: `Заголовок: ${t.length} симв.`, hint: 'Оптимально 30–65 символов, ключевое слово ближе к началу.' },
    { ok: d.length >= 70 && d.length <= 160, label: `Описание: ${d.length} симв.`, hint: '70–160 символов: суть, город, выгода.' },
    { ok: site.seo.answer.length >= 60, label: 'Сводка-ответ (AEO)', hint: 'Одно-два предложения «что это, где, для кого, сколько стоит» — их цитируют ответы поисковиков и ИИ.' },
    { ok: faqs.length >= 4, label: `FAQ: ${faqs.length} вопросов`, hint: 'Минимум 4 вопроса с короткими фактическими ответами — FAQPage в разметке.' },
    { ok: !!firstOf(site, 'hero')?.title, label: 'Есть H1', hint: 'Заголовок первого экрана становится единственным H1 страницы.' },
    { ok: !local || !!(site.business.phone && (site.business.street || site.business.city)), label: 'NAP: имя, адрес, телефон', hint: 'Для локального бизнеса без адреса и телефона карточка в картах и разметка неполные.' },
    { ok: !local || site.business.hours.length > 0, label: 'Часы работы', hint: 'openingHours в разметке: «Mo-Fr 09:00-18:00».' },
    { ok: site.seo.keywords.length >= 3, label: `Ключевые темы: ${site.seo.keywords.length}`, hint: '3–8 тем: идут в keywords и knowsAbout.' },
    { ok: site.business.socials.length > 0, label: 'Соцсети (sameAs)', hint: 'Ссылки на профили связывают сущность в графах знаний.' },
    { ok: site.seo.index, label: 'Индексация включена', hint: 'Выключено — robots noindex, сайт не в sitemap.' },
    { ok: imgs.length === 0 || imgs.every((u) => /^https?:\/\//.test(u) || u.startsWith('/')), label: 'Изображения по корректным адресам', hint: 'Адрес фото должен начинаться с https:// или /.' },
  ]
}
