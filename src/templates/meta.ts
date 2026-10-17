import { meta as silk } from './silk/meta'
import { meta as prism } from './prism/meta'
import { meta as fizz } from './fizz/meta'
import { meta as atelier } from './atelier/meta'
import { meta as lumen } from './lumen/meta'
import { meta as monolith } from './monolith/meta'
import { meta as ember } from './ember/meta'
import { meta as velocity } from './velocity/meta'
import { meta as horizon } from './horizon/meta'
import { meta as ledger } from './ledger/meta'
import type { TemplateMeta } from './types'

/** Метаданные без компонентов — для серверных действий и админки. */
export const TEMPLATE_METAS: TemplateMeta[] = [silk, prism, fizz, atelier, lumen, monolith, ember, velocity, horizon, ledger]

export function getTemplateMeta(id: string): TemplateMeta {
  return TEMPLATE_METAS.find((t) => t.id === id) ?? TEMPLATE_METAS[0]
}
