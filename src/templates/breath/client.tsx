'use client'

import { useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Круг дыхания: цикл 8 с — 4 с вдох (кольцо раскрывается), 4 с выдох. Песок с мягкими
 * барханами шума, кольцо — светящаяся полоса цвета шалфея, внутри — расходящиеся волны.
 * Подпись «вдох/выдох» идёт CSS-анимацией той же длины, обе стартуют при монтировании. */
const BREATH = `
float ease(float x){return x*x*(3.-2.*x);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  p.y-=.17;
  float ph=mod(uTime,8.)/8.;
  float b=ph<.5?ease(ph*2.):1.-ease((ph-.5)*2.);
  float r=.12+.09*b;
  float d=length(p);
  float n=snoise(p*3.+uTime*.05)*.012;
  float ring=exp(-pow((d-r+n)/.012,2.));
  float glow=exp(-pow((d-r)/.09,2.))*.35;
  float inner=smoothstep(r,r*.2,d)*.22;
  float waves=0.;
  for(int i=1;i<4;i++){float fi=float(i);float rr=r+fi*.055+mod(uTime*.03,.055);waves+=exp(-pow((d-rr)/.004,2.))*(.18/fi);}
  float dune=snoise(vec2(uv.x*1.6,uv.y*3.)+vec2(uTime*.01,0.))*.5+.5;
  vec3 sand=mix(uC1,uC2,dune*.55+uv.y*.2);
  vec3 col=sand;
  col=mix(col,uC3,inner+glow*.6);
  col=mix(col,mix(uC3,uC4,.25),ring*.85);
  col=mix(col,uC3,waves);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.025;
  gl_FragColor=vec4(col,1.);
}`

export function BreathCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={BREATH} colors={colors} className="breath-canvas" maxDpr={1.25} interactive={false} />
}

/** Подпись в центре круга: «вдох» и «выдох» сменяются каждые 4 с. */
export function BreathLabel() {
  return (
    <p className="breath-label" aria-hidden="true">
      <span>вдох</span>
      <span>выдох</span>
    </p>
  )
}

/** Расписание: вкладки по дням. Все дни есть в HTML (для поиска), видимый — один. */
export function Schedule({ groups }: { groups: { name: string; items: { name: string; text: string; price: string }[] }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="breath-sched">
      <div className="breath-sched__tabs" role="tablist" aria-label="Дни недели">
        {groups.map((g, i) => (
          <button key={g.name} role="tab" aria-selected={i === active} className={i === active ? 'is-on' : ''} onClick={() => setActive(i)}>
            {g.name}
          </button>
        ))}
      </div>
      {groups.map((g, i) => (
        <div key={g.name} role="tabpanel" className="breath-sched__day" data-on={i === active || undefined}>
          <h3 className="sr-only">{g.name}</h3>
          <ul>
            {g.items.map((it, j) => {
              const [time, ...rest] = it.name.split('·')
              return (
                <li key={j} className="breath-sched__row" style={{ ['--i' as string]: j }}>
                  <span className="breath-sched__time">{rest.length ? time.trim() : ''}</span>
                  <span className="breath-sched__name">
                    {(rest.length ? rest.join('·') : it.name).trim()}
                    {it.text ? <small>{it.text}</small> : null}
                  </span>
                  <span className="breath-sched__price">{it.price}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
