'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

/*
 * Одна среда движения на сайт, управляемая атрибутами разметки — шаблонам не нужно
 * писать эффекты руками, достаточно пометить элемент:
 *   data-reveal="up|fade|clip|scale|blur|left|right"  — появление при входе в кадр (CSS-переход)
 *   data-split="lines|words|chars"                       — заголовок по строкам из-под маски (GSAP)
 *   data-parallax="0.15"                                  — смещение относительно прокрутки
 *   data-count                                            — число набегает от нуля
 *   data-magnetic                                         — кнопка тянется к курсору
 *   data-delay="0.2"                                      — задержка появления
 * Без JavaScript всё видно: прятать элементы начинает только класс html.motion,
 * который ставится здесь же. Краулер получает полный текст.
 */

gsap.registerPlugin(ScrollTrigger, SplitText)

let lenis: Lenis | null = null
export const getLenis = () => lenis

export function MotionRuntime({ level = 1 }: { level?: number }) {
  const pathname = usePathname()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || level === 0
    const root = document.documentElement
    root.classList.toggle('reduce-motion', reduce)
    if (reduce) {
      root.classList.remove('motion', 'motion-live')
      return
    }
    root.classList.add('motion', 'motion-live')
    root.style.setProperty('--motion-k', String(level))

    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis?.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // якоря через Lenis, иначе прыжок рвёт плавную прокрутку
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || a.getAttribute('href') === '#') return
      const target = document.querySelector(a.getAttribute('href')!)
      if (!target) return
      e.preventDefault()
      lenis?.scrollTo(target as HTMLElement, { offset: -40, duration: 1.4 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [level])

  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion')) return
    const ctx = gsap.context(() => {})
    // Шторка data-reveal="clip" в скрытом состоянии имеет clip-path нулевой площади, и наблюдатель
    // её «не видит» никогда. Поэтому за такими элементами следим через родителя.
    const watched = new Map<Element, HTMLElement[]>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          for (const el of watched.get(e.target) ?? []) el.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      // запас снизу компенсирует сдвиг data-reveal="up" на 48px: иначе элемент у нижнего края экрана
      // уезжал за границу наблюдения и не появлялся без прокрутки
      { rootMargin: '0px 0px 56px 0px', threshold: 0 },
    )
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const d = el.dataset.delay
      if (d) el.style.setProperty('--reveal-delay', `${d}s`)
      const target = el.dataset.reveal === 'clip' && el.parentElement ? el.parentElement : el
      watched.set(target, [...(watched.get(target) ?? []), el])
      io.observe(target)
    })

    const splits: SplitText[] = []
    ctx.add(() => {
      document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        const kind = (el.dataset.split || 'lines') as 'lines' | 'words' | 'chars'
        const split = SplitText.create(el, {
          type: kind === 'chars' ? 'lines,chars' : kind === 'words' ? 'lines,words' : 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit(self) {
            const targets = kind === 'chars' ? self.chars : kind === 'words' ? self.words : self.lines
            return gsap.from(targets, {
              yPercent: 110,
              rotate: kind === 'lines' ? 2 : 0,
              duration: kind === 'chars' ? 0.9 : 1.15,
              ease: 'expo.out',
              stagger: kind === 'chars' ? 0.018 : kind === 'words' ? 0.04 : 0.09,
              delay: Number(el.dataset.delay || 0),
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            })
          },
        })
        el.classList.add('is-split')
        splits.push(split)
      })

      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const k = Number(el.dataset.parallax || 0.15)
        gsap.fromTo(
          el,
          { yPercent: -k * 50 },
          { yPercent: k * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })

      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        // исходное число запоминается один раз: повторный запуск эффекта (StrictMode, смена страницы)
        // иначе прочитал бы уже обнулённый текст
        const raw = (el.dataset.countTo ??= el.textContent || '')
        const num = Number(raw.replace(/[^\d.]/g, ''))
        if (!Number.isFinite(num) || num === 0) return
        const decimals = (raw.split('.')[1] || '').replace(/\D/g, '').length
        const obj = { v: 0 }
        gsap.to(obj, {
          v: num,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = raw.replace(/[\d.,\s]+/, obj.v.toLocaleString('ru-RU', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }))
          },
        })
      })
    })

    const magnets = [...document.querySelectorAll<HTMLElement>('[data-magnetic]')]
    const offs = magnets.map((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.35)
        yTo((e.clientY - r.top - r.height / 2) * 0.35)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    })

    // шрифты меняют высоту строк — пересчитать триггеры, когда они догрузятся
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => {
      io.disconnect()
      offs.forEach((off) => off())
      splits.forEach((s) => s.revert())
      ctx.revert()
    }
  }, [pathname])

  return null
}
