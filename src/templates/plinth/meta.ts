import type { TemplateMeta } from '../types'

export const meta: TemplateMeta = {
  id: 'plinth',
  name: 'Цоколь',
  inspiredBy: 'OMA, Norm Architects, Studio Mumbai — бетон, чертёжные линии, огромные номера проектов',
  mood: 'Архитектурный, строгий',
  niches: ['Архитектурное бюро', 'дизайн интерьера', 'девелопер'],
  defaultTheme: {
    bg: '#d9d6d0',
    fg: '#141414',
    accent: '#b0442c',
    muted: '#5a5753',
    surface: '#c9c5bd',
    line: '#a9a59d',
    display: 'Montserrat',
    body: 'JetBrains Mono',
    motion: 1,
  },
  art: 'arch',
  preview: { bg: '#d9d6d0', fg: '#141414', accent: '#b0442c', word: 'Цоколь' },
}
