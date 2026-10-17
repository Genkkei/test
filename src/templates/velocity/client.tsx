'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Полосы скорости: дорожки разной длины летят по диагонали, от прокрутки разгоняются.
 * Редкие дорожки — неоновые, остальные — серые; у курсора — мягкий ореол. */
const SPEED = `
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  p*=rot(.22);
  float v=clamp(abs(uVel)*4.,0.,3.);
  float lanes=34.;
  float ly=p.y*lanes;
  float lane=floor(ly);
  float r=hash(vec2(lane,7.31));
  float r2=hash(vec2(lane,1.7));
  float t=uTime*(.12+r*.25)*(1.+v*2.5);
  float x=fract(p.x*(.18+r2*.25)-t+r*13.);
  float len=.12+r2*.45+v*.15;
  float streak=smoothstep(0.,.015,x)*smoothstep(len,0.,x);
  float w=1.-smoothstep(.05,.45,abs(fract(ly)-.5));
  float on=step(.55,hash(vec2(lane,3.3)));
  float neon=step(.86,r);
  vec3 col=uC1;
  col+=mix(uC4*1.6,uC2,neon)*streak*w*on*(.55+neon*.9);
  vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);
  vec2 q=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  col+=uC2*.22*exp(-5.*length(q-m));
  col*=1.-.6*pow(length(uv-.5),2.);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.04;
  gl_FragColor=vec4(col,1.);
}`

export function SpeedCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={SPEED} colors={colors} className="v-canvas" maxDpr={1} scale={0.75} />
}

/** Наклон крупной типографики от скорости прокрутки: CSS-переменная --skew на корне шаблона. */
export function SkewDriver() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.tpl-velocity')
    if (!root || document.documentElement.classList.contains('reduce-motion')) return
    let last = scrollY
    let skew = 0
    let raf = 0
    const loop = () => {
      const y = scrollY
      const v = Math.max(-60, Math.min(60, y - last))
      last = y
      skew += (v * 0.12 - skew) * 0.12
      root.style.setProperty('--skew', `${skew.toFixed(3)}deg`)
      root.style.setProperty('--speed', Math.min(1, Math.abs(skew) / 5).toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return null
}

/** Шапка с живым статусом «открыто/закрыто» по часам клуба (Ташкент, UTC+5). */
export function OpenStatus({ open, close }: { open: number; close: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Tashkent' }).format(new Date()))
    const on = close > open ? h >= open && h < close : h >= open || h < close
    if (ref.current) {
      ref.current.dataset.on = on ? '1' : '0'
      ref.current.lastChild!.textContent = on ? 'Клуб открыт' : 'Сейчас закрыто'
    }
  }, [open, close])
  return (
    <span ref={ref} className="v-status" suppressHydrationWarning>
      <i aria-hidden="true" />
      <span>Часы работы</span>
    </span>
  )
}
