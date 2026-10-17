'use client'

import { useEffect, useRef } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/*
 * Карта маршрутов: точечная «суша» из шума, светящиеся дуги из Китая, Турции, Европы
 * и России в Ташкент, по каждой дуге бегут грузы-частицы, у Ташкента — пульс.
 * Дуга — квадратичная Безье, расстояние до неё — по 18 отрезкам. Точки сдвинуты
 * вправо на широком экране, чтобы слева читался заголовок.
 */
const ROUTE = `
vec2 bz(vec2 a,vec2 c,vec2 b,float t){return mix(mix(a,c,t),mix(c,b,t),t);}
float sg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
vec3 arc(vec2 p,vec2 a,vec2 b,float lift,float ph,vec3 col){
  vec2 m=(a+b)*.5;vec2 n=normalize(vec2(-(b-a).y,(b-a).x));
  vec2 c=m+n*lift;
  float d=1e3;float bt=0.;vec2 prev=a;
  for(int i=1;i<=18;i++){float t=float(i)/18.;vec2 q=bz(a,c,b,t);float s=sg(p,prev,q);if(s<d){d=s;bt=t;}prev=q;}
  float dash=step(.45,fract(bt*22.-uTime*.9));
  vec3 o=uC2*(exp(-d*260.)*(.35+.65*dash)*.9+exp(-d*38.)*.10);
  for(int k=0;k<3;k++){
    float tt=fract(uTime*.07+ph+float(k)/3.);
    vec2 q=bz(a,c,b,tt);
    float l=length(p-q);
    o+=col*(smoothstep(.009,.0,l)*1.2+exp(-l*70.)*.35);
  }
  return o;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  bool wide=asp>1.15;
  vec2 p=vec2((uv.x-.5)*asp,uv.y-.5);
  p-=wide?vec2(asp*.2,.0):vec2(0.,.17);
  p*=wide?1.55:1.75;
  p+=(uMouse-.5)*.035;
  vec3 col=uC1;
  // точки суши
  vec2 g=p*34.;vec2 gi=floor(g);vec2 gf=fract(g)-.5;
  float land=snoise(gi*.03+vec2(3.,7.))+.45*snoise(gi*.09+9.);
  float lm=step(.18,land);
  float dt=smoothstep(.19,.1,length(gf));
  col+=uC4*dt*lm*.30;
  col+=uC4*dt*(1.-lm)*.05;
  vec2 T=vec2(.02,.02);
  col+=arc(p,vec2(.52,-.06),T,.14,.0,uC3);
  col+=arc(p,vec2(.40,.19),T,.10,.31,uC3);
  col+=arc(p,vec2(-.30,-.02),T,-.10,.57,uC3);
  col+=arc(p,vec2(-.55,.21),T,-.18,.83,uC3);
  col+=arc(p,vec2(-.12,.36),T,.08,.12,uC3);
  // узлы
  float nodes=0.;
  nodes+=smoothstep(.012,.0,length(p-vec2(.52,-.06)));
  nodes+=smoothstep(.012,.0,length(p-vec2(.40,.19)));
  nodes+=smoothstep(.012,.0,length(p-vec2(-.30,-.02)));
  nodes+=smoothstep(.012,.0,length(p-vec2(-.55,.21)));
  nodes+=smoothstep(.012,.0,length(p-vec2(-.12,.36)));
  col+=uC3*nodes*.8;
  float lt=length(p-T);
  col+=uC2*(smoothstep(.016,.0,lt)+exp(-lt*30.)*.4);
  for(int k=0;k<2;k++){float r=fract(uTime*.35+float(k)*.5)*.11;col+=uC2*smoothstep(.004,.0,abs(lt-r))*(1.-r/.11)*.9;}
  if(wide)col=mix(col,uC1,smoothstep(.62,.05,uv.x)*.78);
  else col=mix(col,uC1,smoothstep(.55,.0,uv.y)*.85);
  col*=1.-.35*pow(length(uv-.5)*1.25,2.);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.02;
  gl_FragColor=vec4(col,1.);
}`

export function RouteCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={ROUTE} colors={colors} className="route-canvas" maxDpr={1.25} />
}

/** Шапка: становится плотной после первого экрана. */
export function RouteHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 30)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="route-header">
      {children}
    </header>
  )
}

/** Линия этапов заполняется по мере прокрутки секции. */
export function ProgressLine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const on = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const k = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height || 1)))
      el.style.setProperty('--route-p', k.toFixed(3))
    }
    const sched = () => {
      if (!raf) raf = requestAnimationFrame(on)
    }
    on()
    window.addEventListener('scroll', sched, { passive: true })
    window.addEventListener('resize', sched)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', sched)
      window.removeEventListener('resize', sched)
    }
  }, [])
  return (
    <div ref={ref} className="route-steps">
      {children}
    </div>
  )
}
