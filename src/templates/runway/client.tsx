'use client'

import { useEffect, useRef } from 'react'

/** Название первого экрана растягивается по вертикали от прокрутки — как плакат, который тянут вниз. */
export function Stretch({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  // слово растягивается на всю ширину экрана, какой бы длины ни было название
  useEffect(() => {
    const el = ref.current!
    const word = el.firstElementChild as HTMLElement | null
    if (!word) return
    const fit = () => {
      word.style.fontSize = '100px'
      const w = word.scrollWidth
      const pad = parseFloat(getComputedStyle(word).paddingLeft) * 2
      if (w > pad) word.style.fontSize = `${Math.min(900, (100 * (el.clientWidth - pad)) / (w - pad)) * 0.985}px`
    }
    fit()
    document.fonts?.ready.then(fit).catch(() => {})
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const el = ref.current!
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const loop = () => {
      const p = Math.min(1, Math.max(0, scrollY / innerHeight))
      el.style.setProperty('--stretch', (1 + p * 0.9).toFixed(3))
      el.style.setProperty('--fade', (1 - p * 0.9).toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div ref={ref} className="rw-stretch">
      {children}
    </div>
  )
}

/** Лукбук: секция закрепляется, лента кадров едет вбок от вертикальной прокрутки.
 *  На телефоне и без движения — обычная лента, листается пальцем. */
export function Lookbook({ children, count }: { children: React.ReactNode; count: number }) {
  const outer = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const o = outer.current!
    const t = track.current!
    const mq = window.matchMedia('(min-width: 861px)')
    if (document.documentElement.classList.contains('reduce-motion')) return
    let raf = 0
    const size = () => {
      if (!mq.matches) {
        o.style.height = ''
        t.style.transform = ''
        return
      }
      o.style.height = `${t.scrollWidth - innerWidth + innerHeight}px`
    }
    const loop = () => {
      if (mq.matches) {
        const r = o.getBoundingClientRect()
        const max = Math.max(1, o.offsetHeight - innerHeight)
        const p = Math.min(1, Math.max(0, -r.top / max))
        t.style.transform = `translate3d(${-p * (t.scrollWidth - innerWidth)}px,0,0)`
        o.style.setProperty('--p', p.toFixed(3))
      }
      raf = requestAnimationFrame(loop)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(t)
    addEventListener('resize', size)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      removeEventListener('resize', size)
    }
  }, [count])
  return (
    <div ref={outer} className="rw-look">
      <div className="rw-look__sticky">
        <div ref={track} className="rw-look__track">
          {children}
        </div>
        <span className="rw-look__bar" aria-hidden="true" />
      </div>
    </div>
  )
}

/** Время шоурума в шапке, по Ташкенту. */
export function ShowroomTime() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const f = () => {
      if (ref.current) ref.current.textContent = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Tashkent' }).format(new Date())
    }
    f()
    const id = setInterval(f, 1000)
    return () => clearInterval(id)
  }, [])
  return <span ref={ref} suppressHydrationWarning>--:--:--</span>
}
