'use client'

import { useEffect } from 'react'
import { animate, createScope, createTimeline, stagger, svg, utils } from 'animejs'
import { ACTORS, type Choreo } from './actors'

/*
 * Герой первого экрана на anime.js: предмет ниши появляется со своей хореографией и остаётся рядом с
 * заголовком — справа от последней строки, справа от блока, над ним или в углу первого экрана,
 * смотря где свободно (текст, кнопки и фото он не закрывает). Нажатия проходят сквозь него.
 * При «уменьшить движение» — просто стоит на месте.
 */

type Props = { kind: string; colors: { a: string; f: string; b: string } }
type Box = { x: number; y: number; w: number; h: number }

const hit = (a: Box, b: Box, pad = 8) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y
const box = (r: DOMRect, o: DOMRect): Box => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height })

function findHero(): { hero: HTMLElement; title: HTMLElement } | null {
  const site = document.querySelector<HTMLElement>('.site') ?? document.body
  const hero = site.querySelector<HTMLElement>('.s-hero') ?? site.querySelector<HTMLElement>('main section, section')
  const title = hero?.querySelector<HTMLElement>('h1') ?? null
  return hero && title ? { hero, title } : null
}

/** Свободное место рядом с заголовком; null — если на первом экране его нет. */
function place(hero: HTMLElement, title: HTMLElement, S: number): Box | null {
  const o = hero.getBoundingClientRect()
  const range = document.createRange()
  range.selectNodeContents(title)
  const lines = [...range.getClientRects()].filter((r) => r.width > 4 && r.height > 4).map((r) => box(r, o))
  if (!lines.length) return null
  const t = box(title.getBoundingClientRect(), o)
  const obstacles: Box[] = [...lines]
  hero.querySelectorAll<HTMLElement>('h2, h3, p, a, button, dl, ul, ol, form, label, input, .btn, [class*="badge"], [class*="sticker"]').forEach((el) => {
    if (el.closest('.na-actor') || title.contains(el)) return
    const r = el.getBoundingClientRect()
    if (r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden') obstacles.push(box(r, o))
  })
  const last = lines[lines.length - 1]
  const first = lines[0]
  const W = hero.clientWidth
  // внизу экрана — переключатель языка и корзина: туда не встаём
  const viewBottom = Math.min(hero.clientHeight, window.innerHeight - o.top) - 56
  const header = 76
  const centered = getComputedStyle(title).textAlign === 'center'
  const cands: Box[] = [
    { x: last.x + last.w + S * 0.18, y: last.y + last.h - S * 0.95, w: S, h: S },
    { x: t.x + t.w + S * 0.25, y: t.y + t.h / 2 - S / 2, w: S, h: S },
    { x: centered ? first.x + first.w / 2 - S / 2 : first.x, y: t.y - S - 10, w: S, h: S },
    { x: t.x - S - S * 0.25, y: t.y + t.h / 2 - S / 2, w: S, h: S },
    { x: W - S - 28, y: header + 16, w: S, h: S },
    { x: W - S - 28, y: viewBottom - S - 16, w: S, h: S },
  ]
  const ok = (c: Box) => c.x >= 10 && c.x + c.w <= W - 10 && c.y >= header && c.y + c.h <= viewBottom && !obstacles.some((ob) => hit(c, ob))
  const found = cands.find(ok)
  if (found) return found
  // тесно: пробуем поменьше и по сетке свободных мест первого экрана
  const s = Math.round(S * 0.72)
  for (let y = header + 8; y + s <= viewBottom; y += s / 2)
    for (const x of [W - s - 24, 24, W / 2 - s / 2]) {
      const c = { x, y, w: s, h: s }
      if (ok(c)) return c
    }
  return null
}

export function NicheActor({ kind, colors }: Props) {
  useEffect(() => {
    const actor = ACTORS[kind]
    const found = findHero()
    if (!actor || !found) return
    const { hero, title } = found
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const wrap = document.createElement('div')
    wrap.className = 'na-actor'
    wrap.setAttribute('aria-hidden', 'true')
    wrap.style.setProperty('--na-a', colors.a)
    wrap.style.setProperty('--na-f', colors.f)
    wrap.style.setProperty('--na-b', colors.b)
    wrap.innerHTML = `<svg viewBox="0 0 120 120" overflow="visible">${actor.svg}</svg>`
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative'

    let scope: ReturnType<typeof createScope> | null = null
    let timers: number[] = []
    let started = false

    const size = () => Math.round(Math.min(190, Math.max(84, parseFloat(getComputedStyle(title).fontSize) * 1.5)))
    const position = () => {
      const S = size()
      const spot = place(hero, title, S)
      if (!spot) {
        wrap.style.display = 'none'
        return null
      }
      wrap.style.display = ''
      Object.assign(wrap.style, { left: `${spot.x}px`, top: `${spot.y}px`, width: `${spot.w}px`, height: `${spot.h}px` })
      return { S: spot.w, spot }
    }

    // ждём, пока заголовок проявится (у шаблонов своя анимация текста), — иначе место считается по пустоте
    const start = window.setTimeout(() => {
      hero.appendChild(wrap)
      const p = position()
      if (!p) return
      started = true
      if (still) return
      scope = createScope({ root: wrap }).add(() => choreograph(actor.choreo, kind, wrap, p.S, p.spot, (id) => timers.push(id)))
    }, 750)

    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => started && position())
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(start)
      timers.forEach((t) => clearInterval(t))
      timers = []
      window.removeEventListener('resize', onResize)
      scope?.revert()
      wrap.remove()
    }
  }, [kind, colors.a, colors.f, colors.b])
  return null
}

