import { z } from 'zod'

/*
 * Один сайт = один JSON. Шаблон решает, КАК выглядит секция, данные решают, ЧТО в ней.
 * Поэтому любую секцию можно перенести в другой шаблон без потерь: поля у всех одинаковые.
 */

const text = z.string().default('')
const link = z.object({ label: text, href: text }).default({ label: '', href: '' })

const base = {
  id: z.string(),
  enabled: z.boolean().default(true),
  /** якорь в меню; пусто — секции нет в навигации */
  anchor: text,
  label: text,
  title: text,
}

export const sectionSchemas = {
  hero: z.object({
    ...base,
    type: z.literal('hero'),
    eyebrow: text,
    subtitle: text,
    cta: link,
    ctaSecondary: link,
    image: text,
    words: z.array(z.string()).default([]),
  }),
  marquee: z.object({ ...base, type: z.literal('marquee'), items: z.array(z.string()).default([]) }),
  about: z.object({ ...base, type: z.literal('about'), text, image: text }),
  services: z.object({
    ...base,
    type: z.literal('services'),
    intro: text,
    items: z.array(z.object({ title: text, text, price: text, tag: text })).default([]),
  }),
  works: z.object({
    ...base,
    type: z.literal('works'),
    items: z.array(z.object({ title: text, category: text, year: text, text, image: text, href: text })).default([]),
  }),
  stats: z.object({
    ...base,
    type: z.literal('stats'),
    items: z.array(z.object({ value: text, suffix: text, label: text })).default([]),
  }),
  process: z.object({
    ...base,
    type: z.literal('process'),
    items: z.array(z.object({ title: text, text })).default([]),
  }),
  testimonials: z.object({
    ...base,
    type: z.literal('testimonials'),
    items: z.array(z.object({ quote: text, author: text, role: text })).default([]),
  }),
  team: z.object({
    ...base,
    type: z.literal('team'),
    items: z.array(z.object({ name: text, role: text, image: text })).default([]),
  }),
  pricing: z.object({
    ...base,
    type: z.literal('pricing'),
    items: z
      .array(
        z.object({ name: text, price: text, period: text, features: z.array(z.string()).default([]), featured: z.boolean().default(false) }),
      )
      .default([]),
  }),
  menu: z.object({
    ...base,
    type: z.literal('menu'),
    groups: z
      .array(z.object({ name: text, items: z.array(z.object({ name: text, text, price: text })).default([]) }))
      .default([]),
  }),
  gallery: z.object({
    ...base,
    type: z.literal('gallery'),
    items: z.array(z.object({ caption: text, image: text })).default([]),
  }),
  faq: z.object({
    ...base,
    type: z.literal('faq'),
    items: z.array(z.object({ q: text, a: text })).default([]),
  }),
  contact: z.object({ ...base, type: z.literal('contact'), text, cta: link }),
} as const

export type SectionType = keyof typeof sectionSchemas
export const SECTION_TYPES = Object.keys(sectionSchemas) as SectionType[]

export const sectionSchema = z.discriminatedUnion('type', [
  sectionSchemas.hero,
  sectionSchemas.marquee,
  sectionSchemas.about,
  sectionSchemas.services,
  sectionSchemas.works,
  sectionSchemas.stats,
  sectionSchemas.process,
  sectionSchemas.testimonials,
  sectionSchemas.team,
  sectionSchemas.pricing,
  sectionSchemas.menu,
  sectionSchemas.gallery,
  sectionSchemas.faq,
  sectionSchemas.contact,
])

export type Section = z.infer<typeof sectionSchema>
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'цвет в формате #RRGGBB')

export const themeSchema = z.object({
  bg: hex,
  fg: hex,
  accent: hex,
  muted: hex,
  surface: hex,
  line: hex,
  display: z.string(),
  body: z.string(),
  /** 0 — без движения, 1 — как задумано шаблоном, 2 — смелее */
  motion: z.number().min(0).max(2).default(1),
})
export type Theme = z.infer<typeof themeSchema>

export const BUSINESS_TYPES = [
  'Organization',
  'LocalBusiness',
  'ProfessionalService',
  'Restaurant',
  'Bakery',
  'CafeOrCoffeeShop',
  'Dentist',
  'MedicalClinic',
  'RealEstateAgent',
  'ExerciseGym',
  'Hotel',
  'LegalService',
  'Store',
  'EnergyStore',
  'SoftwareCompany',
  'AutoDealer',
  'AutoRepair',
  'BeautySalon',
  'EducationalOrganization',
  'ClothingStore',
  'DaySpa',
  'FinancialService',
  'NightClub',
  'VeterinaryCare',
  'MovingCompany',
  'HomeAndConstructionBusiness',
] as const

export const businessSchema = z.object({
  type: z.enum(BUSINESS_TYPES).default('LocalBusiness'),
  legalName: text,
  phone: text,
  email: text,
  street: text,
  city: text,
  region: text,
  country: z.string().default('UZ'),
  postalCode: text,
  lat: text,
  lng: text,
  /** «Mo-Fr 09:00-18:00», по строке на правило — формат schema.org openingHours */
  hours: z.array(z.string()).default([]),
  priceRange: text,
  founded: text,
  areaServed: text,
  socials: z.array(z.object({ name: text, url: text })).default([]),
})
export type Business = z.infer<typeof businessSchema>

export const seoSchema = z.object({
  title: text,
  description: text,
  keywords: z.array(z.string()).default([]),
  ogImage: text,
  /** AEO: короткий фактический ответ «что это и для кого». Показывается вверху страницы и в llms.txt. */
  answer: text,
  index: z.boolean().default(true),
})

/** Карточка в каталоге готовых сайтов: то, что видит покупатель до покупки. */
export const listingSchema = z.object({
  /** «12 900 000 сум» или пусто — тогда «цена по запросу» */
  price: text,
  /** два-три предложения: для кого сайт и чем он хорош */
  description: text,
  /** функционал вручную; пусто — собирается из сайта автоматически (lib/listing.ts) */
  features: z.array(z.string()).default([]),
  /** показывать в каталоге */
  forSale: z.boolean().default(true),
})
export type Listing = z.infer<typeof listingSchema>

export const siteSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'только латиница, цифры и дефис'),
  template: z.string(),
  name: z.string().min(1),
  tagline: text,
  niche: text,
  lang: z.string().default('ru'),
  domains: z.array(z.string()).default([]),
  theme: themeSchema,
  business: businessSchema,
  seo: seoSchema,
  nav: z.object({ cta: link }).default({ cta: { label: '', href: '' } }),
  listing: listingSchema.default({ price: '', description: '', features: [], forSale: true }),
  sections: z.array(sectionSchema),
  updatedAt: z.string().default(''),
  /** основной язык сайта; заполняется только у языковой версии (перевод поверх основного) */
  baseLang: z.string().optional(),
})

export type Site = z.infer<typeof siteSchema>
export type SiteInput = z.input<typeof siteSchema>
