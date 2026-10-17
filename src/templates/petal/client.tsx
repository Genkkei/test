'use client'

import { pick } from '@/lib/i18n'
import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/* Глянцевые капли: поле метаболов (сумма r²/d²), нормаль из градиента поля, сверху —
 * узкий белый блик и мягкий рефлекс, как у блеска для губ Rhode. Одна капля следует за курсором. */
const DROPS = `
float field(vec2 p){
  float f=0.;
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 c=vec2(sin(uTime*.12*(1.+fi*.17)+fi*1.7)*.62+.18, cos(uTime*.1*(1.+fi*.13)+fi*2.3)*.34-.02);
    f+=min((.016+.005*fi)/max(dot(p-c,p-c),1e-4),3.);
  }
  vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);
  f+=min(.012/max(dot(p-m,p-m),1e-4),3.);
  return f;
}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  p.y+=uScroll*.4;
  float f=field(p);
  float e=.004;
  vec2 g=vec2(field(p+vec2(e,0.))-f,field(p+vec2(0.,e))-f)/e;
  float mask=smoothstep(.85,1.05,f);
  // у центров капель поле обрезано, градиент там нулевой — без клампа там были тёмные точки
  vec2 gg=g*.012; float gl=length(gg); if(gl>2.5) gg*=2.5/gl;
  vec3 n=normalize(vec3(-gg,1.));
  vec3 l=normalize(vec3(-.45,.6,.75));
  float diff=clamp(dot(n,l),0.,1.);
  float spec=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),70.);
  float rim=pow(1.-n.z,2.);
  vec2 uv=gl_FragCoord.xy/uRes;
  vec3 bg=mix(uC1,uC2,smoothstep(0.,1.,uv.y*.8+.1*snoise(uv*2.+uTime*.03)));
  vec3 drop=mix(uC2,uC3,.28+.25*diff);
  drop+=rim*.18*vec3(1.,.9,.92);
  drop+=spec*.85;
  // мягкая тень под каплей
  float sh=smoothstep(.55,.95,field(p+vec2(.015,.03)))*(1.-mask);
  vec3 col=mix(bg*(1.-sh*.08),drop,mask);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.02;
  gl_FragColor=vec4(col,1.);
}`

export function DropsCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={DROPS} colors={colors} className="petal-canvas" maxDpr={1.25} scale={0.8} />
}

/** Шапка: прозрачная над каплями, дальше — молочная с тонкой линией. */
export function PetalHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current!
    const on = () => el.classList.toggle('is-solid', window.scrollY > 30)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="petal-header">
      {children}
    </header>
  )
}

/** До/после: ползунок поверх двух слоёв. Работает и пальцем, и клавиатурой (обычный range). */
export function BeforeAfter({ before, after, label, lang = 'ru' }: { before: React.ReactNode; after: React.ReactNode; label: string; lang?: string }) {
  const [v, setV] = useState(50)
  return (
    <div className="petal-ba" style={{ ['--ba' as string]: `${v}%` }}>
      <div className="petal-ba__layer petal-ba__layer--before">{before}</div>
      <div className="petal-ba__layer petal-ba__layer--after">{after}</div>
      <span className="petal-ba__tag petal-ba__tag--l">{pick(lang, { ru: 'до', uz: 'oldin', en: 'before' })}</span>
      <span className="petal-ba__tag petal-ba__tag--r">{pick(lang, { ru: 'после', uz: 'keyin', en: 'after' })}</span>
      <span className="petal-ba__handle" aria-hidden="true" />
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} aria-label={`${pick(lang, { ru: 'Сравнить до и после', uz: 'Oldin va keyinni solishtirish', en: 'Compare before and after' })}: ${label}`} />
    </div>
  )
}
