'use client'

import { useEffect } from 'react'

/*
 * Общее поведение всех шаблонов, которое не зависит от их вёрстки.
 * Шапка: если она прилипает к экрану (fixed/sticky), то при прокрутке вниз уезжает вверх,
 * при прокрутке вверх возвращается — не закрывает текст ни на телефоне, ни на компьютере.
 * Пока открыто мобильное меню (aria-expanded="true" внутри шапки), шапка не прячется.
 */
export function SiteChrome() {
  // Кнопка «#order», пока форма заявки не включена: ведём к контактам, а не в пустоту.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#order"]')
      if (!a || document.querySelector('dialog.lead')) return
      const to = document.querySelector('[data-type="contact"], #contacts, #contact, #kontakty, footer')
      if (!to) return
      e.preventDefault()
      to.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const site = document.querySelector('.site')
    if (!site) return
    const pinned = (el: Element | null) => !!el && /fixed|sticky/.test(getComputedStyle(el).position)
    const header = [...site.querySelectorAll('header')].find((h) => pinned(h) || pinned(h.firstElementChild)) as HTMLElement | undefined
    if (!header) return
    const target = pinned(header) ? header : (header.firstElementChild as HTMLElement)
    target.classList.add('atlas-hdr')
    let last = window.scrollY
    let raf = 0
    const tick = () => {
      raf = 0
      const y = window.scrollY
      const menuOpen = !!target.querySelector('[aria-expanded="true"]') || document.documentElement.classList.contains('menu-open')
      if (menuOpen || y < 120) target.classList.remove('atlas-hdr-hide')
      else if (y > last + 6) target.classList.add('atlas-hdr-hide')
      else if (y < last - 6) target.classList.remove('atlas-hdr-hide')
      if (Math.abs(y - last) > 6) last = y
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}
