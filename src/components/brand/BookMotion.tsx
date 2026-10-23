'use client'

import { useEffect } from 'react'

/*
 * Движение бренд-бука на anime.js v4 (animejs.com; приёмы — из официальных примеров v4: text split,
 * svg line drawing, advanced grid staggering, scramble, onScroll). Каждый приём что-то показывает: слова
 * заголовка выходят из-под маски, айсберг всплывает и волна прорисовывается, круги модели бренда чертятся
 * по одному, палитра встаёт полосами, узор отвечает на палец волной от точки касания.
 *
 * Без скрипта и при «меньше движения» всё видно сразу: прячем только после загрузки anime.js и только то,
 * что ещё ниже экрана (появится при прокрутке). Библиотека грузится отдельным куском — первому экрану не мешает.
 */

type Anime = typeof import('animejs')

export function BookMotion() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let dead = false
    const undo: (() => void)[] = []
    import('animejs').then((A: Anime) => {
      if (dead) return
      const root = document.querySelector<HTMLElement>('.bb')
      if (!root) return
      root.classList.add('bb-js')
      const { animate, createTimeline, stagger, splitText, svg, scrambleText, utils } = A
      const out = 'out(4)'

      const plays = new Map<Element, () => void>()
      const io = new IntersectionObserver(
        (es) => {
          for (const e of es) {
            if (!e.isIntersecting) continue
            io.unobserve(e.target)
            plays.get(e.target)?.()
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      )
      undo.push(() => io.disconnect())
      const when = (el: Element, hide: () => void, play: () => void) => {
        hide()
        plays.set(el, play)
        io.observe(el)
      }

      // заголовки: слова поднимаются из-под маски по очереди
      root.querySelectorAll<HTMLElement>('[data-a="split"]').forEach((el) => {
        const s = splitText(el, { words: { wrap: 'clip' } })
        undo.push(() => s.revert())
        when(
          el,
          () => utils.set(s.words, { y: '110%' }),
          () => animate(s.words, { y: ['110%', '0%'], duration: 900, delay: stagger(70), ease: out }),
        )
      })

      // списки и карточки: дети приходят снизу лесенкой
      root.querySelectorAll<HTMLElement>('[data-a="rise"]').forEach((el) => {
        const kids = [...el.children] as HTMLElement[]
        when(
          el,
          () => utils.set(kids, { opacity: 0, y: 24 }),
          () => animate(kids, { opacity: [0, 1], y: [24, 0], duration: 800, delay: stagger(60), ease: out }),
        )
      })

      // айсберг: верх всплывает, подводная часть проступает, волна прорисовывается и дальше колышется
      const berg = root.querySelector('.bb-ice')
      if (berg) {
        const wave = svg.createDrawable(berg.querySelector('.bb-ice__wave')!)
        const tl = createTimeline({ defaults: { ease: out } })
          .add(berg.querySelector('.bb-ice__top')!, { y: [60, 0], opacity: [0, 1], duration: 1100 }, 100)
          .add(berg.querySelector('.bb-ice__under')!, { y: [-30, 0], opacity: [0, 1], duration: 1400 }, 300)
          .add(wave, { draw: ['0 0', '0 1'], duration: 1400, ease: 'inOut(3)' }, 0)
        const bob = animate(berg.querySelectorAll('.bb-ice__top, .bb-ice__under'), { y: [0, -6], duration: 2600, ease: 'inOut(2)', loop: true, alternate: true, autoplay: false })
        tl.then(() => !dead && bob.play())
        undo.push(() => {
          tl.revert()
          bob.revert()
        })
      }

      // круги модели бренда: чертятся по одному, потом проступают подписи
      root.querySelectorAll<SVGSVGElement>('[data-a="draw"]').forEach((el) => {
        const lines = svg.createDrawable(el.querySelectorAll('.draw'))
        const labels = el.querySelectorAll('text')
        when(
          el,
          () => {
            utils.set(lines, { draw: '0 0', fillOpacity: 0 })
            utils.set(labels, { opacity: 0 })
          },
          () =>
            createTimeline({ defaults: { ease: 'inOut(3)' } })
              .add(lines, { draw: ['0 0', '0 1'], duration: 1200, delay: stagger(180) })
              .add(lines, { fillOpacity: [0, 1], duration: 700, ease: out }, '-=500')
              .add(labels, { opacity: [0, 1], y: [6, 0], duration: 500, delay: stagger(50), ease: out }, '-=500'),
        )
      })

      // архетип и имя шрифта: буквы перебираются и встают на место
      root.querySelectorAll<HTMLElement>('[data-a="scramble"]').forEach((el) => {
        const text = el.textContent || ''
        when(
          el,
          () => {},
          () => animate(el, { innerHTML: scrambleText({ text, chars: 'АБВГДЕЖЗИКЛМНОПРСТУФХ', revealRate: 30, settleDuration: 500 }), duration: 1200 }),
        )
      })

      // палитра: полосы встают снизу (на телефоне — выезжают слева)
      root.querySelectorAll<HTMLElement>('[data-a="stripes"]').forEach((el) => {
        const bars = [...el.children] as HTMLElement[]
        const narrow = matchMedia('(max-width: 640px)').matches
        const k = narrow ? 'scaleX' : 'scaleY'
        when(
          el,
          () => utils.set(bars, { [k]: 0 }),
          () => animate(bars, { [k]: [0, 1], duration: 1100, delay: stagger(90), ease: 'inOut(4)' }),
        )
      })

      // охранное поле: квадраты x раскрываются из углов логотипа
      root.querySelectorAll<HTMLElement>('[data-a="clear"]').forEach((el) => {
        const xs = el.querySelectorAll('.bb-clear__x')
        when(
          el,
          () => utils.set(xs, { scale: 0 }),
          () => animate(xs, { scale: [0, 1], rotate: [90, 0], duration: 700, delay: stagger(90, { start: 300 }), ease: 'outBack(2)' }),
        )
      })

      // узор: появляется волной от центра сетки, касание/мышь запускает волну от этой клетки
      root.querySelectorAll<HTMLElement>('[data-a="pattern"]').forEach((el) => {
        const cells = [...el.children].filter((c) => (c as HTMLElement).offsetParent) as HTMLElement[]
        const marks = cells.map((c) => c.firstElementChild as SVGElement)
        const cols = getComputedStyle(el).gridTemplateColumns.split(' ').length
        const grid: [number, number] = [cols, Math.ceil(cells.length / cols)]
        const wave = (from: number | 'center') =>
          animate(marks, {
            scale: [{ to: 0.35, duration: 260, ease: 'out(2)' }, { to: 1, duration: 900, ease: 'outElastic(1, .6)' }],
            rotate: { to: '+=180', duration: 1100, ease: 'inOut(3)' },
            delay: stagger(60, { grid, from }),
          })
        when(
          el,
          () => utils.set(marks, { scale: 0 }),
          () =>
            animate(marks, {
              scale: [0, 1],
              duration: 900,
              delay: stagger(50, { grid, from: 'center' }),
              ease: 'outElastic(1, .7)',
            }),
        )
        let busy = 0
        const onPoint = (e: PointerEvent) => {
          const cell = (e.target as Element).closest('.bb-pattern > span')
          const i = cells.indexOf(cell as HTMLElement)
          const now = performance.now()
          if (i < 0 || now - busy < 700) return
          busy = now
          wave(i)
        }
        el.addEventListener('pointerdown', onPoint)
        el.addEventListener('pointerover', onPoint)
        undo.push(() => {
          el.removeEventListener('pointerdown', onPoint)
          el.removeEventListener('pointerover', onPoint)
        })
      })

      // десять принципов: номер «N/10» досчитывает до своего
      root.querySelectorAll<HTMLElement>('.bb-ten__n').forEach((el) => {
        const n = parseInt(el.textContent || '0', 10)
        const v = { n: 0 }
        when(
          el,
          () => {},
          () =>
            animate(v, {
              n: [0, n],
              duration: 600 + n * 60,
              ease: 'out(3)',
              modifier: utils.round(0),
              onUpdate: () => (el.textContent = `${v.n}/10`),
            }),
        )
      })
    })
    return () => {
      dead = true
      undo.forEach((f) => f())
      document.querySelector('.bb')?.classList.remove('bb-js')
    }
  }, [])
  return null
}
