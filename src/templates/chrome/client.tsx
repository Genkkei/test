'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Полированный кузов: поле высот из крупных плавных изгибов (как панели автомобиля),
 * нормаль из конечных разностей, отражение «студийных софтбоксов» — горизонтальных полос света.
 * Полосы медленно едут, курсор двигает студийный свет; в отражении — тонкий акцентный блик. */
const METAL = `
/* Кузов: поле высот из крупных изгибов. Отражение считаем «по-хромовому»: координата студии
 * смещается на высоту и наклон поверхности, поэтому полосы софтбоксов гнутся по панелям. */
float body(vec2 p){
  float t=uTime*.035;
  return .5*sin(p.x*1.1+.4+t)+.35*sin(p.y*1.6-p.x*.6-t*.6)+.1*snoise(p*.8+vec2(t,-t));
}
float band(float x,float c,float w){return smoothstep(w,0.,abs(x-c));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 m=uMouse-.5;
  float e=.01;
  float h=body(p),hx=body(p+vec2(e,0.)),hy=body(p+vec2(0.,e));
  vec2 g=vec2(hx-h,hy-h)/e;
  float ty=p.y*1.4+h*.55+g.y*.35+m.y*.35;
  float tx=p.x+g.x*.4-m.x*.5;
  // студийный свет: две широкие полосы, одна узкая, мягкий потолок
  float l=band(ty,.42,.16)*.95+band(ty,-.05,.06)*.75+band(ty,-.42,.22)*.35;
  l*=smoothstep(1.25,.35,abs(tx-.1));
  float ceil=smoothstep(-.2,.9,ty)*.22;
  float sx=tx-(fract(uTime*.045)*4.-2.);
  float sweep=exp(-sx*sx*2.);
  vec3 col=mix(uC1*.6,uC2*1.5,smoothstep(-.8,.8,ty));
  col+=uC3*(l*(.55+.55*sweep)+ceil);
  col+=uC4*band(ty,-.25,.025)*smoothstep(1.,.2,abs(tx+.4))*.9;
  col+=snoise(vec2(p.x*1.2,p.y*300.))*.012;
  col*=1.-.55*length(uv-vec2(.62,.55));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.022;
  gl_FragColor=vec4(col,1.);
}`

export function MetalCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={METAL} colors={colors} className="ch-canvas" maxDpr={1.25} scale={0.85} />
}

/** Тахометр: стрелка идёт по прокрутке страницы, деления краснеют у отсечки. */
export function Tach({ label }: { label: string }) {
  const needle = useRef<SVGLineElement>(null)
  const value = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0
    let cur = 0
    const loop = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      const target = scrollY / max
      cur += (target - cur) * 0.08
      const a = -210 + cur * 240
      needle.current?.setAttribute('transform', `rotate(${a + 90} 60 60)`)
      if (value.current) value.current.textContent = String(Math.round(cur * 8000)).padStart(4, '0')
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  const ticks = Array.from({ length: 25 }, (_, i) => {
    const a = ((-210 + i * 10) * Math.PI) / 180
    const r1 = i % 3 === 0 ? 44 : 48
    return (
      <line
        key={i}
        x1={60 + Math.cos(a) * r1}
        y1={60 + Math.sin(a) * r1}
        x2={60 + Math.cos(a) * 53}
        y2={60 + Math.sin(a) * 53}
        className={i > 20 ? 'is-red' : ''}
      />
    )
  })
  return (
    <div className="ch-tach" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="56" className="ch-tach__ring" />
        {ticks}
        <line ref={needle} x1="60" y1="60" x2="60" y2="16" className="ch-tach__needle" transform="rotate(-120 60 60)" />
        <circle cx="60" cy="60" r="4" className="ch-tach__hub" />
      </svg>
      <span className="ch-tach__val">
        <span ref={value}>0000</span>
        <small>{label}</small>
      </span>
    </div>
  )
}

/** Шапка: прозрачная над металлом, после прокрутки — графитовая полоса с тонкой красной линией прогресса. */
export function ChromeHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      el.classList.toggle('is-solid', scrollY > 30)
      el.style.setProperty('--p', String(scrollY / max))
    }
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="ch-header">
      {children}
    </header>
  )
}

/** Карточка работы: блик пробегает по поверхности за курсором. */
export function Glare({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        ref.current!.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
        ref.current!.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
      }}
    >
      {children}
    </div>
  )
}
