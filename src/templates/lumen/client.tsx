'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Светящиеся поля: четыре мягких гауссовых пятна дрейфуют по светлому фону,
 * пространство чуть изгибает шум — как свечение у Oura. Дёшево: два вызова шума на пиксель. */
const GLOW = `
vec3 field(vec2 p, vec2 c, vec3 col, float k){ float d=length(p-c); return col*exp(-d*d*k); }
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv; p.x*=uRes.x/uRes.y;
  float t=uTime*.07;
  p+=vec2(snoise(p*1.3+t),snoise(p*1.3-t+3.))*.06;
  float ar=uRes.x/uRes.y;
  vec2 m=vec2(uMouse.x*ar,uMouse.y);
  vec3 mint=mix(uC2,vec3(.75,1.,.95),.25);
  vec3 sky=vec3(.55,.78,1.);
  vec3 pale=mix(uC2,vec3(.85,.95,1.),.6);
  vec3 col=uC1;
  vec3 g=vec3(0.);
  g+=field(p,vec2(ar*.78+.12*sin(t*1.3),.62+.10*cos(t)),mint,3.2);
  g+=field(p,vec2(ar*.30+.14*cos(t*.9),.25+.08*sin(t*1.7)),sky,3.8);
  g+=field(p,vec2(ar*.55+.2*sin(t*.6),.95+.06*cos(t*1.1)),pale,2.6);
  g+=field(p,mix(vec2(ar*.6,.5),m,.6),mint*.8,7.);
  float a=clamp(max(g.r,max(g.g,g.b)),0.,1.);
  col=mix(col,g/max(a,.001),a*.62);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.018;
  gl_FragColor=vec4(col,1.);
}`

export function GlowCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={GLOW} colors={colors} className="lumen-canvas" maxDpr={1} scale={0.6} />
}

/** Плавающая шапка-капсула: над первым экраном прозрачная, дальше — белая с тенью. */
export function LumenHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-raised', window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="lumen-header">
      {children}
    </header>
  )
}

/** Слова-«капсулы» первого экрана: подсвечивается одна за другой. */
export function Pills({ words, label }: { words: string[]; label: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2200)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <ul className="lumen-pills" aria-label={label}>
      {words.map((w, j) => (
        <li key={w} className={j === i ? 'is-on' : ''}>
          {w}
        </li>
      ))}
    </ul>
  )
}

/** Обход общей среды движения: шторка clip-path: inset(100% …) даёт элементу нулевую видимую
 *  площадь, и общий IntersectionObserver никогда не помечает его .is-in. Здесь наблюдается
 *  родитель шторки, у которого обрезки нет. */
export function ClipReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.tpl-lumen [data-reveal="clip"]')]
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
