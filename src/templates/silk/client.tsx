'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Чёрный шёлк: складки — синус, искривлённый шумом; нормаль из конечных разностей,
 * свет — диффуз + узкий блик, как у ткани. Шесть выборок шума на пиксель. */
const SILK = `
float silk(vec2 p){
  float t=uTime*.07;
  vec2 w=vec2(snoise(p*.6+vec2(t,0.)),snoise(p*.6+vec2(0.,-t)+4.3));
  p+=w*.6+(uMouse-.5)*vec2(.5,.3);
  return sin(p.x*2.3+p.y*1.2+snoise(p*1.15+t*.6)*1.7+uScroll*3.);
}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y*1.5;
  float e=.012;
  float h=silk(p),hx=silk(p+vec2(e,0.)),hy=silk(p+vec2(0.,e));
  vec3 n=normalize(vec3((h-hx)/e*.16,(h-hy)/e*.16,1.));
  vec3 l=normalize(vec3(-.5,.55,.65));
  float diff=clamp(dot(n,l),0.,1.);
  float spec=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),38.);
  vec3 col=mix(uC1*.55,uC2*1.6,pow(diff,1.6));
  col+=spec*(uC3*.55+.28);
  vec2 uv=gl_FragCoord.xy/uRes;
  col*=1.-.55*length(uv-vec2(.5,.45));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.035;
  gl_FragColor=vec4(col,1.);
}`

export function SilkCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={SILK} colors={colors} className="silk-canvas" maxDpr={1.25} />
}

/** Сменяющиеся слова первого экрана: первое есть в HTML, остальные приходят по таймеру. */
export function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2600)
    return () => clearInterval(id)
  }, [words.length])
  if (!words.length) return null
  return (
    <span className="silk-rotator" aria-live="off">
      <span key={i} className="silk-rotator__word">
        {words[i]}
      </span>
    </span>
  )
}

/** Список проектов как у monopo: строка на проект, фото плывёт за курсором на пружине. */
export function WorksHover({ items }: { items: { title: string; meta: string; text: string; href: string; art: React.ReactNode }[] }) {
  const box = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return
    const el = box.current!
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const loop = () => {
      cx += (x - cx) * 0.12
      cy += (y - cy) * 0.12
      const skew = Math.max(-12, Math.min(12, (x - cx) * 0.05))
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${skew}deg)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])
  return (
    <div className="silk-works" onPointerLeave={() => setActive(-1)}>
      <ol className="silk-works__list">
        {items.map((it, i) => {
          const Tag = it.href ? 'a' : 'div'
          return (
            <li key={i} data-reveal="up" data-delay={String(i * 0.05)}>
              <Tag className={`silk-works__row${active === i ? ' is-active' : ''}`} {...(it.href ? { href: it.href } : {})} onPointerEnter={() => setActive(i)} data-cursor={it.href ? 'Смотреть' : undefined}>
                <span className="silk-works__idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="silk-works__title">{it.title}</span>
                <span className="silk-works__meta">{it.meta}</span>
                <span className="silk-works__mobile-art">{it.art}</span>
                {it.text ? <span className="silk-works__text">{it.text}</span> : null}
              </Tag>
            </li>
          )
        })}
      </ol>
      <div ref={box} className="silk-works__float" aria-hidden="true" data-on={active >= 0 || undefined}>
        {items.map((it, i) => (
          <div key={i} className="silk-works__frame" data-on={active === i || undefined}>
            {it.art}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Шапка: прозрачная над шёлком, после прокрутки — плотная. */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    let last = 0
    const on = () => {
      const y = window.scrollY
      el.classList.toggle('is-solid', y > 40)
      el.classList.toggle('is-hidden', y > 400 && y > last)
      last = y
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="silk-header">
      {children}
    </header>
  )
}
