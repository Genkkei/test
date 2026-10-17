import type { Site } from './schema'
import { sectionsOf, seoDescription, siteUrl } from './seo'
import { getTemplateMeta } from '@/templates/meta'
import { pick } from './i18n'

/*
 * Что включено в готовый сайт — собирается из самого сайта, чтобы карточка в каталоге
 * не обещала того, чего на сайте нет. Ручной список в listing.features заменяет авторасчёт.
 */

const F = {
  design: { ru: 'Уникальный дизайн с анимацией первого экрана на WebGL', uz: 'WebGL animatsiyali birinchi ekran bilan noyob dizayn', en: 'Original design with a WebGL hero animation' },
  motion: { ru: 'Плавная прокрутка, появление блоков, кинетическая типографика', uz: 'Silliq aylantirish, bloklarning paydo bo‘lishi, kinetik tipografika', en: 'Smooth scrolling, block reveals, kinetic typography' },
  responsive: { ru: 'Адаптив под телефон, планшет и компьютер', uz: 'Telefon, planshet va kompyuterga moslashuv', en: 'Responsive on phone, tablet and desktop' },
  admin: { ru: 'Админка: тексты, цены, фото, цвета, шрифты и порядок блоков', uz: 'Admin panel: matnlar, narxlar, rasmlar, ranglar, shriftlar va bloklar tartibi', en: 'Admin panel: copy, prices, photos, colours, fonts and block order' },
  langs: { ru: 'Три языка: русский, узбекский, английский', uz: 'Uch til: rus, o‘zbek, ingliz', en: 'Three languages: Russian, Uzbek, English' },
  menu: { ru: 'Меню или прайс разделами с ценами', uz: 'Bo‘limlarga ajratilgan narxli menyu yoki prays', en: 'Menu or price list in sections' },
  services: { ru: 'Каталог услуг с ценами', uz: 'Narxli xizmatlar katalogi', en: 'Service catalogue with prices' },
  pricing: { ru: 'Тарифы и пакеты', uz: 'Tariflar va paketlar', en: 'Plans and packages' },
  works: { ru: 'Портфолио или каталог проектов', uz: 'Portfolio yoki loyihalar katalogi', en: 'Portfolio or project catalogue' },
  gallery: { ru: 'Фотогалерея', uz: 'Fotogalereya', en: 'Photo gallery' },
  team: { ru: 'Команда', uz: 'Jamoa', en: 'Team' },
  testimonials: { ru: 'Отзывы клиентов', uz: 'Mijozlar sharhlari', en: 'Client reviews' },
  process: { ru: 'Этапы работы (разметка HowTo)', uz: 'Ish bosqichlari (HowTo belgilash)', en: 'Process steps (HowTo markup)' },
  stats: { ru: 'Цифры с анимацией счёта', uz: 'Hisob animatsiyali raqamlar', en: 'Animated counters' },
  contact: { ru: 'Контакты: звонок в один клик, карта, часы работы', uz: 'Kontaktlar: bir bosishda qo‘ng‘iroq, xarita, ish vaqti', en: 'Contacts: one-tap call, map, opening hours' },
  seo: { ru: 'SEO: schema.org {type}, Open Graph, sitemap, canonical, hreflang', uz: 'SEO: schema.org {type}, Open Graph, sitemap, canonical, hreflang', en: 'SEO: schema.org {type}, Open Graph, sitemap, canonical, hreflang' },
  aeoFaq: { ru: 'AEO: блок ответа и FAQ на {n} вопросов в разметке FAQPage', uz: 'AEO: javob bloki va FAQPage belgilashida {n} ta savolli FAQ', en: 'AEO: answer block and a {n}-question FAQ with FAQPage markup' },
  aeo: { ru: 'AEO: блок ответа для поисковиков и голосовых ассистентов', uz: 'AEO: qidiruv tizimlari va ovozli yordamchilar uchun javob bloki', en: 'AEO: answer block for search engines and voice assistants' },
  geo: { ru: 'GEO: llms.txt для ChatGPT, Perplexity, Claude и Gemini', uz: 'GEO: ChatGPT, Perplexity, Claude va Gemini uchun llms.txt', en: 'GEO: llms.txt for ChatGPT, Perplexity, Claude and Gemini' },
  domain: { ru: 'Подключение своего домена', uz: 'O‘z domeningizni ulash', en: 'Your own domain connected' },
}

export function autoFeatures(site: Site, langs: string[] = [site.lang]): string[] {
  const t = (k: keyof typeof F) => pick(site.lang, F[k])
  const has = (x: Parameters<typeof sectionsOf>[1]) => sectionsOf(site, x).length > 0
  const faq = sectionsOf(site, 'faq').flatMap((s) => s.items).length
  const out: string[] = [t('design'), t('motion'), t('responsive'), t('admin')]
  if (langs.length >= 3) out.push(t('langs'))
  if (has('menu')) out.push(t('menu'))
  if (has('services')) out.push(t('services'))
  if (has('pricing')) out.push(t('pricing'))
  if (has('works')) out.push(t('works'))
  if (has('gallery')) out.push(t('gallery'))
  if (has('team')) out.push(t('team'))
  if (has('testimonials')) out.push(t('testimonials'))
  if (has('process')) out.push(t('process'))
  if (has('stats')) out.push(t('stats'))
  if (has('contact')) out.push(t('contact'))
  out.push(t('seo').replace('{type}', site.business.type), faq ? t('aeoFaq').replace('{n}', String(faq)) : t('aeo'), t('geo'), t('domain'))
  return out
}

export function listingOf(site: Site, langs: string[] = [site.lang]) {
  return {
    slug: site.slug,
    name: site.name,
    niche: site.niche,
    tagline: site.tagline,
    url: siteUrl(site),
    price: site.listing.price,
    description: site.listing.description || site.seo.answer || seoDescription(site),
    features: site.listing.features.length ? site.listing.features : autoFeatures(site, langs),
    lang: site.lang,
    langs,
    template: site.template,
    templateName: getTemplateMeta(site.template).name,
    inspiredBy: getTemplateMeta(site.template).inspiredBy,
    type: site.business.type,
    city: site.business.city,
    colors: { bg: site.theme.bg, fg: site.theme.fg, accent: site.theme.accent },
  }
}
