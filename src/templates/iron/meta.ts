import type { TemplateMeta } from '../types'

export const meta: TemplateMeta = {
  id: 'iron',
  name: 'Ворота',
  inspiredBy: 'Инженерные каталоги ограждений (Hörmann, Jansen, Betafence) — лист с миллиметровкой, чертёж ворот с размерами, образцы секций и калькулятор цены',
  mood: 'Инженерный, каталожный',
  niches: ['Ворота и заборы', 'кованые ограждения', 'автоматика ворот'],
  defaultTheme: {
    bg: '#e9eaeb',
    fg: '#15181c',
    accent: '#c2410c',
    muted: '#5f6670',
    surface: '#f6f6f5',
    line: '#c9ccd0',
    display: 'Montserrat',
    body: 'Golos Text',
    motion: 1,
  },
  art: 'grid',
  preview: { bg: '#e9eaeb', fg: '#15181c', accent: '#c2410c', word: 'Ворота' },
}
