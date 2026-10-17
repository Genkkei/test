import { template as silk } from './silk'
import { template as prism } from './prism'
import { template as fizz } from './fizz'
import { template as atelier } from './atelier'
import { template as lumen } from './lumen'
import { template as monolith } from './monolith'
import { template as ember } from './ember'
import { template as velocity } from './velocity'
import { template as horizon } from './horizon'
import { template as ledger } from './ledger'
import type { TemplateDef } from './types'

export const TEMPLATES: TemplateDef[] = [silk, prism, fizz, atelier, lumen, monolith, ember, velocity, horizon, ledger]

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
