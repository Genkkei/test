'use client'

import { useEffect } from 'react'
import { ACTORS, type Choreo } from './actors'

/*
 * Герой первого экрана на Motion: предмет ниши появляется со своей хореографией и остаётся рядом с
 * заголовком — справа от последней строки, справа от блока, над ним или в углу первого экрана,
 * смотря где свободно (текст, кнопки и фото он не закрывает). Нажатия проходят сквозь него.
 * При «уменьшить движение» — просто стоит на месте.
 *
 * Раньше был anime.js, и бесконечные движения (покачивание, пар, искры, setInterval) шли всё время —
 * и когда первый экран давно прокручен, и в скрытой вкладке; на телефоне это постоянная нагрузка.
 * Теперь Motion грузится отдельно, уже после отрисовки, вступление играет один раз, а всё
 * повторяющееся стоит на паузе, пока первый экран не в кадре или вкладка скрыта (см. Stage).
 * Трансформации пишем сами (Stage.paint), а Motion ведёт числа: так сохраняются точки вращения
 * из рисунков (transform-origin у na-body, na-arm, na-spin) — и в Safari, и в Chrome.
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

    let stage: Stage | null = null
    let started = false
    let gone = false

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
    const start = window.setTimeout(async () => {
      hero.appendChild(wrap)
      const p = position()
      if (!p) return
      started = true
      if (still) {
        wrap.style.opacity = '1'
        return
      }
      const motion = await import('motion')
      if (gone) return
      stage = new Stage(motion, hero)
      choreograph(stage, actor.choreo, kind, wrap, p.S)
    }, 750)

    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => started && position())
    }
    window.addEventListener('resize', onResize)
    return () => {
      gone = true
      clearTimeout(start)
      window.removeEventListener('resize', onResize)
      stage?.stop()
      wrap.remove()
    }
  }, [kind, colors.a, colors.f, colors.b])
  return null
}

/* ── Сцена: числа ведёт Motion, трансформации пишем сами, повторы спят вне кадра ─────────────── */

type MotionLib = typeof import('motion')
type Ctl = { pause(): void; play(): void; stop(): void; finished: Promise<unknown> }
type Key = 'x' | 'y' | 'rotate' | 'scale' | 'scaleX' | 'scaleY' | 'opacity' | 'draw0' | 'draw1'
type Val = number | number[] | ((el: Element, i: number) => number | number[])
type Opts = { duration?: number; delay?: number | ((i: number) => number); ease?: Ease; repeat?: number; reverse?: boolean; repeatDelay?: number }
type Ease = string | readonly number[] | ((t: number) => number)

// изинги anime.js, которых нет в Motion
const outBounce = (t: number) => {
  const n = 7.5625
  const d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}
const outElastic = (period: number) => (t: number) => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin(((t - period / 4) * (2 * Math.PI)) / period) + 1)
const E = {
  sine: [0.37, 0, 0.63, 1],
  outQuad: [0.5, 1, 0.89, 1],
  inQuad: [0.11, 0, 0.5, 0],
  inOutQuad: [0.45, 0, 0.55, 1],
  outCubic: [0.33, 1, 0.68, 1],
  outQuart: [0.25, 1, 0.5, 1],
  outSine: [0.61, 1, 0.88, 1],
  outBack: 'backOut',
  bounce: outBounce,
  elastic: outElastic(0.45),
  linear: 'linear',
} as const
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

