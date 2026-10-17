'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Солнце сквозь ганчевую решётку: пятно тёплого света медленно ползёт по стене,
 * тень решётки размыта тем сильнее, чем дальше от «окна», поверх — дрожь листвы. */
const LATTICE = `
float lat(vec2 p){
  vec2 g=fract(p)-.5;
  float d=min(abs(g.x),abs(g.y));
  d=min(d,abs(abs(g.x)+abs(g.y)-.5)*.7071);
  return d;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime*.03;
  vec2 c=vec2(.35+.12*sin(t*1.3),.18+.06*cos(t))+(uMouse-.5)*.06;
  vec2 q=p-c;
  q=mat2(.92,-.38,.38,.92)*q*vec2(1.,1.35);
  float patch=smoothstep(.95,.15,length(q));
  float blur=.015+.09*length(q);
  float sh=smoothstep(.035,.035+blur,lat(q*4.2+vec2(t*.6,0.)));
  float leaf=fbm(p*2.2+vec2(t*2.,-t*1.4))*.5+.5;
  sh*=mix(.72,1.,smoothstep(.35,.7,leaf));
  float light=patch*sh;
  vec3 wall=mix(uC1*.92,uC2,uv.y*.6);
  vec3 sun=mix(uC2*1.08,uC3*1.25+.08,.35);
  vec3 col=mix(wall,sun,light*.85);
  col*=1.-.28*length(uv-vec2(.5,.55));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.025;
  gl_FragColor=vec4(col,1.);
}`

export function LatticeLight({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={LATTICE} colors={colors} className="su-canvas" maxDpr={1.25} scale={0.75} />
}

/** Шапка: прозрачная над первым экраном, после прокрутки — на фоне стены. */
export function SuiteHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 60)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="su-header">
      {children}
    </header>
  )
}

/** Полоса бронирования, как у Aman: даты и гости, кнопка ведёт в контакт с выбранным. */
export function BookingBar({ href, labels }: { href: string; labels: { in: string; out: string; guests: string; go: string; g: string[] } }) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [g, setG] = useState('2')
  useEffect(() => {
    const d = new Date()
    const iso = (x: Date) => x.toISOString().slice(0, 10)
    setA(iso(d))
    d.setDate(d.getDate() + 2)
    setB(iso(d))
  }, [])
  const link = href.startsWith('http') ? `${href}${href.includes('?') ? '&' : '?'}text=${encodeURIComponent(`${a} — ${b}, ${g}`)}` : href
  return (
    <form className="su-book" onSubmit={(e) => e.preventDefault()}>
      <label>
        <span>{labels.in}</span>
        <input type="date" value={a} onChange={(e) => setA(e.target.value)} />
      </label>
      <label>
        <span>{labels.out}</span>
        <input type="date" value={b} onChange={(e) => setB(e.target.value)} />
      </label>
      <label>
        <span>{labels.guests}</span>
        <select value={g} onChange={(e) => setG(e.target.value)}>
          {labels.g.map((x, i) => (
            <option key={x} value={String(i + 1)}>
              {x}
            </option>
          ))}
        </select>
      </label>
      <a className="su-book__go" href={link}>
        {labels.go}
      </a>
    </form>
  )
}

/** Лента моментов: секция закрепляется, вертикальная прокрутка ведёт кадры вбок. */
export function Drift({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current!
    const tr = track.current!
    if (!window.matchMedia('(min-width: 861px)').matches || document.documentElement.classList.contains('reduce-motion')) return
    el.classList.add('is-pinned')
    let raf = 0
    const size = () => {
      el.style.height = `${tr.scrollWidth - window.innerWidth + window.innerHeight}px`
    }
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const max = el.offsetHeight - window.innerHeight
        const k = Math.min(1, Math.max(0, -r.top / Math.max(1, max)))
        tr.style.transform = `translate3d(${-k * (tr.scrollWidth - window.innerWidth)}px,0,0)`
      })
    }
    size()
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', size)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', size)
      el.classList.remove('is-pinned')
      el.style.height = ''
      tr.style.transform = ''
    }
  }, [])
  return (
    <div ref={box} className="su-drift">
      <div className="su-drift__stage">
        <div ref={track} className="su-drift__track">
          {children}
        </div>
      </div>
    </div>
  )
}
