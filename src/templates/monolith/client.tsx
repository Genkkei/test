'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Фасад: стекло между вертикальными ламелями и плитами перекрытий. Солнце ходит за курсором —
 * освещённая грань ламели меняется; в части окон тёплый свет. Всё на сетке, без шума кроме отражения неба. */
const FACADE = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float ar=uRes.x/uRes.y;
  float floors=9.;
  float fins=ar*7.;
  vec2 q=vec2(uv.x,uv.y+uScroll*.35+uTime*.004);
  vec2 cell=vec2(floor(q.x*fins),floor(q.y*floors));
  vec2 f=vec2(fract(q.x*fins),fract(q.y*floors));
  float sun=clamp(uMouse.x*2.-1.+sin(uTime*.12)*.25,-1.,1.);
  float sky=.5+.5*snoise(vec2(q.x*1.6,q.y*3.)+uTime*.03);
  vec3 glass=mix(uC4*.9,mix(uC4,uC2,.55),uv.y*.6+sky*.35);
  float lit=step(.84,hash(cell))*(.75+.25*sin(uTime*.4+hash(cell+3.)*6.28));
  glass=mix(glass,uC3*1.15,lit*smoothstep(.0,.15,f.y)*smoothstep(.85,.6,f.y)*.85);
  vec3 col=glass;
  float finW=.16;
  float inFin=step(f.x,finW);
  float side=f.x/finW;
  vec3 concrete=uC1*mix(.78,1.08,sun>0.?side:1.-side);
  col=mix(col,concrete,inFin);
  float sh=smoothstep(finW,finW+.35*abs(sun),f.x)*(1.-inFin);
  col*=sun>0.?1.:mix(.72,1.,sh);
  if(sun>0.) col*=mix(.72,1.,1.-smoothstep(1.-.35*sun,1.,f.x));
  float slab=step(f.y,.11);
  col=mix(col,uC2*mix(.85,1.05,f.y/.11),slab);
  col*=.92+.08*uv.y;
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.02;
  gl_FragColor=vec4(col,1.);
}`

export function FacadeCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={FACADE} colors={colors} className="mono-canvas" maxDpr={1.5} />
}

/** Строка координат и прокрутки в шапке: процент пройденного «этажа». */
export function Floor({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
        el.textContent = `${label} ${String(Math.round((scrollY / max) * 32)).padStart(2, '0')}/32`
      })
    }
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [label])
  return <span ref={ref} className="mono-floor" aria-hidden="true" suppressHydrationWarning />
}

/** Обход общей среды движения: шторка clip-path: inset(100% …) даёт элементу нулевую видимую
 *  площадь, и общий IntersectionObserver никогда не помечает его .is-in. Здесь наблюдается
 *  родитель шторки, у которого обрезки нет. */
export function ClipReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.tpl-monolith [data-reveal="clip"]')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          ;(e.target as HTMLElement & { __clip?: HTMLElement[] }).__clip?.forEach((el) => el.classList.add('is-in'))
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    for (const el of els) {
      const parent = el.parentElement as (HTMLElement & { __clip?: HTMLElement[] }) | null
      if (!parent) continue
      ;(parent.__clip ??= []).push(el)
      io.observe(parent)
    }
    return () => io.disconnect()
  }, [])
  return null
}
