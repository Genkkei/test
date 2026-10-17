'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Открытый огонь: жар — fbm, поднимающийся снизу; искры — ячейки сетки, едущие вверх
 * с покачиванием; курсор раздувает угли. Цвет пламени — акцент темы, кончики — к светлому. */
const FIRE = `
float spark(vec2 p,float scale,float speed,float seed){
  vec2 g=vec2(p.x*scale,p.y*scale-uTime*speed);
  vec2 id=floor(g);vec2 f=fract(g)-.5;
  float h=hash(id+seed);
  vec2 off=vec2(hash(id+seed+3.1)-.5,hash(id+seed+7.7)-.5)*.6;
  off.x+=sin(uTime*1.7+h*6.28)*.18;
  float d=length(f-off);
  return smoothstep(.07,0.,d)*step(.86,h)*(.5+.5*sin(uTime*3.+h*20.));
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2((uv.x-.5)*asp,uv.y);
  vec2 m=vec2((uMouse.x-.5)*asp,uMouse.y);
  float t=uTime;
  float n=fbm(vec2(p.x*1.7,p.y*2.4-t*.55));
  float n2=fbm(vec2(p.x*3.4+4.,p.y*3.2-t*.9));
  float heat=1.-uv.y*1.25+n*.42+n2*.18;
  heat*=.85+.15*sin(p.x*2.1+t*.6);
  heat+=.35*exp(-9.*dot(p-m,p-m))*(1.-uv.y*.6);
  heat-=uScroll*.8;
  vec3 deep=uC1*1.1+vec3(.22,.03,.0);
  vec3 fire=mix(deep,uC2,smoothstep(.2,.62,heat));
  fire=mix(fire,mix(uC2,vec3(1.,.86,.6),.7),smoothstep(.68,1.05,heat));
  vec3 col=mix(uC1,fire,smoothstep(.0,.55,heat));
  float s=spark(p,10.,1.2,1.)+spark(p,16.,1.9,9.)*.8+spark(p,26.,2.6,17.)*.6;
  col+=s*vec3(1.,.62,.28)*1.6*smoothstep(1.05,.1,uv.y);
  col*=1.-.45*pow(length((uv-vec2(.5,.35))*vec2(1.,.9)),1.6);
  col+=(hash(gl_FragCoord.xy+fract(t))-.5)*.04;
  gl_FragColor=vec4(col,1.);
}`

export function FireCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={FIRE} colors={colors} className="em-canvas" maxDpr={1.2} scale={0.75} />
}

/** «Открыто до 23:00» — по часам Ташкента и правилам openingHours. */
export function OpenNow({ hours }: { hours: string[] }) {
  const [text, setText] = useState('')
  useEffect(() => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    const calc = () => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tashkent' }))
      const d = days[now.getDay()]
      const mins = now.getHours() * 60 + now.getMinutes()
      for (const rule of hours) {
        const m = rule.match(/^([A-Z][a-z])(?:-([A-Z][a-z]))?\s+(\d\d):(\d\d)-(\d\d):(\d\d)$/)
        if (!m) continue
        const a = days.indexOf(m[1]), b = days.indexOf(m[2] || m[1]), i = days.indexOf(d)
        const inRange = a <= b ? i >= a && i <= b : i >= a || i <= b
        if (!inRange) continue
        const open = +m[3] * 60 + +m[4]
        let close = +m[5] * 60 + +m[6]
        if (close <= open) close += 24 * 60
        if (mins >= open && mins < close) return setText(`Открыто до ${m[5]}:${m[6]}`)
        if (mins < open) return setText(`Откроемся в ${m[3]}:${m[4]}`)
      }
      setText('Сейчас закрыто')
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [hours])
  return (
    <span className="em-open" data-open={text.startsWith('Открыто') || undefined} suppressHydrationWarning>
      <i />
      {text || 'Часы работы'}
    </span>
  )
}

export function EmberHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-scrolled', window.scrollY > 80)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="em-header">
      {children}
    </header>
  )
}
