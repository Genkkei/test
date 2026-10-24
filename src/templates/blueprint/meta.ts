import type { TemplateMeta } from '../types'

export const meta: TemplateMeta = {
  id: 'blueprint',
  name: 'Чертёж',
  inspiredBy: 'расчётная схема из КМ: оси в кружках, балка, распределённая нагрузка, эпюра моментов, штамп проверки; диаграмма Ганта, спецификация; experience2026.funtech (экран-терминал с расчётом)',
  mood: 'Синька, жёлтый маркер, инженерная точность',
  niches: ['Металлоконструкции', 'инженерное проектирование', 'лестницы и антресоли'],
  defaultTheme: { bg: '#0f2236', fg: '#e6eef6', accent: '#f5b301', muted: '#8aa1b8', surface: '#16304a', line: '#2d4a66', display: 'IBM Plex Mono', body: 'Sofia Sans', motion: 1 },
  art: 'grid',
  preview: { bg: '#0f2236', fg: '#e6eef6', accent: '#f5b301', word: 'q=500' },
}
