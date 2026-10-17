import type { Site } from '@/lib/schema'
import { BaseFooter } from '@/components/sections'
import type { TemplateDef } from '../types'
import { meta } from './meta'

// ЗАГОТОВКА: шаблон ещё не оформлен, рисуется базовыми секциями.
function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <BaseFooter site={site} />
    </>
  )
}

export const template: TemplateDef = { ...meta, Shell, sections: {} }
