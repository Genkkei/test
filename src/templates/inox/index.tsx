import './style.css'
import type { TemplateDef } from '../types'
import { meta } from './meta'

// заготовка: шаблон в работе
export const template: TemplateDef = { ...meta, Shell: ({ children }) => <main id="top">{children}</main>, sections: {} }
