'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Бархат и золото: тёмная ткань с мягкими складками, по которой идёт узкая полоса
 * золотого блика (как свет витрины на металле), и редкие искры — граней камней.
 * Пять выборок шума на пиксель, рисуется в 0.6 разрешения. */
const VELVET = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime*.05;
  float folds=fbm(p*1.3+vec2(t,-t*.6)+(uMouse-.5)*.25);
  vec3 col=mix(uC1,uC2,smoothstep(-.6,.8,folds));
  // блик: полоса, изогнутая складками, медленно ходит по диагонали
  float band=p.x*.8+p.y*.55+folds*.35-sin(uTime*.12)*.6-uScroll*1.4;
  float sheen=exp(-pow(band*7.,2.))*.75+exp(-pow((band-.38)*12.,2.))*.25;
  col+=uC3*sheen*(.25+.75*smoothstep(0.,.8,folds));
  // искры: клетки, в каждой своя фаза мерцания
  vec2 g=gl_FragCoord.xy/22.;
  vec2 id=floor(g); vec2 f=fract(g)-.5;
  float h=hash(id);
  float tw=pow(max(0.,sin(uTime*(1.+h*2.)+h*40.)),24.)*step(.86,h);
  float star=tw*(.012/(abs(f.x)+.012))*(.012/(abs(f.y)+.012));
  col+=uC4*star*.9*(.4+sheen);
  col*=1.-.65*pow(length(uv-vec2(.5,.48)),1.6);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.025;
  gl_FragColor=vec4(col,1.);
}`

export function Velvet({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={VELVET} colors={colors} className="crt-canvas" maxDpr={1.25} scale={0.6} />
}

/** Свет витрины: обёртка пишет положение курсора в --mx/--my каждой карточке под ним. */
export function Spotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    if (!window.matchMedia('(hover: hover)').matches) return
    let raf = 0
    let ev: PointerEvent | null = null
    const draw = () => {
      raf = 0
      if (!ev) return
      el.querySelectorAll<HTMLElement>('[data-spot]').forEach((c) => {
        const r = c.getBoundingClientRect()
        c.style.setProperty('--mx', `${ev!.clientX - r.left}px`)
        c.style.setProperty('--my', `${ev!.clientY - r.top}px`)
      })
    }
    const move = (e: PointerEvent) => {
      ev = e
      if (!raf) raf = requestAnimationFrame(draw)
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
    }
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Лента коллекций: перетаскивание мышью и стрелки, палец — родной прокруткой со snap. */
export function Vitrine({ children, prev, next }: { children: React.ReactNode; prev: string; next: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let down = false, x0 = 0, s0 = 0, moved = false
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft
      el.classList.add('is-drag')
    }
    const pm = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - x0
      if (Math.abs(dx) > 4) moved = true
      el.scrollLeft = s0 - dx
    }
    const pu = () => {
      down = false
      el.classList.remove('is-drag')
    }
    const click = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false }
    }
    el.addEventListener('pointerdown', pd)
    window.addEventListener('pointermove', pm, { passive: true })
    window.addEventListener('pointerup', pu)
    el.addEventListener('click', click, true)
    return () => {
      el.removeEventListener('pointerdown', pd)
      window.removeEventListener('pointermove', pm)
      window.removeEventListener('pointerup', pu)
      el.removeEventListener('click', click, true)
    }
  }, [])
  const go = (d: number) => {
    const el = ref.current!
    const card = el.querySelector<HTMLElement>('.crt-vit__item')
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 300) + 24), behavior: 'smooth' })
  }
  return (
    <div className="crt-vit">
      <div ref={ref} className="crt-vit__track">
        {children}
      </div>
      <div className="crt-vit__ui">
        <button type="button" onClick={() => go(-1)} aria-label={prev}>
          ←
        </button>
        <button type="button" onClick={() => go(1)} aria-label={next}>
          →
        </button>
      </div>
    </div>
  )
}
