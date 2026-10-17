'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/*
 * Северное сияние: три занавеса, у каждого своя линия основания из шума и вертикальные
 * лучи; цвета — акцент темы и два его оттенка (перестановка каналов), чтобы палитра
 * следовала за темой из админки. Сверху — редкие звёзды, снизу уход в фон.
 */
const AURORA = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2(uv.x*asp,uv.y);
  float t=uTime*.07;
  vec3 col=uC1;
  vec3 a1=uC2;
  vec3 a2=clamp(uC2.gbr*1.25+vec3(0.,.12,.08),0.,1.);
  vec3 a3=clamp(mix(uC2,vec3(1.,.38,.72),.6),0.,1.);
  float mx=(uMouse.x-.5)*.25;
  for(int i=0;i<3;i++){
    float fi=float(i);
    float x=p.x*(.75+fi*.22)+mx+fi*1.9;
    float base=.42+fi*.07+.17*snoise(vec2(x*.55+t*(1.+fi*.4),fi*3.1))+.04*sin(x*3.+t*5.)+uScroll*.35;
    float d=uv.y-base;
    float rays=.45+.55*smoothstep(-.4,.9,snoise(vec2(x*9.,t*2.+fi)));
    float body=smoothstep(-.015,.03,d)*exp(-max(d,0.)*(3.2+fi*1.3));
    float edge=exp(-abs(d)*60.)*.6;
    vec3 c=fi<.5?a1:(fi<1.5?a2:a3);
    col+=c*(body*rays*.85+edge)*(.75-fi*.12);
  }
  // звёзды
  vec2 g=floor(gl_FragCoord.xy/3.);
  float s=step(.9965,hash(g));
  col+=vec3(s)*.55*(.5+.5*sin(uTime*2.+hash(g+1.)*30.))*smoothstep(.35,.9,uv.y);
  col=mix(col,uC1,smoothstep(.32,0.,uv.y));
  col*=1.-.25*length(uv-vec2(.5,.6));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.025;
  gl_FragColor=vec4(col,1.);
}`

export function AuroraCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={AURORA} colors={colors} className="aurora-canvas" maxDpr={1} scale={0.7} />
}

/** Телефон наклоняется за курсором; на сенсорных экранах стоит ровно. */
export function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (document.documentElement.classList.contains('reduce-motion')) return
    const el = ref.current!
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0
    const loop = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      el.style.setProperty('--rx', `${cy.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${cx.toFixed(2)}deg`)
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(loop) : 0
    }
    const move = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 18
      ty = -(e.clientY / innerHeight - 0.5) * 12
      if (!raf) raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Шапка-капсула: стекло появляется после начала прокрутки. */
export function AuroraHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="aurora-header">
      {children}
    </header>
  )
}

/** Подсветка карточки бенто за курсором (как у Stripe и Linear). */
export function Glow({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--gx', `${e.clientX - r.left}px`)
      el.style.setProperty('--gy', `${e.clientY - r.top}px`)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
