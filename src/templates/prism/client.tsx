'use client'

import { useEffect, useRef, useState } from 'react'
import { ShaderCanvas } from '@/motion/shader'

/*
 * Стеклянная сфера в хромированном кольце (по мотивам alche.studio).
 * Сфера — аналитическое пересечение луча, кольцо — короткий рэймарч тора.
 * Внутри сферы преломляется процедурная «студия»: градиентное поле, софтбоксы, полосы;
 * каждый канал преломляется со своим коэффициентом — радужная дисперсия по краю.
 * Вне фигур холст прозрачный: за ним в DOM живёт стена со словами.
 */
const PRISM = `
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec3 env(vec3 d){
  float t=uTime*.05;
  vec3 c=mix(uC4*.8,uC2*.75,smoothstep(-.8,.9,d.y+.3*sin(d.x*2.+t*3.)));
  c+=vec3(1.)*1.3*pow(max(0.,dot(d,normalize(vec3(.55,.75,-.35)))),12.);
  c+=uC3*1.1*pow(max(0.,dot(d,normalize(vec3(-.8,-.1,-.55)))),8.);
  c+=uC2*1.2*pow(max(0.,dot(d,normalize(vec3(.1,-.9,-.4)))),3.);
  c+=vec3(.25,.6,1.)*.5*pow(max(0.,dot(d,normalize(vec3(.9,-.2,.2)))),5.);
  float st=fract(d.x*3.+d.y*1.4+t);
  c+=uC3*.18*smoothstep(.47,.5,st)*smoothstep(.53,.5,st);
  float g=snoise(d.xy*2.5+t*2.);
  c+=uC2*.12*g;
  return c;
}
float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
vec3 ringP(vec3 p){
  p.yz*=rot(1.15+(uMouse.y-.5)*.4);
  p.xy*=rot(.35+uTime*.12+uScroll*3.);
  p.xz*=rot((uMouse.x-.5)*.6);
  return p;
}
float mapR(vec3 p){return sdTorus(ringP(p),vec2(1.42,.045));}
vec3 nR(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(mapR(p+e.xyy)-mapR(p-e.xyy),mapR(p+e.yxy)-mapR(p-e.yxy),mapR(p+e.yyx)-mapR(p-e.yyx)));}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);
  bool wide=uRes.x>uRes.y*1.2;
  uv-=wide?vec2(.38,.1):vec2(0.,.34);
  float zoom=wide?1.32:1.65;
  vec3 ro=vec3(0.,0.,-4.2*zoom);
  vec3 rd=normalize(vec3(uv,1.55));
  vec4 col=vec4(0.);
  // сфера
  float R=1.0;
  float b=dot(ro,rd),c=dot(ro,ro)-R*R,h=b*b-c;
  float tS=h>0.?-b-sqrt(h):1e9;
  // кольцо
  float t=2.;float tR=1e9;
  for(int i=0;i<56;i++){vec3 p=ro+rd*t;float d=mapR(p);if(d<.001){tR=t;break;}t+=d;if(t>8.)break;}
  if(tR<tS&&tR<1e8){
    vec3 p=ro+rd*tR;vec3 n=nR(p);
    vec3 r=reflect(rd,n);
    vec3 e=env(r);
    float f=pow(1.-max(0.,dot(-rd,n)),2.);
    vec3 chrome=e*1.3+f*.5;
    chrome=mix(vec3(dot(chrome,vec3(.33))),chrome,.55);
    col=vec4(chrome,1.);
  } else if(h>0.){
    vec3 p=ro+rd*tS;vec3 n=normalize(p);
    float wob=snoise(n.xy*2.+uTime*.15)*.06;
    n=normalize(n+wob);
    float fr=pow(1.-max(0.,dot(-rd,n)),3.);
    vec3 dR=refract(rd,n,1./1.12),dG=refract(rd,n,1./1.16),dB=refract(rd,n,1./1.22);
    // второе преломление на выходе — грубо: зеркалим относительно центра
    vec3 cR=env(normalize(dR-n*.4)),cG=env(normalize(dG-n*.45)),cB=env(normalize(dB-n*.5));
    vec3 refr=vec3(cR.r,cG.g,cB.b);
    vec3 refl=env(reflect(rd,n));
    vec3 cc=mix(refr*.95,refl,fr*.85);
    float spec=pow(max(0.,dot(reflect(rd,n),normalize(vec3(.5,.7,-.5)))),80.);
    cc+=spec*1.4;
    // радужная плёнка по кромке
    cc+=fr*.35*(.5+.5*cos(6.28*(fr*1.6+vec3(0.,.33,.67))+uTime*.3));
    // кольцо отражается в сфере тенью полосы
    col=vec4(cc,1.);
  }
  // мягкое свечение вокруг
  float glow=exp(-3.*max(0.,length(uv)-.32))*.18;
  if(col.a<.5) col=vec4(uC2*1.2,glow);
  col.rgb+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.03;
  gl_FragColor=col;
}`

export function PrismCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={PRISM} colors={colors} className="prism-canvas" maxDpr={1.25} />
}

/** Указатель разделов слева: подсвечивает раздел, который сейчас в кадре. */
export function Rail({ links }: { links: { href: string; label: string }[] }) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = links.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [links])
  return (
    <nav className="prism-rail" aria-label="Разделы страницы">
      {links.map((l, i) => (
        <a key={l.href} href={l.href} className={active === l.href ? 'is-on' : ''}>
          <span>{String(i + 1).padStart(2, '0')}</span>
          <b>{l.label}</b>
        </a>
      ))}
    </nav>
  )
}

/** Карусель работ: секция закреплена, вертикальная прокрутка двигает ленту панелей. */
export function Carousel({ count, children }: { count: number; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  useEffect(() => {
    const w = wrap.current!
    const tr = track.current!
    let raf = 0
    const update = () => {
      raf = 0
      const r = w.getBoundingClientRect()
      const total = w.offsetHeight - innerHeight
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)))
      const panels = [...tr.children] as HTMLElement[]
      const pw = panels[0]?.offsetWidth ?? 1
      const gap = parseFloat(getComputedStyle(tr).columnGap) || 0
      const pos = p * (count - 1)
      tr.style.transform = `translate3d(${-pos * (pw + gap)}px,0,0)`
      panels.forEach((el, k) => {
        const d = k - pos
        const a = Math.max(-1, Math.min(1, d))
        el.style.transform = `perspective(1400px) rotateY(${-a * 28}deg) translateZ(${-Math.abs(a) * 160}px) scale(${1 - Math.min(1, Math.abs(d)) * 0.12})`
        el.style.opacity = String(1 - Math.min(0.65, Math.abs(d) * 0.4))
      })
      setI(Math.round(pos))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => {
      removeEventListener('scroll', on)
      removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [count])
  return (
    <div ref={wrap} className="prism-carousel" style={{ ['--n' as string]: count }}>
      <div className="prism-carousel__sticky">
        <div ref={track} className="prism-carousel__track">
          {children}
        </div>
        <p className="prism-carousel__count">
          <b>{String(i + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}
        </p>
      </div>
    </div>
  )
}

export function PrismHeader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const on = () => ref.current?.classList.toggle('is-solid', scrollY > 60)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <header ref={ref} className="prism-header">
      {children}
    </header>
  )
}
