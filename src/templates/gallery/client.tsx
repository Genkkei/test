'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/*
 * Работа на стене первого экрана: цветовое поле в духе Ротко — два прямоугольника
 * с рваными мягкими краями на грунте; края дышат, курсор чуть сдвигает свет.
 */
const FIELD = `
float box(vec2 p,vec2 c,vec2 s,float soft){
  vec2 d=abs(p-c)-s;
  float e=length(max(d,0.))+min(max(d.x,d.y),0.);
  return 1.-smoothstep(-soft,soft,e+.035*fbm(p*7.+uTime*.05));
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv;
  float t=uTime*.25;
  vec3 col=uC1*(0.92+.08*fbm(p*3.+t*.1));
  float a=box(p,vec2(.5,.7+.01*sin(t)),vec2(.38,.2),.035);
  float b=box(p,vec2(.5,.27),vec2(.38,.17+.01*cos(t*.8)),.04);
  col=mix(col,uC2*(0.9+.15*fbm(p*5.-t*.2)),a);
  col=mix(col,uC3*(0.85+.2*fbm(p*4.+t*.15)),b);
  col+=.06*exp(-length(p-uMouse)*3.);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.04;
  gl_FragColor=vec4(col,1.);
}`

export function ColorField({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={FIELD} colors={colors} className="gal-field" scale={0.6} maxDpr={1.25} />
}

/** Гигантское слово во всю ширину: подбирает кегль под ширину контейнера, без внешних библиотек. */
export function FitWord({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const el = ref.current!
    const fit = () => {
      el.style.fontSize = '100px'
      const w = el.scrollWidth
      const box = el.parentElement!.clientWidth
      if (w) el.style.fontSize = `${Math.floor((100 * box) / w)}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [text])
  return (
    <p ref={ref} className={className} aria-hidden="true">
      {text}
    </p>
  )
}
