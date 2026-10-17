'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Линованная бумага реестра: строки медленно плывут вверх и расступаются вокруг курсора,
 * поля отбиты синей линией. Одна функция на пиксель, без шума. */
const PAPER = `
void main(){
  vec2 px=gl_FragCoord.xy;
  vec2 m=uMouse*uRes;
  vec2 d=px-m;
  float R=uRes.y*.22;
  float push=exp(-dot(d,d)/(R*R))*uRes.y*.035;
  float sp=uRes.y/22.;
  float y=px.y+push*sign(d.y)+uTime*sp*.06+uScroll*uRes.y*.4;
  float k=abs(fract(y/sp)-.5)*sp;
  float line=1.-smoothstep(.0,1.15,k-.0);
  vec3 col=uC1;
  col=mix(col,uC2,line*.9);
  float mx=uRes.x*.052;
  float mOn=step(900.,uRes.x);
  float margin=1.-smoothstep(.0,1.2,abs(px.x-mx-push*.6*sign(d.x)));
  col=mix(col,uC3,margin*.75*mOn);
  float fade=smoothstep(.0,.35,px.y/uRes.y);
  col=mix(uC1,col,.35+.65*fade);
  gl_FragColor=vec4(col,1.);
}`

export function PaperCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={PAPER} colors={colors} className="ledger-canvas" maxDpr={1.5} />
}

/** Вертикальная линейка слева: деления и бегунок, который показывает, где вы в документе. */
export function Ruler() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
        const p = scrollY / max
        el.style.setProperty('--p', String(p))
        const label = el.querySelector('b')
        if (label) label.textContent = String(Math.round(p * 100)).padStart(3, '0')
      })
    }
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <div ref={ref} className="ledger-ruler" aria-hidden="true">
      <span className="ledger-ruler__mark">
        <b>000</b>
      </span>
    </div>
  )
}

/** Курсивное «голосовое» слово первого экрана: слова сменяются слотом снизу вверх. */
export function Voice({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2800)
    return () => clearInterval(id)
  }, [words.length])
  if (!words.length) return null
  return (
    <em className="ledger-voice">
      <span key={i}>{words[i]}</span>
    </em>
  )
}

/** Обход общей среды движения: шторка clip-path: inset(100% …) даёт элементу нулевую видимую
 *  площадь, и общий IntersectionObserver никогда не помечает его .is-in. Здесь наблюдается
 *  родитель шторки, у которого обрезки нет. */
export function ClipReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.tpl-ledger [data-reveal="clip"]')]
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
