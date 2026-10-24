import type { TemplateMeta } from '../types'

export const meta: TemplateMeta = {
  id: 'stock',
  name: 'Табло',
  inspiredBy: 'вокзальное табло Solari (буквы на флажках), experience2026.funtech.inc (прибор: часы, камера, счётчики)',
  mood: 'Металлобаза в 8 утра: табло цен, камера площадки, манипулятор под погрузкой',
  niches: ['Металлобаза', 'стройматериалы', 'оптовый склад'],
  defaultTheme: { bg: '#111417', fg: '#e8ebee', accent: '#ff6b1a', muted: '#8b949d', surface: '#1a1e22', line: '#2b3138', display: 'Alumni Sans', body: 'PT Sans Narrow', motion: 1 },
  art: 'stripes',
  preview: { bg: '#111417', fg: '#ffb238', accent: '#ff6b1a', word: 'ТАБЛО' },
}
