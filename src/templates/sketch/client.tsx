'use client'

import { useEffect } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/*
 * Движение «Эскиза». Вход листа — CSS с первой отрисовки (рамка → штриховка эскиза → размер → фото).
 * Здесь: после входа под курсором фото снова становится эскизом (окно 120 px, следует за мышью с
 * запаздыванием — ощущение лупы, а не прилипшего круга); в штампе перещёлкивается изделие (стирается и
 * пишется заново); рамка этапов дочерчивается прокруткой; появление при прокрутке (data-sk → .is-in).
 */
export function SketchMotion() {
  useEffect(() => {
    const offs: (() => void)[] = []
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    document.querySelectorAll('.tpl-sketch [data-sk]').forEach((el) => io.observe(el))
    offs.push(() => io.disconnect())

    const sheet = document.querySelector<HTMLElement>('[data-sketch-sheet]')
    const art = sheet?.querySelector<HTMLElement>('.sketch-sheet__art')
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    if (sheet && art && sheet.querySelector('.sketch-sheet__pencil') && fine && !reduced()) {
      let tx = 50, ty = 50, x = 50, y = 50, r = 0, tr = 0, raf = 0
      const loop = () => {
        x += (tx - x) * 0.18
        y += (ty - y) * 0.18
        r += (tr - r) * 0.16
        art.style.setProperty('--mx', `${x.toFixed(2)}%`)
        art.style.setProperty('--my', `${y.toFixed(2)}%`)
        art.style.setProperty('--mr', `${r.toFixed(1)}px`)
        raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) > 0.05 ? requestAnimationFrame(loop) : 0
      }
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(loop)
      }
      const move = (e: PointerEvent) => {
        const b = art.getBoundingClientRect()
        tx = ((e.clientX - b.left) / b.width) * 100
        ty = ((e.clientY - b.top) / b.height) * 100
        kick()
      }
      const enter = (e: PointerEvent) => {
        move(e)
        x = tx
        y = ty
        tr = 120
        kick()
      }
      const leave = () => {
        tr = 0
        kick()
      }
      const ready = setTimeout(() => sheet.classList.add('is-done'), 2900)
      art.addEventListener('pointerenter', enter)
      art.addEventListener('pointermove', move)
      art.addEventListener('pointerleave', leave)
      offs.push(() => {
        clearTimeout(ready)
        cancelAnimationFrame(raf)
        art.removeEventListener('pointerenter', enter)
        art.removeEventListener('pointermove', move)
        art.removeEventListener('pointerleave', leave)
      })
    } else if (sheet) sheet.classList.add('is-done')

    // штамп: изделие стирается и пишется заново
    const word = document.querySelector<HTMLElement>('[data-sketch-word]')
    const json = document.querySelector('[data-sketch-words]')?.textContent
    const words: string[] = json ? JSON.parse(json) : []
    if (word && words.length > 1 && !reduced()) {
      let i = 0
      const id = setInterval(() => {
        if (document.hidden) return
        i = (i + 1) % words.length
        const out = word.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 220, easing: 'ease-in' })
        out.onfinish = () => {
          word.textContent = words[i]
          word.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' })
        }
      }, 2600)
      offs.push(() => clearInterval(id))
    }

    // рамка этапов
    const zones = document.querySelector<HTMLElement>('[data-sketch-zones]')
    let zraf = 0
    const frame = () => {
      zraf = 0
      if (!zones) return
      const r = zones.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.9)))
      zones.style.setProperty('--p', p.toFixed(4))
    }
    const on = () => {
      if (!zraf) zraf = requestAnimationFrame(frame)
    }
    frame()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    offs.push(() => {
      cancelAnimationFrame(zraf)
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
    })
    return () => offs.forEach((f) => f())
  }, [])
  return null
}
