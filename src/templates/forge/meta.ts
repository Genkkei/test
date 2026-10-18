import type { TemplateMeta } from '../types'

export const meta: TemplateMeta = {
  id: 'forge',
  name: 'Горн',
  inspiredBy: 'Индустриальные плакаты и бренды рабочей одежды (Caterpillar, Carhartt WIP, Hilti) — чёрный и сигнальный жёлтый, балки, болты, спецификации',
  mood: 'Мощный, индустриальный',
  niches: ['Металлоконструкции', 'кузнечный цех', 'навесы и лестницы'],
  defaultTheme: {
    bg: '#161616',
    fg: '#f2f0eb',
    accent: '#ffb800',
    muted: '#9a968d',
    surface: '#202020',
    line: '#343434',
    display: 'Russo One',
    body: 'Onest',
    motion: 1,
  },
  art: 'stripes',
  preview: { bg: '#161616', fg: '#f2f0eb', accent: '#ffb800', word: 'Горн' },
}
