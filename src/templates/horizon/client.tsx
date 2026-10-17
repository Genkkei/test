'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Рассвет в горах: небо от холодного к тёплому, солнце медленно поднимается со временем
 * и прокруткой, четыре гряды гор — гребни из шума, дальние тонут в дымке. */
const DAWN = `
float ridge(float x,float seed){
  float n=0.,a=.55,f=1.;
  for(int i=0;i<3;i++){n+=a*(1.-abs(snoise(vec2(x*f,seed))));f*=2.;a*=.42;}
  return n;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  float rise=clamp(.08+uTime*.005+uScroll*2.2,0.,.42);
  vec2 sp=vec2(.7+(uMouse.x-.5)*.03,.4+rise*.6);
  vec3 night=mix(uC3*.9,vec3(.16,.2,.29),.55);
  vec3 top=mix(night,uC1*.92,rise*.85);
  vec3 hor=mix(uC2*1.05,vec3(1.,.85,.68),rise*1.4);
  vec3 sky=mix(hor,top,smoothstep(.12,.95,uv.y));
  float d=length((uv-sp)*vec2(asp,1.));
  sky+=vec3(1.,.78,.52)*(exp(-d*7.)*.8+exp(-d*1.8)*.22)*(.6+rise);
  sky=mix(sky,vec3(1.,.95,.86),smoothstep(.055,.048,d));
  vec3 col=sky;
  float px=(uv.x-.5)*asp;
  for(int i=0;i<4;i++){
    float fi=float(i);
    float depth=fi/3.;
    float x=px*(.9+fi*.35)+(uMouse.x-.5)*.04*fi+fi*7.3+uTime*.002*(fi+1.);
    float h=.34-fi*.075+ridge(x*.75,fi*3.7)*(.17+fi*.025);
    float m=smoothstep(h+.002,h-.002,uv.y);
    vec3 rock=mix(uC3*(.55+.1*fi),sky,(1.-depth)*.72);
    rock=mix(rock,hor,.12*(1.-depth));
    float rim=smoothstep(h-.008,h,uv.y)*m*(1.-depth)*.12;
    col=mix(col,rock+rim*vec3(1.,.8,.6),m);
  }
  float mist=smoothstep(.32,.0,uv.y)*.25;
  col=mix(col,uC1,mist*(1.-uv.y));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.03;
  gl_FragColor=vec4(col,1.);
}`

export function DawnCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={DAWN} colors={colors} className="hz-canvas" maxDpr={1.25} />
}

/** Горизонтальная галерея номеров: секция закрепляется, вертикальная прокрутка ведёт ленту вбок.
 *  На телефоне и при reduced motion — обычная лента со свайпом. */
export function HorizontalTrack({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const o = outer.current!
    const t = track.current!
    const mq = window.matchMedia('(min-width: 861px) and (prefers-reduced-motion: no-preference)')
    let raf = 0
    const layout = () => {
      if (!mq.matches || document.documentElement.classList.contains('reduce-motion')) {
        o.style.height = ''
        t.style.transform = ''
        o.classList.remove('is-pinned')
        return
      }
      o.classList.add('is-pinned')
      const dist = t.scrollWidth - window.innerWidth
      o.style.height = `${window.innerHeight + Math.max(0, dist)}px`
      update()
    }
    const update = () => {
      raf = 0
      if (!o.classList.contains('is-pinned')) return
      const r = o.getBoundingClientRect()
      const dist = t.scrollWidth - window.innerWidth
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)))
      t.style.transform = `translate3d(${-p * dist}px,0,0)`
      o.style.setProperty('--hz-p', p.toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(t)
    window.addEventListener('resize', layout)
    window.addEventListener('scroll', onScroll, { passive: true })
    mq.addEventListener('change', layout)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', layout)
      window.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', layout)
    }
  }, [])
  return (
    <div ref={outer} className="hz-pin">
      <div className="hz-pin__sticky">
        <div ref={track} className="hz-pin__track">
          {children}
        </div>
        <div className="hz-pin__bar" aria-hidden="true">
          <i />
        </div>
      </div>
    </div>
  )
}

export function HorizonHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-light', window.scrollY > window.innerHeight * 0.85)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="hz-header">
      {children}
    </header>
  )
}
