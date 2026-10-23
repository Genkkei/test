'use client'

import { useEffect } from 'react'

/*
 * Логотип в шапке собирается при входе на сайт (anime.js v4, приём из примера «anime.js v4 logo animation»):
 * фигуры знака вырастают по очереди с отскоком, буквы названия поднимаются из-под маски. Один раз за вход,
 * только первый логотип в шапке. Без скрипта и при «меньше движения» логотип просто стоит.
 */
export function LogoIntro() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const logo = document.querySelector<HTMLElement>('header .brand-logo, .atlas-hdr .brand-logo')
    if (!logo || logo.getBoundingClientRect().top > innerHeight) return
    let undo: (() => void) | null = null
    let dead = false
    import('animejs').then(({ createTimeline, stagger, splitText }) => {
      if (dead) return
      const parts = logo.querySelectorAll('.brand-logo__mark > *')
      const word = logo.querySelector<HTMLElement>('.brand-logo__word')
      const split = word ? splitText(word, { chars: { wrap: 'clip' } }) : null
      const tl = createTimeline({ defaults: { ease: 'out(4)' } })
      if (parts.length) tl.add(parts, { scale: [0, 1], opacity: [0, 1], transformOrigin: ['50% 100%', '50% 100%'], duration: 700, delay: stagger(70), ease: 'outBack(1.6)' }, 0)
      if (split) tl.add(split.chars, { y: ['105%', '0%'], duration: 700, delay: stagger(35) }, 180)
      tl.then(() => split?.revert())
      undo = () => {
        tl.revert()
        split?.revert()
      }
    })
    return () => {
      dead = true
      undo?.()
    }
  }, [])
  return null
}
