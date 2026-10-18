'use client'

import { ShaderCanvas } from '@/motion/shader'

/*
 * Капля сыворотки: три метабола медленно дышат и тянутся к курсору; нормаль — по градиенту поля,
 * сверху мягкий блик, как на стекле флакона. Поле считается 4 раза на пиксель — дёшево.
 */
const SERUM = `
float field(vec2 p){
  float t=uTime*.22;
  vec2 m=(uMouse-.5)*vec2(.5,.35);
  float f=0.;
  f+=.075/length(p-vec2(.28+.06*sin(t*1.1),.02+.07*cos(t*1.3))-m*.6);
  f+=.055/length(p-vec2(.02+.08*cos(t*.8),-.16+.05*sin(t))-m*.25);
  f+=.04/length(p-vec2(.46+.05*sin(t*1.7),.26+.06*cos(t*.6)));
  f+=.03/length(p-vec2(-.42+.04*cos(t*.9),.22+.05*sin(t*1.2)));
  return f;
}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  p.y+=uScroll*.25;
  float e=.004;
  float f=field(p);
  vec2 g=vec2(field(p+vec2(e,0.))-f,field(p+vec2(0.,e))-f)/e;
  float inside=smoothstep(.92,1.02,f);
  vec3 n=normalize(vec3(-g*.05,1.));
  vec3 l=normalize(vec3(-.4,.6,.7));
  float diff=clamp(dot(n,l),0.,1.);
  float spec=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.),60.);
  float rim=smoothstep(.92,1.0,f)-smoothstep(1.0,1.25,f);
  vec3 bg=uC1;
  vec3 gel=mix(uC2*.92,mix(uC2,uC3,.45)*1.08,diff);
  vec3 col=mix(bg,gel,inside*.9);
  col+=spec*inside*.85;
  col+=rim*.06;
  // тень капли на «бумаге»
  col*=1.-.08*smoothstep(.55,.95,field(p+vec2(-.03,.05)))*(1.-inside);
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.018;
  gl_FragColor=vec4(col,1.);
}`

export function Serum({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={SERUM} colors={colors} className="glow-serum" maxDpr={1.5} />
}
