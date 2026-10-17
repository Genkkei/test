'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Полированный кузов: поле высот из крупных плавных изгибов (как панели автомобиля),
 * нормаль из конечных разностей, отражение «студийных софтбоксов» — горизонтальных полос света.
 * Полосы медленно едут, курсор двигает студийный свет; в отражении — тонкий акцентный блик. */
const METAL = `
float body(vec2 p){
  float t=uTime*.035;
  return .6*sin(p.x*.9+.4+t)+.42*sin(p.y*1.35-p.x*.45-t*.6)+.08*snoise(p*.7+vec2(t,-t));
}
vec3 env(vec3 r,vec2 m,float sweep){
  // студия: тёмный пол, светлый потолок, два софтбокса и тонкая лампа-полоса
  float sky=smoothstep(-.6,.9,r.y+m.y*.3);
  vec3 c=mix(uC1*.35,mix(uC2,uC3,.28),sky);
  float box=smoothstep(.34,.04,abs(r.y-.3-m.y*.45))*smoothstep(1.3,.2,abs(r.x-m.x*1.2));
  float box2=smoothstep(.22,.03,abs(r.x+.5-m.x*.5))*smoothstep(.9,.1,abs(r.y-.05));
  float strip=smoothstep(.09,.0,abs(r.y+.2-.22*r.x-m.y*.2));
  float rim=smoothstep(.06,.0,abs(r.x-.6+m.x*.3))*smoothstep(.7,.0,abs(r.y));
  c+=uC3*box*(.55+.5*sweep);
  c+=uC3*box2*.32;
  c+=uC3*strip*(.22+.55*sweep);
  c+=uC4*rim*.6;
  return c;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float e=.008;
  float h=body(p),hx=body(p+vec2(e,0.)),hy=body(p+vec2(0.,e));
  vec3 n=normalize(vec3((h-hx)/e*1.15,(h-hy)/e*1.15,1.));
  vec3 r=reflect(vec3(0.,0.,-1.),n);
  vec2 m=(uMouse-.5);
  // pow() от отрицательного основания в GLSL не определён (NaN, чёрный экран) — квадрат вручную
  float sx=p.x-(fract(uTime*.04)*4.-2.);
  float sweep=exp(-sx*sx*1.5);
  vec3 col=env(r,m,sweep);
  float fres=pow(1.-n.z,2.);
  col=mix(col,uC2*1.4,fres*.4);
  col+=snoise(vec2(p.x*1.2,p.y*300.))*.012;
  col*=1.-.6*pow(length(uv-vec2(.55,.6)),1.8);
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
