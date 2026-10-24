'use client'

import { useEffect } from 'react'

/** Логотип в подвале и на макетах бренд-бука: CSS (.brand-fit) даёт кегль по средней ширине буквы, здесь —
 *  точная подгонка по настоящей ширине надписи (у шрифтов она разная), после шрифтов и при смене ширины. */
export function FitLogos() {
  useEffect(() => {
    const fit = () =>
      // в бренд-буке — любой логотип: длинное название («Ваша компания») не должно вылезать из макета
      document.querySelectorAll<HTMLElement>('.brand-fit > .brand-logo, .bb .brand-logo').forEach((el) => {
        el.style.fontSize = ''
        // в бренд-буке обёртки логотипа сжимаются под него — меряем по ближайшему макету/панели
        const host = el.closest<HTMLElement>('.bb-misuse__item > div, .mk__on, .mk__stage, .bb-panel, .sg-post, .bc-card, .bd-face__side, .bn-wide, .bn-phone__body, .bb-sheet__art') ?? el.parentElement!
        const cs = getComputedStyle(host)
        const inner = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
        const box = host === el.parentElement ? inner : inner * (host.matches('.bb-misuse__item > div') ? 0.6 : 0.9)
        const w = Math.max(el.scrollWidth, el.getBoundingClientRect().width)
        if (w > box && box > 0) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * box) / w - 0.5}px`
      })
    fit()
    document.fonts?.ready.then(fit).catch(() => {})
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return null
}
