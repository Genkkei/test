'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/*
 * Проявка: процедурный «снимок» (небо, солнце, три гряды холмов, вода с отражением)
 * медленно проступает из чёрного, как отпечаток в кювете под красным фонарём.
 * Плотность растёт за первые секунды, потом дышит; курсор — пятно света от фонаря.
 * Сверху — крупное плёночное зерно и лёгкий «перелив» проявителя.
 */
const DEVELOP = `
float ridge(float x,float s,float h,float o){return h+.06*snoise(vec2(x*s+o,o))+.025*snoise(vec2(x*s*3.+o,1.+o));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2((uv.x-.5)*asp,uv.y);
  float T=uTime;
  // изображение в оттенках серого
  float sky=mix(.82,.42,smoothstep(.35,1.,uv.y));
  vec2 sp=vec2(.22*asp*.6,.62);
  float sun=smoothstep(.11,.095,length(p-vec2(sp.x,sp.y)));
  float halo=exp(-length(p-sp)*5.)*.35;
  float img=sky+halo+sun*.25;
  float cl=fbm(vec2(p.x*1.6+T*.01,uv.y*4.));
  img+=cl*.06*smoothstep(.55,.9,uv.y);
  float r1=ridge(p.x,1.3,.40,1.);
  float r2=ridge(p.x,2.1,.33,4.);
  float r3=ridge(p.x,3.4,.25,9.);
  if(uv.y<r1)img=mix(img,.34,.85);
  if(uv.y<r2)img=.22+.04*snoise(p*9.);
  if(uv.y<r3)img=.10+.03*snoise(p*14.);
  float water=.16;
  if(uv.y<.16){
    float refl=mix(.18,.55,smoothstep(.16,.0,uv.y))*.5;
    float sunref=exp(-abs(p.x-sp.x)*18.)*smoothstep(.0,.16,uv.y)*(.5+.5*sin(uv.y*240.+T*1.5+snoise(p*8.)*4.));
    img=refl+sunref*.45+.03*snoise(vec2(p.x*20.,uv.y*120.+T*.6));
  }
  // проявка: плотность растёт, затем медленно дышит
  float dev=smoothstep(.0,5.,T)*(.92+.08*sin(T*.35));
  float wave=fbm(p*2.2+vec2(T*.05,-T*.03));
  float develop=clamp(dev*1.15-.15+wave*.25,0.,1.);
  float tone=pow(img,1.25)*develop;
  // свет фонаря за курсором
  vec2 m=vec2((uMouse.x-.5)*asp,uMouse.y);
  float lamp=exp(-length(p-m)*2.6)*.35;
  vec3 red=uC2;
  vec3 col=uC1+red*tone*1.5+red*lamp*.35;
  col+=vec3(1.,.82,.78)*pow(tone,3.)*.18;
  // зерно и виньетка
  float g=hash(gl_FragCoord.xy*.7+floor(T*24.));
  col+=(g-.5)*.09*(.4+tone);
  col*=1.-.65*pow(length(uv-.5)*1.35,2.2);
  gl_FragColor=vec4(col,1.);
}`

export function DevelopCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={DEVELOP} colors={colors} className="dark-canvas" maxDpr={1.25} />
}

/** Номер кадра в шапке меняется по мере прокрутки: 01A … 36A. */
export function FrameCounter() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
      const n = Math.min(36, 1 + Math.floor((scrollY / max) * 35))
      el.textContent = `${String(n).padStart(2, '0')}A / 36`
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <span ref={ref} className="dark-counter" suppressHydrationWarning>
      01A / 36
    </span>
  )
}
