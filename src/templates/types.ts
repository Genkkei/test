import type { ComponentType, ReactNode } from 'react'
import type { SectionOf, SectionType, Site, Theme } from '@/lib/schema'
import type { ArtKind } from '@/motion/art'

export type SectionProps<T extends SectionType> = { section: SectionOf<T>; site: Site; index: number; art: ArtKind }

export type SectionRenderers = { [K in SectionType]?: ComponentType<SectionProps<K>> }

export type TemplateMeta = {
  id: string
  name: string
  /** чей уровень и чей приём взят за ориентир — показывается в конструкторе */
  inspiredBy: string
  mood: string
  niches: string[]
  defaultTheme: Theme
  /** вид генеративной заглушки вместо фото */
  art: ArtKind
  /** превью в конструкторе: две-три краски и подпись */
  preview: { bg: string; fg: string; accent: string; word: string }
}

export type TemplateDef = TemplateMeta & {
  /** обёртка страницы: фон, шапка, подвал, курсор. Секции приходят в children. */
  Shell: ComponentType<{ site: Site; children: ReactNode }>
  /** свои версии секций; чего нет — рисуется базовая, стилизованная CSS шаблона */
  sections: SectionRenderers
}

export function palette(site: Site): string[] {
  const t = site.theme
  return [t.surface, t.accent, t.fg, t.muted, t.bg]
}

export function navLinks(site: Site): { href: string; label: string }[] {
  return site.sections.filter((s) => s.enabled && s.anchor && s.label).map((s) => ({ href: `#${s.anchor}`, label: s.label }))
}
