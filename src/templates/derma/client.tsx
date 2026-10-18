'use client'

import { useEffect, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Молочный свет: два мягких пятна дрейфуют и следуют за курсором, рисуется в половину
 * разрешения — поле размытое, пикселям не за что зацепиться. Три выборки шума на пиксель. */
const SILK = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime*.05;
  vec2 m=(uMouse-.5)*vec2(.6,.4);
  float n=snoise(p*1.2+vec2(t,-t));
  float a=smoothstep(.9,.0,length(p-vec2(.35,.1)-m+n*.08));
  float b=smoothstep(1.,.0,length(p+vec2(.45,.25)+m*.5+snoise(p*.8-t)*.1));
  vec3 col=uC1;
  col=mix(col,uC2,a*.75);
  col=mix(col,uC3,b*.35);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.02;
  gl_FragColor=vec4(col,1.);
}`

export function Glow({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={SILK} colors={colors} className="derma-glow" maxDpr={1} scale={0.5} />
}

/** Отзывы по одному: крупная цитата сменяется плавно, точки — переключатель. */
export function Quotes({ items, label }: { items: { quote: string; author: string; role: string }[]; label: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (items.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 6500)
    return () => clearInterval(id)
  }, [items.length, i])
  if (!items.length) return null
  const it = items[i]
  return (
    <div className="derma-quotes">
      <figure key={i} className="derma-quote">
        <blockquote>{it.quote}</blockquote>
        <figcaption>
          {it.author}
          {it.role ? <span> · {it.role}</span> : null}
        </figcaption>
      </figure>
      <div className="derma-quotes__dots" role="tablist" aria-label={label}>
        {items.map((q, k) => (
          <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`${k + 1} / ${items.length}`} onClick={() => setI(k)} />
        ))}
      </div>
      <ul className="sr-only">
        {items.map((q, k) => (
          <li key={k}>
            {q.quote} — {q.author}
          </li>
        ))}
      </ul>
    </div>
  )
}
