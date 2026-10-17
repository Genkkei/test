import type { Site } from './schema'

/*
 * Языки сайтов. Основной язык сайта — site.lang (русский у всех примеров); переводы лежат
 * рядом: content/sites/i18n/<slug>.<lang>.json (правки из админки — DATA_DIR/sites/i18n).
 * Перевод хранит только то, что читает человек: тексты секций, SEO, слоган, карточку каталога,
 * адрес. Цвета, шрифты, шаблон, телефон, домен и порядок секций — общие, из основного файла.
 */

export const LANGS = ['ru', 'uz', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const EXTRA_LANGS = ['uz', 'en'] as const

export const LANG_LABEL: Record<string, string> = { ru: 'Рус', uz: 'O‘zb', en: 'Eng' }
export const LANG_NAME: Record<string, string> = { ru: 'Русский', uz: 'O‘zbekcha', en: 'English' }
export const HREFLANG: Record<string, string> = { ru: 'ru', uz: 'uz', en: 'en' }
export const OG_LOCALE: Record<string, string> = { ru: 'ru_RU', uz: 'uz_UZ', en: 'en_US' }

type Json = Record<string, unknown>

/** Поля перевода поверх основного сайта. Секция сопоставляется по id; списки внутри секции
 *  перевод отдаёт целиком (вместе с ценами), отсутствующее поле остаётся из основного файла. */
export function mergeTranslation(base: Site, tr: Json, lang: string): Site {
  const out: Site = { ...base, lang, baseLang: base.lang }
  const pickStr = (k: 'tagline' | 'niche' | 'name') => {
    if (typeof tr[k] === 'string' && tr[k]) out[k] = tr[k] as string
  }
  pickStr('tagline')
  pickStr('niche')
  pickStr('name')
  if (tr.seo && typeof tr.seo === 'object') out.seo = { ...base.seo, ...(tr.seo as Json), index: base.seo.index, ogImage: base.seo.ogImage } as Site['seo']
  if (tr.nav && typeof tr.nav === 'object') out.nav = { ...base.nav, ...(tr.nav as Json) } as Site['nav']
  if (tr.listing && typeof tr.listing === 'object') out.listing = { ...base.listing, ...(tr.listing as Json), forSale: base.listing.forSale } as Site['listing']
  if (tr.business && typeof tr.business === 'object') {
    const b = tr.business as Json
    out.business = { ...base.business }
    for (const k of ['legalName', 'street', 'city', 'region', 'areaServed'] as const) if (typeof b[k] === 'string' && b[k]) out.business[k] = b[k] as string
  }
  if (Array.isArray(tr.sections)) {
    const byId = new Map((tr.sections as Json[]).map((s) => [s.id as string, s]))
    out.sections = base.sections.map((s) => {
      const t = byId.get(s.id)
      if (!t) return s
      // тип, включённость и якорь — из основного файла: перевод не меняет устройство страницы
      return { ...s, ...t, id: s.id, type: s.type, enabled: s.enabled, anchor: s.anchor } as typeof s
    })
  }
  return out
}

/** Часть перевода, которую имеет смысл хранить: то, что читает человек. */
export function translatableOf(site: Site): Json {
  return {
    name: site.name,
    tagline: site.tagline,
    niche: site.niche,
    seo: { title: site.seo.title, description: site.seo.description, keywords: site.seo.keywords, answer: site.seo.answer },
    nav: site.nav,
    listing: { price: site.listing.price, description: site.listing.description, features: site.listing.features },
    business: { legalName: site.business.legalName, street: site.business.street, city: site.business.city, region: site.business.region, areaServed: site.business.areaServed },
    sections: site.sections.map(({ enabled: _e, anchor: _a, ...rest }) => rest),
  }
}

/** Строки интерфейса шаблона на трёх языках: pick(site.lang, { ru: '…', uz: '…', en: '…' }). */
export function pick<T>(lang: string, v: { ru: T; uz: T; en: T }): T {
  return (v as Record<string, T>)[lang] ?? v.ru
}

/** Общие строки базовых секций и обвязки. */
export const UI = {
  phone: { ru: 'Телефон', uz: 'Telefon', en: 'Phone' },
  email: { ru: 'Почта', uz: 'Pochta', en: 'Email' },
  address: { ru: 'Адрес', uz: 'Manzil', en: 'Address' },
  hours: { ru: 'Часы', uz: 'Ish vaqti', en: 'Hours' },
  about: { ru: 'Коротко о нас', uz: 'Biz haqimizda qisqacha', en: 'About us in brief' },
  keywords: { ru: 'Ключевые слова', uz: 'Kalit so‘zlar', en: 'Keywords' },
  open: { ru: 'Открыть', uz: 'Ochish', en: 'Open' },
  view: { ru: 'Смотреть', uz: 'Ko‘rish', en: 'View' },
  menuOpen: { ru: 'Открыть меню', uz: 'Menyuni ochish', en: 'Open menu' },
  menuClose: { ru: 'Закрыть меню', uz: 'Menyuni yopish', en: 'Close menu' },
  sections: { ru: 'Разделы', uz: 'Bo‘limlar', en: 'Sections' },
  toTop: { ru: 'Наверх', uz: 'Yuqoriga', en: 'Back to top' },
  scroll: { ru: 'Листайте вниз', uz: 'Pastga suring', en: 'Scroll down' },
  language: { ru: 'Язык', uz: 'Til', en: 'Language' },
  photo: { ru: 'фото', uz: 'rasm', en: 'photo' },
} as const

export function ui(lang: string, key: keyof typeof UI): string {
  return pick(lang, UI[key])
}

const DAYS: Record<string, Record<string, string>> = {
  ru: { Mo: 'пн', Tu: 'вт', We: 'ср', Th: 'чт', Fr: 'пт', Sa: 'сб', Su: 'вс' },
  uz: { Mo: 'du', Tu: 'se', We: 'ch', Th: 'pa', Fr: 'ju', Sa: 'sh', Su: 'ya' },
  en: { Mo: 'Mon', Tu: 'Tue', We: 'Wed', Th: 'Thu', Fr: 'Fri', Sa: 'Sat', Su: 'Sun' },
}

/** «Mo-Fr 09:00-18:00» → «пн–пт 09:00–18:00» / «du–ju 09:00–18:00» / «Mon–Fri 09:00–18:00» */
// lang: unknown — функцию передают прямо в .map(humanHours), и вторым аргументом приходит индекс
export function humanHours(h: string, lang: unknown = 'ru'): string {
  const d = (typeof lang === 'string' && DAYS[lang]) || DAYS.ru
  return h.replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g, (x) => d[x]).replace(/-/g, '–')
}
