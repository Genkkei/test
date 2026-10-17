'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Пар над чашкой: прозрачный холст, видна только дымка. Столб пара — гауссова колонна,
 * которую раскачивает синус и рвёт fbm; курсор слегка сносит его в сторону. */
const STEAM = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=vec2((uv.x-.5)*uRes.x/uRes.y,uv.y);
  float t=uTime*.22;
  float sway=sin(p.y*3.2-uTime*.7)*.09+snoise(vec2(p.y*1.4-t,1.3))*.12+(uMouse.x-.5)*.25*p.y;
  float col=exp(-pow((p.x-sway)*4.2/(.22+p.y*.75),2.));
  vec2 q=vec2(p.x*2.4+sway*2.,p.y*1.7-t*1.6);
  float n=fbm(q*1.6+vec2(0.,fbm(q*.8)));
  float fade=smoothstep(.02,.22,uv.y)*smoothstep(1.,.38,uv.y);
  float a=smoothstep(-.15,.75,n)*col*fade;
  a=clamp(a*1.15,0.,1.);
  gl_FragColor=vec4(uC1,a*.85);
}`

export function SteamCanvas({ color }: { color: string }) {
  return <ShaderCanvas frag={STEAM} colors={[color]} className="rs-steam" maxDpr={1.2} scale={0.7} />
}

/** Шапка: над первым экраном прозрачная, при прокрутке — плотная полоса с тенью-линией. */
export function RoastHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 30)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="rs-header">
      {children}
    </header>
  )
}

/** Пачка наклоняется за курсором — как будто её взяли с полки. */
export function TiltShelf({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches || document.documentElement.classList.contains('reduce-motion')) return
    const root = ref.current!
    const move = (e: PointerEvent) => {
      const bag = (e.target as HTMLElement).closest<HTMLElement>('.rs-bag')
      if (!bag) return
      const r = bag.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      bag.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
      bag.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
    }
    const leave = (e: PointerEvent) => {
      const bag = (e.target as HTMLElement).closest<HTMLElement>('.rs-bag')
      if (bag && !bag.contains(e.relatedTarget as Node)) {
        bag.style.setProperty('--rx', '0deg')
        bag.style.setProperty('--ry', '0deg')
      }
    }
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerout', leave)
    return () => {
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerout', leave)
    }
  }, [])
  return (
    <div ref={ref} className="rs-shelf">
      {children}
    </div>
  )
}
