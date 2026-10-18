'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/*
 * Каустика: свет, преломлённый рябью, ложится сетью на дно бассейна.
 * Классический приём «tileable water caustic» — пять итераций синусов, без текстур;
 * рисуется в половину разрешения, поэтому почти бесплатен.
 */
const CAUSTIC = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 q=(gl_FragCoord.xy/uRes.y)*3.2+(uMouse-.5)*.35;
  float t=uTime*.32+23.;
  vec2 p=mod(q*6.28318,6.28318)-250.;
  vec2 i=p;float c=1.;float inten=.005;
  for(int n=0;n<5;n++){
    float tt=t*(1.-(3.5/float(n+1)));
    i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));
  }
  c/=5.;c=1.17-pow(c,1.4);
  float k=pow(abs(c),8.);
  vec3 deep=mix(uC2,uC1,smoothstep(0.,1.,uv.y));
  vec3 col=deep+k*mix(vec3(1.),uC3,.25)*.85;
  col*=.92+.08*snoise(uv*3.+uTime*.05);
  gl_FragColor=vec4(col,1.);
}`

export function Caustics({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={CAUSTIC} colors={colors} className="wave-caustics" scale={0.5} maxDpr={1.5} />
}

/** Расписание по дням: вкладки. Без скрипта видны все группы (атрибут hidden ставится только в браузере). */
export function Timetable({ groups, label }: { groups: { name: string; items: { name: string; text: string; price: string }[] }[]; label: string }) {
  const [on, setOn] = useState(0)
  const [js, setJs] = useState(false)
  useEffect(() => setJs(true), [])
  return (
    <div className="wave-tt">
      <div className="wave-tt__tabs" role="tablist" aria-label={label}>
        {groups.map((g, i) => (
          <button key={i} type="button" role="tab" aria-selected={on === i} className={on === i ? 'is-on' : ''} onClick={() => setOn(i)}>
            {g.name}
          </button>
        ))}
      </div>
      {groups.map((g, i) => (
        <div key={i} role="tabpanel" className="wave-tt__panel" hidden={js ? on !== i : undefined}>
          {!js ? <h3 className="wave-tt__day">{g.name}</h3> : null}
          <ol>
            {g.items.map((it, j) => (
              <li key={j} className="wave-tt__row" style={{ ['--i' as string]: j }}>
                <span className="wave-tt__time">{it.price}</span>
                <span className="wave-tt__name">{it.name}</span>
                <span className="wave-tt__where">{it.text}</span>
                <span className="wave-tt__bubble" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}

/** Шапка: прозрачная над водой, после прокрутки — матовая. */
export function Header({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 30)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="wave-header">
      {children}
    </header>
  )
}
