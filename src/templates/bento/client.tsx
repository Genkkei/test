'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'
import { pick } from '@/lib/i18n'

/** Свет за курсором на плитках: один слушатель на сетку пишет --mx/--my в плитку под курсором. */
export function Spot({ className, children }: { className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (!matchMedia('(hover: hover)').matches) return
    const move = (e: PointerEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-tile]')
      if (!tile || !el.contains(tile)) return
      const r = tile.getBoundingClientRect()
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`)
      tile.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => el.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Часы Ташкента с секундной полосой — живой виджет плитки. */
export function LiveClock({ lang }: { lang: string }) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const f = (o: Intl.DateTimeFormatOptions) => (now ? new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'ru-RU', { timeZone: 'Asia/Tashkent', ...o }).format(now) : '')
  const sec = now ? Number(f({ second: '2-digit' })) : 0
  return (
    <div className="bento-clock" suppressHydrationWarning>
      <span className="bento-clock__time">{now ? f({ hour: '2-digit', minute: '2-digit' }) : '—:—'}</span>
      <span className="bento-clock__date">{now ? (lang === 'uz' ? f({ day: 'numeric', month: '2-digit' }) : f({ weekday: 'long', day: 'numeric', month: 'long' })) : ' '}</span>
      <span className="bento-clock__bar" aria-hidden="true">
        <i style={{ transform: `scaleX(${sec / 59})` }} />
      </span>
    </div>
  )
}

const DAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

/** Открыто ли сейчас: по часам из business.hours во времени Ташкента (UTC+5). */
export function OpenDot({ hours, lang }: { hours: string[]; lang: string }) {
  const [open, setOpen] = useState<boolean | null>(null)
  useEffect(() => {
    const check = () => {
      const now = new Date(Date.now() + (5 * 60 + new Date().getTimezoneOffset()) * 60000)
      const di = ORDER.indexOf(DAY[now.getDay()])
      const m = now.getHours() * 60 + now.getMinutes()
      let ok = false
      for (const h of hours) {
        const mm = h.match(/^(\w\w)(?:-(\w\w))?\s+(\d\d):(\d\d)-(\d\d):(\d\d)/)
        if (!mm) continue
        const a = ORDER.indexOf(mm[1]), z = ORDER.indexOf(mm[2] || mm[1])
        if (di < a || di > z) continue
        const from = +mm[3] * 60 + +mm[4], to = +mm[5] * 60 + +mm[6]
        if (to <= from ? m >= from || m < to : m >= from && m < to) ok = true
        if (from === 0 && to === 0) ok = true
      }
      setOpen(ok)
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [hours])
  return (
    <span className={`bento-open${open ? ' is-on' : ''}`} suppressHydrationWarning>
      <i aria-hidden="true" />
      {open === null ? ' ' : open ? pick(lang, { ru: 'Сейчас открыто', uz: 'Hozir ochiq', en: 'Open now' }) : pick(lang, { ru: 'Сейчас закрыто', uz: 'Hozir yopiq', en: 'Closed now' })}
    </span>
  )
}

/** Лента «сейчас в хабе»: слова меняются снизу вверх, первое есть в HTML. */
export function Ticker({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2400)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="bento-ticker" aria-live="off">
      <span key={i} className="bento-ticker__w">
        {words[i]}
      </span>
    </span>
  )
}

/* Мягкое поле цвета, как фон карточек Apple/Linear: три пятна, которые медленно плывут. Дёшево:
   рисуется в половину разрешения. */
const AURA = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv*vec2(uRes.x/uRes.y,1.);
  float t=uTime*.12;
  float n=fbm(p*1.4+vec2(t,-t*.7)+uMouse*.6);
  vec2 a=vec2(.3+.2*sin(t*1.3),.4+.2*cos(t));
  vec2 b=vec2(.9+.25*cos(t*.9),.7+.15*sin(t*1.7));
  float fa=exp(-length(p-a)*2.2), fb=exp(-length(p-b)*2.)*.9;
  vec3 col=uC1;
  col=mix(col,uC2,clamp(fa+n*.35,0.,1.));
  col=mix(col,uC3,clamp(fb*.8,0.,1.));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.03;
  gl_FragColor=vec4(col,1.);
}`

export function Aura({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={AURA} colors={colors} className="bento-aura" scale={0.5} maxDpr={1} />
}
