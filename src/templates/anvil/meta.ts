import type { TemplateMeta } from '../types'

export const meta: TemplateMeta = {
  id: 'anvil',
  name: 'Наковальня',
  inspiredBy: 'Кузнечные мастерские и ножевые бренды (Damasteel, Bladesmith studios) — тёмный горн, искры шейдером, металл цветов каления',
  mood: 'Огненный, ремесленный',
  niches: ['Кузница', 'художественная ковка', 'кованые изделия'],
  defaultTheme: {
    bg: '#0e0b09',
    fg: '#f0e6d8',
    accent: '#ff6a1a',
    muted: '#a39385',
    surface: '#1a1410',
    line: '#2e241d',
    display: 'Oswald',
    body: 'Golos Text',
    motion: 1,
  },
  art: 'rings',
  preview: { bg: '#0e0b09', fg: '#f0e6d8', accent: '#ff6a1a', word: 'Наковальня' },
}
