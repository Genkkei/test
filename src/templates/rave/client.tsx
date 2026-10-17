'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Кислотный дизеринг: поле шума крупными «пикселями» проходит через матрицу Байера 8×8 —
 * получается однобитная картинка, как на флаерах и экранах старых пультов. Курсор прожигает пятно,
 * прокрутка разгоняет поле; редкие горизонтальные полосы сдвигаются — глитч. */
const DITHER = `
float b2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float b4(vec2 a){return b2(.5*a)*.25+b2(a);}
float b8(vec2 a){return b4(.5*a)*.25+b2(a);}
void main(){
  float px=3.;
  vec2 fc=gl_FragCoord.xy;
  float row=floor(fc.y/18.);
  float tick=floor(uTime*7.);
  float g=step(.965,hash(vec2(row,tick)));
  fc.x+=g*(hash(vec2(row+3.,tick))-.5)*120.;
  vec2 cell=floor(fc/px)*px;
  vec2 p=(cell-.5*uRes)/uRes.y;
  float t=uTime*.12+uScroll*2.;
  float f=fbm(p*1.6+vec2(t,-t*.6))*.6+.5;
  f+=.25*sin(p.x*3.+t*2.)*sin(p.y*2.-t);
  vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);
  f+=.55*exp(-6.*length(p-m));
  f+=abs(uVel)*.25;
  f=clamp(f*.95-.18,0.,1.);
  float on=step(b8(cell/px),f);
  vec3 col=mix(uC1,uC2,on);
  // редкие белые «искры» и сдвиг канала на глитч-полосах
  col=mix(col,uC3,g*on*.6);
  float scan=.92+.08*sin(gl_FragCoord.y*1.6);
  col*=scan;
  gl_FragColor=vec4(col,1.);
}`

export function DitherCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={DITHER} colors={colors} className="rv-canvas" maxDpr={1} />
}

/** Строка состояния в шапке: время Ташкента и «LIVE», если клуб сейчас открыт по часам. */
export function Live({ open, close }: { open: number; close: number }) {
  const [state, setState] = useState({ time: '--:--', on: false })
  useEffect(() => {
    const f = () => {
      const d = new Date()
      const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' }).format(d)
      const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Tashkent' }).format(d))
      const on = close > open ? h >= open && h < close : h >= open || h < close
      setState({ time, on })
    }
    f()
    const id = setInterval(f, 20000)
    return () => clearInterval(id)
  }, [open, close])
  return (
    <span className="rv-live" data-on={state.on || undefined} suppressHydrationWarning>
      <i aria-hidden="true" />
      {state.on ? 'LIVE' : 'OFF'} · TAS {state.time}
    </span>
  )
}

/** Текст, который на наведении перебирает символы и собирается обратно — терминальный эффект. */
const GLYPHS = '█▓▒░/\\<>01#*+=—§¤※'
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const run = () => {
    const el = ref.current
    if (!el || document.documentElement.classList.contains('reduce-motion')) return
    let frame = 0
    const total = 18
    const tick = () => {
      el.textContent = text
        .split('')
        .map((c, i) => (c === ' ' || i < (frame / total) * text.length ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join('')
      if (++frame <= total) requestAnimationFrame(tick)
      else el.textContent = text
    }
    tick()
  }
  return (
    <span ref={ref} className={className} onPointerEnter={run} aria-label={text}>
      {text}
    </span>
  )
}
