import type { Site } from './schema'
import { sectionsOf, seoDescription, siteUrl } from './seo'
import { getTemplateMeta } from '@/templates/meta'

/*
 * Что включено в готовый сайт — собирается из самого сайта, чтобы карточка в каталоге
 * не обещала того, чего на сайте нет. Ручной список в listing.features заменяет авторасчёт.
 */

const TYPE_LABEL: Record<string, string> = {
  Restaurant: 'Restaurant',
  Bakery: 'Bakery',
  CafeOrCoffeeShop: 'CafeOrCoffeeShop',
  Dentist: 'Dentist',
  MedicalClinic: 'MedicalClinic',
  Hotel: 'Hotel',
  LegalService: 'LegalService',
  ExerciseGym: 'ExerciseGym',
  RealEstateAgent: 'RealEstateAgent',
}

export function autoFeatures(site: Site): string[] {
  const has = (t: Parameters<typeof sectionsOf>[1]) => sectionsOf(site, t).length > 0
  const faq = sectionsOf(site, 'faq').flatMap((s) => s.items).length
  const out: string[] = [
    'Уникальный дизайн с анимацией первого экрана на WebGL',
    'Плавная прокрутка, появление блоков, кинетическая типографика',
    'Адаптив под телефон, планшет и компьютер',
    'Админка: тексты, цены, фото, цвета, шрифты и порядок блоков',
  ]
  if (has('menu')) out.push('Меню или прайс разделами с ценами')
  if (has('services')) out.push('Каталог услуг с ценами')
  if (has('pricing')) out.push('Тарифы и пакеты')
  if (has('works')) out.push('Портфолио или каталог проектов')
  if (has('gallery')) out.push('Фотогалерея')
  if (has('team')) out.push('Команда со страницами-карточками')
  if (has('testimonials')) out.push('Отзывы клиентов')
  if (has('process')) out.push('Этапы работы (разметка HowTo)')
  if (has('stats')) out.push('Цифры с анимацией счёта')
  if (has('contact')) out.push('Контакты: звонок в один клик, карта, часы работы')
  out.push(
    `SEO: schema.org ${TYPE_LABEL[site.business.type] ?? site.business.type}, Open Graph, sitemap, canonical`,
    faq ? `AEO: блок ответа и FAQ на ${faq} вопросов в разметке FAQPage` : 'AEO: блок ответа для поисковиков и голосовых ассистентов',
    'GEO: llms.txt для ChatGPT, Perplexity, Claude и Gemini',
    'Подключение своего домена',
  )
  return out
}

export function listingOf(site: Site) {
  return {
    slug: site.slug,
    name: site.name,
    niche: site.niche,
    tagline: site.tagline,
    url: siteUrl(site),
    price: site.listing.price,
    description: site.listing.description || site.seo.answer || seoDescription(site),
    features: site.listing.features.length ? site.listing.features : autoFeatures(site),
    template: site.template,
    templateName: getTemplateMeta(site.template).name,
    inspiredBy: getTemplateMeta(site.template).inspiredBy,
    type: site.business.type,
    city: site.business.city,
    colors: { bg: site.theme.bg, fg: site.theme.fg, accent: site.theme.accent },
  }
}
