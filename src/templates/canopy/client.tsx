'use client'

import { useEffect } from 'react'

/*
 * Движение «Навеса». Каркас, искры, панели, солнце и тень первого экрана — CSS с первой отрисовки (@property --w).
 * Здесь: калькулятор мощности (машины → панели, кВт, кВт·ч в месяц) и появление при прокрутке: data-cn → .is-in
 * (крыши карточек прорисовываются, солнце этапов поднимается по дуге).
 */
export function CanopyMotion() {
  useEffect(() => {
    const calc = document.querySelector<HTMLElement>('.tpl-canopy .cn-calc')
    const range = calc?.querySelector<HTMLInputElement>('input[type=range]')
    const set = (k: string, v: string) => {
      const el = calc?.querySelector(`[data-k="${k}"]`)
      if (el) el.textContent = v
    }
    const fmt = new Intl.NumberFormat(document.documentElement.lang || 'ru', { maximumFractionDigits: 1 })
    const onInput = () => {
      if (!calc || !range) return
      const cars = Number(range.value)
      const panels = 2 + 4 * cars
      const kw = panels * 0.55
      calc.querySelector('output')!.textContent = String(cars)
      set('panels', String(panels))
      set('kw', fmt.format(kw))
      set('kwh', fmt.format(Math.round((kw * 4.5 * 30) / 10) * 10))
      calc.style.setProperty('--fill', `${((cars - 1) / 5) * 100}%`)
    }
    range?.addEventListener('input', onInput)
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('.tpl-canopy [data-cn]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      range?.removeEventListener('input', onInput)
    }
  }, [])
  return null
}