class Stage {
  private state = new WeakMap<Element, Record<Key, number>>()
  private dirty = new Set<Element>()
  private raf = 0
  private loops = new Set<Ctl>()
  private timers = new Set<number>()
  private active = true
  private waiting: (() => void)[] = []
  private io: IntersectionObserver
  private onVis = () => this.wake()
  constructor(
    private m: MotionLib,
    hero: HTMLElement,
  ) {
    this.io = new IntersectionObserver(([e]) => this.wake(e.isIntersecting), { threshold: 0 })
    this.io.observe(hero)
    document.addEventListener('visibilitychange', this.onVis)
  }
  private inView = true
  private wake(inView?: boolean) {
    if (inView !== undefined) this.inView = inView
    const on = this.inView && !document.hidden
    if (on === this.active) return
    this.active = on
    this.loops.forEach((c) => (on ? c.play() : c.pause()))
    if (on) this.waiting.splice(0).forEach((f) => f())
  }
  private s(el: Element) {
    let t = this.state.get(el)
    if (!t) this.state.set(el, (t = { x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: NaN, draw0: NaN, draw1: NaN }))
    return t
  }
  private paint = () => {
    this.raf = 0
    for (const el of this.dirty) {
      const t = this.s(el)
      const st = (el as HTMLElement | SVGElement).style
      st.transform = `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg) scale(${t.scale * t.scaleX}, ${t.scale * t.scaleY})`
      if (!Number.isNaN(t.opacity)) st.opacity = String(t.opacity)
      if (!Number.isNaN(t.draw1)) {
        const len = (el as SVGGeometryElement).getTotalLength?.() || 0
        const a = Number.isNaN(t.draw0) ? 0 : t.draw0
        st.strokeDasharray = `0 ${a * len} ${Math.max(0, t.draw1 - a) * len} ${len * 2}`
      }
    }
    this.dirty.clear()
  }
  private set(el: Element, k: Key, v: number) {
    this.s(el)[k] = v
    this.dirty.add(el)
    if (!this.raf) this.raf = requestAnimationFrame(this.paint)
  }
  /** Анимация свойств у набора элементов. loop — повторяется бесконечно и спит вне кадра. */
  to(targets: Element | Element[], props: Partial<Record<Key, Val>>, o: Opts = {}): Promise<void> {
    const els = (Array.isArray(targets) ? targets : [targets]).filter(Boolean)
    const all: Promise<unknown>[] = []
    els.forEach((el, i) => {
      for (const [k, raw] of Object.entries(props) as [Key, Val][]) {
        const v = typeof raw === 'function' ? raw(el, i) : raw
        const cur = this.s(el)[k]
        const kf = Array.isArray(v) ? v : [Number.isNaN(cur) ? (k === 'opacity' || k === 'draw1' ? 1 : 0) : cur, v]
        const mv = this.m.motionValue(kf[0])
        mv.on('change', (x: number) => this.set(el, k, x))
        this.set(el, k, kf[0])
        const loop = o.repeat === Infinity
        const c = this.m.animate(mv, kf, {
          duration: o.duration ?? 1,
          delay: typeof o.delay === 'function' ? o.delay(i) : (o.delay ?? 0),
          ease: (o.ease ?? E.outQuad) as never,
          repeat: o.repeat,
          repeatType: o.reverse ? 'reverse' : 'loop',
          repeatDelay: o.repeatDelay,
        }) as unknown as Ctl
        if (loop) {
          this.loops.add(c)
          if (!this.active) c.pause()
        } else all.push(c.finished)
      }
    })
    return Promise.all(all).then(() => undefined)
  }
  loop(targets: Element | Element[], props: Partial<Record<Key, Val>>, o: Opts = {}) {
    return this.to(targets, props, { ...o, repeat: Infinity })
  }
  /** Повтор раз в ms — только пока первый экран в кадре (раньше setInterval шёл всегда). */
  every(fn: () => void, ms: number) {
    const tick = () => {
      if (this.stopped) return
      if (!this.active) return void this.waiting.push(() => this.timers.add(window.setTimeout(tick, ms)))
      fn()
      this.timers.add(window.setTimeout(tick, ms))
    }
    this.timers.add(window.setTimeout(tick, ms))
  }
  later(fn: () => void, ms: number) {
    this.timers.add(window.setTimeout(() => !this.stopped && fn(), ms))
  }
  stagger(step: number, start = 0) {
    return (i: number) => start + i * step
  }
  private stopped = false
  stop() {
    this.stopped = true
    this.loops.forEach((c) => c.stop())
    this.timers.forEach((t) => clearTimeout(t))
    this.io.disconnect()
    document.removeEventListener('visibilitychange', this.onVis)
    cancelAnimationFrame(this.raf)
  }
}

