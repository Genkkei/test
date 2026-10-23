'use client'

import { useEffect } from 'react'

/** Логотип в подвале и на макетах бренд-бука: CSS (.brand-fit) даёт кегль по средней ширине буквы, здесь —
 *  точная подгонка по настоящей ширине надписи (у шрифтов она разная), после шрифтов и при смене ширины. */
export function FitLogos() {
  useEffect(() => {
    const fit = () =>
      document.querySelectorAll<HTMLElement>('.brand-fit > .brand-logo').forEach((el) => {
        el.style.fontSize = ''
        const box = el.parentElement!.clientWidth
        const w = el.scrollWidth
        if (w > box && box > 0) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * box) / w - 0.5}px`
      })
    fit()
    document.fonts?.ready.then(fit).catch(() => {})
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return null
}
