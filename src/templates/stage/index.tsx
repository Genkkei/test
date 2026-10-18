import './style.css'
import type { Site } from '@/lib/schema'
import type { TemplateDef } from '../types'
import { meta } from './meta'

// Заготовка: шаблон в работе
function Shell({ children }: { site: Site; children: React.ReactNode }) {
  return <main id="top">{children}</main>
}

export const template: TemplateDef = { ...meta, Shell, sections: {} }
