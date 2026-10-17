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
import { template as chrome } from './chrome'
import { template as petal } from './petal'
import { template as roast } from './roast'
import { template as play } from './play'
import { template as runway } from './runway'
import { template as breath } from './breath'
import { template as route } from './route'
import { template as aurora } from './aurora'
import { template as rave } from './rave'
import { template as paws } from './paws'
import { template as darkroom } from './darkroom'
import { template as kinfolk } from './kinfolk'
import type { TemplateDef } from './types'

export const TEMPLATES: TemplateDef[] = [silk, prism, fizz, atelier, lumen, monolith, ember, velocity, horizon, ledger, chrome, petal, roast, play, runway, breath, route, aurora, rave, paws, darkroom, kinfolk]

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