function choreograph(st: Stage, choreo: Choreo, kind: string, w: HTMLElement, S: number) {
  const q = (s: string) => [...w.querySelectorAll<SVGElement>(s)]
  const body = q('.na-body')
  const shadow = q('.na-shadow')
  const sparks = q('.na-spark')
  const arms = q('.na-arm')
  const above = -(w.getBoundingClientRect().top + S * 1.2) // старт над краем экрана
  const float = () => st.loop(w, { y: [0, -S * 0.05] }, { reverse: true, duration: 2.2, ease: E.sine })
  const burst = () =>
    st.to(sparks, { x: () => [0, rnd(-S * 0.45, S * 0.45)], y: () => [0, rnd(-S * 0.5, -S * 0.05)], opacity: [1, 0], scale: [1, 0.2] }, { duration: rnd(0.45, 0.85), ease: E.outQuad })
  const twinkle = () => st.loop(sparks, { scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }, { duration: 1.3, delay: st.stagger(0.38), repeatDelay: 0.7, ease: E.sine })
  const draw = (els: Element[], o: Opts, erase = false) => (erase ? st.to(els, { draw0: [0, 0, 1], draw1: [0, 1, 1] }, o) : st.to(els, { draw1: [0, 1] }, o))
  const drawLoop = (els: Element[], o: Opts) => st.loop(els, { draw0: [0, 0, 1], draw1: [0, 1, 1] }, o)
  const fillIn = (delay = 0.9) => st.to(q('.na-fill'), { opacity: [0, 1] }, { duration: 0.6, delay, ease: E.outQuad })
  const shade = (to = 0.14, duration = 0.9, extra: Partial<Record<Key, Val>> = {}) => shadow.length && st.to(shadow, { opacity: [0, to], ...extra }, { duration, ease: E.outQuad })
  st.to(w, { opacity: [0, 1] }, { duration: 0.3 })

  switch (choreo) {
    case 'bounce': {
      const hop = () => st.to(w, { y: [0, -S * 0.4] }, { duration: 0.3, ease: E.outQuad }).then(() => st.to(w, { y: [-S * 0.4, 0] }, { duration: 0.76, ease: E.bounce }))
      Promise.all([
        st.to(w, { y: [above, 0] }, { duration: 1.5, ease: E.bounce }),
        st.to(w, { x: [-S * 1.8, 0] }, { duration: 1.5, ease: E.outQuad }),
        st.to(body, { rotate: [-620, 0] }, { duration: 1.5, ease: E.outQuad }),
        shade(0.14, 1.5, { scaleX: [0.3, 1] }),
      ]).then(() => st.every(hop, 3600))
      break
    }
    case 'drop': {
      Promise.all([st.to(w, { y: [above, 0] }, { duration: 1.3, ease: outElastic(0.65) }), st.to(body, { rotate: [-35, 0] }, { duration: 1.3, ease: outElastic(0.6) }), shade(0.14, 0.9, { scaleX: [0.4, 1] })]).then(float)
      const steam = q('.na-steam')
      if (steam.length) drawLoop(steam, { duration: 2.4, delay: st.stagger(0.45, 1.2), ease: E.sine })
      break
    }
    case 'flutter': {
      st.to(w, { x: [-S * 2, -S * 0.9, -S * 1.3, -S * 0.3, 0], y: [above, above * 0.55, above * 0.3, -S * 0.15, 0] }, { duration: 2.6, ease: E.sine })
      st.to(body, { rotate: [-45, 25, -20, 10, 0] }, { duration: 2.6, ease: E.sine }).then(() => st.loop(body, { rotate: [-6, 6] }, { reverse: true, duration: 1.8, ease: E.sine }))
      shade(0.14, 2.6)
      break
    }
    case 'draw':
    case 'steam': {
      st.to(w, { y: [S * 0.15, 0] }, { duration: 0.9, ease: E.outQuart })
      draw(q('.na-draw'), { duration: 1.1, delay: st.stagger(0.13), ease: E.inOutQuad })
      fillIn()
      st.to(q('.na-flash'), { opacity: [0, 0.9] }, { duration: 0.5, delay: st.stagger(0.22, 1.3), ease: E.outQuad })
      if (choreo === 'steam') drawLoop(q('.na-steam'), { duration: 2.4, delay: st.stagger(0.42, 1), ease: E.sine })
      if (arms.length && kind === 'inkpen') st.to(arms, { x: [-60, 0], y: [40, 0] }, { duration: 1.2, ease: E.inOutQuad })
      shade()
      st.later(float, 1600)
      break
    }
    case 'strike': {
      const strike = () =>
        st
          .to(arms, { rotate: -55 }, { duration: 0.38, ease: E.outQuad })
          .then(() => st.to(arms, { rotate: 6 }, { duration: 0.15, ease: E.inQuad }))
          .then(() => (burst(), st.to(arms, { rotate: 0 }, { duration: 0.26, ease: E.outQuad })))
      Promise.all([st.to(w, { y: [S * 0.3, 0], opacity: [0, 1] }, { duration: 0.6, ease: E.outBack }), shade(0.14, 0.4)]).then(() => {
        strike()
        st.later(strike, 900)
        st.every(strike, 3800)
      })
      break
    }
    case 'drive': {
      const left = w.getBoundingClientRect().left + S * 1.4
      Promise.all([
        st.to(w, { x: [-left, 0] }, { duration: 1.6, ease: E.outCubic }),
        st.to(q('.na-wheel'), { rotate: [-1260, 0] }, { duration: 1.6, ease: E.outCubic }),
        st.to(body, { rotate: [0, -2.5, 1, 0] }, { duration: 0.6, delay: 1.45, ease: E.outQuad }),
        shade(0.14, 0.8),
      ]).then(float)
      break
    }
    case 'swing': {
      st.to(w, { y: [above, 0] }, { duration: 0.9, ease: E.outBack })
      st.to(arms, { rotate: [30, -22, 14, -8, 4, 0] }, { duration: 2.4, delay: 0.3, ease: E.sine }).then(() => st.loop(arms, { rotate: [-3, 3] }, { reverse: true, duration: 2.2, ease: E.sine }))
      st.to(q('.na-flash'), { opacity: [0, 0.18] }, { duration: 0.7, delay: 1.5 })
      shade(0.14, 0.7)
      break
    }
    case 'bloom': {
      const petals = q('.na-petal')
      st.to(petals, { scale: [0, 1], opacity: [0, 1] }, { duration: 0.9, delay: st.stagger(0.09), ease: E.outBack })
      if (kind === 'lotus') st.loop(petals, { scaleY: [1, 1.06] }, { reverse: true, duration: 2.4, delay: st.stagger(0.16, 1.4), ease: E.sine })
      else st.to(body, { rotate: [-120, 0] }, { duration: 1.5, ease: E.outQuart }).then(() => st.loop(body, { rotate: [0, 360] }, { duration: 26, ease: E.linear }))
      break
    }
    case 'rise': {
      st.to(body, { scale: [0, 1] }, { duration: 0.9, ease: outElastic(0.6) })
      shade(0.14, 0.7)
      const bub = q('.na-bubble')
      if (bub.length) st.loop(bub, { y: [0, -S * 0.35], opacity: [0, 0.9, 0], scale: [0.6, 1.1] }, { duration: 1.9, delay: st.stagger(0.33, 0.7), ease: E.outSine })
      if (arms.length) st.loop(arms, { scaleY: [1, 1.12], scaleX: [1, 0.94] }, { reverse: true, duration: 0.3, ease: E.sine })
      if (sparks.length) st.loop(sparks, { y: [0, -S * 0.45], x: () => [0, rnd(-18, 18)], opacity: [0, 1, 0], scale: [1, 0.3] }, { duration: 1.5, delay: st.stagger(0.22, 0.6), ease: E.outQuad })
      const bars = q('.na-bar')
      bars.forEach((b) => st.loop(b, { scaleY: [rnd(0.2, 0.5), 1] }, { reverse: true, duration: rnd(0.26, 0.52), ease: E.sine }))
      if (kind === 'drip') st.to(q('.na-fill'), { scaleY: [0, 1] }, { duration: 2.4, delay: 0.6, ease: E.outQuad })
      break
    }
    case 'spin': {
      st.to(body, { scale: [0, 1], rotate: [-180, 0] }, { duration: 1, ease: E.outBack })
      const speed = kind === 'sun' ? 24 : kind === 'pizza' ? 14 : kind === 'film' ? 5 : kind === 'wrench' ? 0 : 3.2
      const spin = q('.na-spin')
      if (speed) st.loop(spin, { rotate: [0, 360] }, { duration: speed, delay: 0.9, ease: E.linear })
      else st.every(() => st.to(spin, { rotate: [0, -40, 10, 0] }, { duration: 1.2, ease: E.inOutQuad }), 3000)
      const bub = q('.na-bubble')
      if (bub.length) st.loop(bub, { y: [0, -S * 0.2], opacity: [0, 1, 0] }, { duration: 2.2, delay: st.stagger(0.3, 0.9), ease: E.outSine })
      break
    }
    case 'pulse': {
      drawLoop(q('.na-draw'), { duration: 2.2, repeatDelay: 0.5, ease: E.sine })
      if (sparks.length) st.every(burst, 900)
      if (arms.length) st.loop(arms, { x: [-2, 2], y: [1, -1] }, { reverse: true, duration: 0.09, ease: E.linear })
      break
    }
    case 'stack': {
      const items = q('.na-stack')
      const top = items[items.length - 1]
      const hop = () => top && st.to(top, { y: [0, -14] }, { duration: 0.26, ease: E.outQuad }).then(() => st.to(top, { y: [-14, 0] }, { duration: 0.6, ease: E.bounce }))
      Promise.all([st.to(items, { y: [-160, 0], opacity: [0, 1] }, { duration: 0.9, delay: st.stagger(0.17), ease: E.bounce }), shade(0.14, 0.9, { scaleX: [0.4, 1] })]).then(() => st.every(hop, 3400))
      twinkle()
      break
    }
    case 'pop': {
      Promise.all([st.to(body, { scale: [0, 1.15, 1], rotate: [-12, 0] }, { duration: 0.9, ease: E.outBack }), shade(0.14, 0.5)]).then(float)
      twinkle()
      if (arms.length) st.loop(arms, { scaleY: [1, 1.18], scaleX: [1, 0.9] }, { reverse: true, duration: 0.24, ease: E.sine })
      break
    }
    case 'snip': {
      const snip = () => arms.forEach((a, i) => st.to(a, { rotate: [0, (i ? 1 : -1) * 16, 0, (i ? 1 : -1) * 16, 0] }, { duration: 0.7, ease: E.inOutQuad }))
      st.to(w, { x: [S * 1.6, 0] }, { duration: 1, ease: E.outCubic }).then(() => {
        snip()
        st.every(snip, 3200)
      })
      break
    }
    case 'steps': {
      st.loop(q('.na-step'), { opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 1] }, { duration: 2.6, delay: st.stagger(0.26), repeatDelay: 0.4, ease: E.sine })
      const dots = q('.na-body > circle')
      if (dots.length) st.loop(dots, { y: [-4, 4] }, { reverse: true, duration: 1.4, ease: E.sine })
      break
    }
    case 'flash': {
      const flash = () => st.to(q('.na-flash'), { opacity: [0, 0.85, 0] }, { duration: 0.52, ease: E.outQuad })
      shade(0.14, 0.5)
      st.to(body, { scale: [0, 1] }, { duration: 0.8, ease: E.outBack })
        .then(flash)
        .then(() => st.every(flash, 3600))
      break
    }
  }
}