function choreograph(choreo: Choreo, kind: string, w: HTMLElement, S: number, spot: Box, every: (id: number) => void) {
  const q = (s: string) => [...w.querySelectorAll<SVGElement>(s)]
  const body = q('.na-body')
  const shadow = q('.na-shadow')
  const sparks = q('.na-spark')
  const arms = q('.na-arm')
  const above = -(w.getBoundingClientRect().top + S * 1.2) // старт над краем экрана
  const float = () => animate(w, { y: [0, -S * 0.05], alternate: true, loop: true, duration: 2200, ease: 'inOutSine' })
  const repeat = (fn: () => void, ms: number) => every(window.setInterval(fn, ms))
  const burst = () =>
    animate(sparks, {
      x: () => [0, utils.random(-S * 0.45, S * 0.45)],
      y: () => [0, utils.random(-S * 0.5, -S * 0.05)],
      opacity: [1, 0],
      scale: [1, 0.2],
      duration: () => utils.random(450, 850),
      ease: 'outQuad',
    })
  const twinkle = () => animate(sparks, { scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90], duration: 1300, delay: stagger(380), loop: true, loopDelay: 700, ease: 'inOutSine' })
  const drawIn = (sel = '.na-draw') => {
    const d = svg.createDrawable(q(sel))
    return animate(d, { draw: ['0 0', '0 1'], duration: 1100, delay: stagger(130), ease: 'inOutQuad' })
  }
  const fillIn = (delay = 900) => animate(q('.na-fill'), { opacity: [0, 1], duration: 600, delay, ease: 'outQuad' })
  animate(w, { opacity: [0, 1], duration: 300 })

  switch (choreo) {
    case 'bounce': {
      createTimeline({ onComplete: () => repeat(() => animate(w, { y: [{ to: -S * 0.4, duration: 300, ease: 'outQuad' }, { to: 0, duration: 760, ease: 'outBounce' }] }), 3600) })
        .add(w, { y: [above, 0], duration: 1500, ease: 'outBounce' }, 0)
        .add(w, { x: [-S * 1.8, 0], duration: 1500, ease: 'outQuad' }, 0)
        .add(body, { rotate: [-620, 0], duration: 1500, ease: 'outQuad' }, 0)
        .add(shadow, { opacity: [0, 0.14], scaleX: [0.3, 1], duration: 1500, ease: 'outQuad' }, 0)
      break
    }
    case 'drop': {
      createTimeline({ onComplete: float })
        .add(w, { y: [above, 0], duration: 1300, ease: 'outElastic(1, .65)' }, 0)
        .add(body, { rotate: [-35, 0], duration: 1300, ease: 'outElastic(1, .6)' }, 0)
        .add(shadow, { opacity: [0, 0.14], scaleX: [0.4, 1], duration: 900 }, 0)
      q('.na-steam').length && animate(svg.createDrawable(q('.na-steam')), { draw: ['0 0', '0 1', '1 1'], duration: 2400, delay: stagger(450, { start: 1200 }), loop: true, ease: 'inOutSine' })
      break
    }
    case 'flutter': {
      createTimeline({ onComplete: () => animate(body, { rotate: [-6, 6], alternate: true, loop: true, duration: 1800, ease: 'inOutSine' }) })
        .add(w, { x: [-S * 2, -S * 0.9, -S * 1.3, -S * 0.3, 0], y: [above, above * 0.55, above * 0.3, -S * 0.15, 0], duration: 2600, ease: 'inOutSine' }, 0)
        .add(body, { rotate: [-45, 25, -20, 10, 0], duration: 2600, ease: 'inOutSine' }, 0)
      shadow.length && animate(shadow, { opacity: [0, 0.14], duration: 2600 })
      break
    }
    case 'draw':
    case 'steam': {
      animate(w, { y: [S * 0.15, 0], duration: 900, ease: 'outQuart' })
      drawIn()
      fillIn()
      animate(q('.na-flash'), { opacity: [0, 0.9], duration: 500, delay: stagger(220, { start: 1300 }), ease: 'outQuad' })
      if (choreo === 'steam') animate(svg.createDrawable(q('.na-steam')), { draw: ['0 0', '0 1', '1 1'], duration: 2400, delay: stagger(420, { start: 1000 }), loop: true, ease: 'inOutSine' })
      if (q('.na-arm').length && kind === 'inkpen') animate(arms, { x: [-60, 0], y: [40, 0], duration: 1200, ease: 'inOutQuad' })
      shadow.length && animate(shadow, { opacity: [0, 0.14], duration: 900 })
      window.setTimeout(() => float(), 1600)
      break
    }
    case 'strike': {
      const strike = () =>
        createTimeline()
          .add(arms, { rotate: -55, duration: 380, ease: 'outQuad' })
          .add(arms, { rotate: 6, duration: 150, ease: 'inQuad' })
          .call(burst)
          .add(arms, { rotate: 0, duration: 260, ease: 'outQuad' })
      createTimeline({ onComplete: () => repeat(strike, 3800) })
        .add(w, { y: [S * 0.3, 0], opacity: [0, 1], duration: 600, ease: 'outBack' })
        .add(shadow, { opacity: [0, 0.14], duration: 400 }, 0)
        .call(() => {
          strike()
          window.setTimeout(strike, 900)
        })
      break
    }
    case 'drive': {
      const left = w.getBoundingClientRect().left + S * 1.4
      createTimeline({ onComplete: float })
        .add(w, { x: [-left, 0], duration: 1600, ease: 'outCubic' }, 0)
        .add(q('.na-wheel'), { rotate: [-1260, 0], duration: 1600, ease: 'outCubic' }, 0)
        .add(body, { rotate: [0, -2.5, 1, 0], duration: 600, ease: 'outQuad' }, 1450)
        .add(shadow, { opacity: [0, 0.14], duration: 800 }, 0)
      break
    }
    case 'swing': {
      createTimeline({ onComplete: () => animate(arms, { rotate: [-3, 3], alternate: true, loop: true, duration: 2200, ease: 'inOutSine' }) })
        .add(w, { y: [above, 0], duration: 900, ease: 'outBack' }, 0)
        .add(arms, { rotate: [30, -22, 14, -8, 4, 0], duration: 2400, ease: 'inOutSine' }, 300)
        .add(q('.na-flash'), { opacity: [0, 0.18], duration: 700 }, 1500)
        .add(shadow, { opacity: [0, 0.14], duration: 700 }, 0)
      break
    }
    case 'bloom': {
      animate(q('.na-petal'), { scale: [0, 1], opacity: [0, 1], duration: 900, delay: stagger(90), ease: 'outBack' })
      if (kind === 'lotus') animate(q('.na-petal'), { scaleY: [1, 1.06], alternate: true, loop: true, duration: 2400, delay: stagger(160, { start: 1400 }), ease: 'inOutSine' })
      else
        createTimeline({ onComplete: () => animate(body, { rotate: '+=360', loop: true, duration: 26000, ease: 'linear' }) }).add(body, { rotate: [-120, 0], duration: 1500, ease: 'outQuart' })
      break
    }
    case 'rise': {
      animate(body, { scale: [0, 1], duration: 900, ease: 'outElastic(1, .6)' })
      shadow.length && animate(shadow, { opacity: [0, 0.14], duration: 700 })
      q('.na-bubble').length && animate(q('.na-bubble'), { y: [0, -S * 0.35], opacity: [0, 0.9, 0], scale: [0.6, 1.1], duration: 1900, delay: stagger(330, { start: 700 }), loop: true, ease: 'outSine' })
      arms.length && animate(arms, { scaleY: [1, 1.12], scaleX: [1, 0.94], alternate: true, loop: true, duration: 300, ease: 'inOutSine' })
      sparks.length &&
        animate(sparks, { y: [0, -S * 0.45], x: () => [0, utils.random(-18, 18)], opacity: [0, 1, 0], scale: [1, 0.3], duration: 1500, delay: stagger(220, { start: 600 }), loop: true, ease: 'outQuad' })
      q('.na-bar').length && animate(q('.na-bar'), { scaleY: () => [utils.random(20, 50) / 100, 1], alternate: true, loop: true, duration: () => utils.random(260, 520), ease: 'inOutSine' })
      if (q('.na-fill').length && kind === 'drip') animate(q('.na-fill'), { scaleY: [0, 1], duration: 2400, ease: 'outQuad', delay: 600 })
      break
    }
    case 'spin': {
      animate(body, { scale: [0, 1], rotate: [-180, 0], duration: 1000, ease: 'outBack' })
      const speed = kind === 'sun' ? 24000 : kind === 'pizza' ? 14000 : kind === 'film' ? 5000 : kind === 'wrench' ? 0 : 3200
      if (speed) animate(q('.na-spin'), { rotate: '+=360', loop: true, duration: speed, ease: 'linear', delay: 900 })
      else repeat(() => animate(q('.na-spin'), { rotate: [0, -40, 10, 0], duration: 1200, ease: 'inOutQuad' }), 3000)
      q('.na-bubble').length && animate(q('.na-bubble'), { y: [0, -S * 0.2], opacity: [0, 1, 0], duration: 2200, delay: stagger(300, { start: 900 }), loop: true, ease: 'outSine' })
      break
    }
    case 'pulse': {
      animate(w, { opacity: [0, 1], duration: 400 })
      animate(svg.createDrawable(q('.na-draw')), { draw: ['0 0', '0 1', '1 1'], duration: 2200, loop: true, loopDelay: 500, ease: 'inOutSine' })
      sparks.length && repeat(burst, 900)
      arms.length && animate(arms, { x: [-2, 2], y: [1, -1], alternate: true, loop: true, duration: 90 })
      break
    }
    case 'stack': {
      const items = q('.na-stack')
      createTimeline({
        onComplete: () => repeat(() => items.length && animate(items[items.length - 1], { y: [{ to: -14, duration: 260, ease: 'outQuad' }, { to: 0, duration: 600, ease: 'outBounce' }] }), 3400),
      })
        .add(items, { y: [-160, 0], opacity: [0, 1], duration: 900, delay: stagger(170), ease: 'outBounce' }, 0)
        .add(shadow, { opacity: [0, 0.14], scaleX: [0.4, 1], duration: 900 }, 0)
      twinkle()
      break
    }
    case 'pop': {
      createTimeline({ onComplete: float }).add(body, { scale: [0, 1.15, 1], rotate: [-12, 0], duration: 900, ease: 'outBack' }).add(shadow, { opacity: [0, 0.14], duration: 500 }, 0)
      twinkle()
      arms.length && animate(arms, { scaleY: [1, 1.18], scaleX: [1, 0.9], alternate: true, loop: true, duration: 240, ease: 'inOutSine' })
      break
    }
    case 'snip': {
      const snip = () =>
        arms.forEach((a, i) => animate(a, { rotate: [0, (i ? 1 : -1) * 16, 0, (i ? 1 : -1) * 16, 0], duration: 700, ease: 'inOutQuad' }))
      createTimeline({ onComplete: () => repeat(snip, 3200) })
        .add(w, { x: [S * 1.6, 0], duration: 1000, ease: 'outCubic' })
        .call(snip)
      break
    }
    case 'steps': {
      const st = q('.na-step')
      animate(st, { opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 1], duration: 2600, delay: stagger(260), loop: true, loopDelay: 400, ease: 'inOutSine' })
      q('.na-body > circle').length && animate(q('.na-body > circle'), { y: [-4, 4], alternate: true, loop: true, duration: 1400, ease: 'inOutSine' })
      break
    }
    case 'flash': {
      createTimeline({ onComplete: () => repeat(() => animate(q('.na-flash'), { opacity: [0, 0.85, 0], duration: 520, ease: 'outQuad' }), 3600) })
        .add(body, { scale: [0, 1], duration: 800, ease: 'outBack' })
        .add(q('.na-flash'), { opacity: [0, 0.85, 0], duration: 520, ease: 'outQuad' })
        .add(shadow, { opacity: [0, 0.14], duration: 500 }, 0)
      break
    }
  }
  void spot
}
