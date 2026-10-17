'use client'

import { ShaderCanvas } from '@/motion/shader'

/* Свет из окна: тени оконного переплёта на стене, размытые и чуть косые, по ним
 * медленно качается листва. Солнце сдвигается от прокрутки — как день в комнате. */
const WINDOW = `
float frame(vec2 p){
  // окно 2×3 стекла с переплётом; координаты в «окне» — проекция на стену с наклоном
  vec2 q=p*vec2(1.,1.15);
  q.x+=q.y*.32;
  vec2 cell=abs(fract(q*vec2(2.2,2.8))-.5);
  float bars=smoothstep(.43,.47,max(cell.x*1.05,cell.y));
  float inside=step(abs(q.x-.05),.95)*step(abs(q.y+.05),.62);
  return inside*(1.-bars);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float sun=uScroll*.5;
  vec2 w=p-vec2(.35-sun,.05+sun*.3);
  // размытие края тени — несколько выборок со смещением
  float l=0.;
  for(int i=0;i<5;i++){float fi=float(i)-2.;l+=frame(w+vec2(fi*.006,fi*.004));}
  l/=5.;
  // листва: шумовые пятна тени, медленно качаются
  float leaves=snoise(p*3.2+vec2(sin(uTime*.25)*.25,uTime*.04))+.6*snoise(p*7.+vec2(uTime*.12,0.));
  float leafShade=smoothstep(.15,.65,leaves)*.55;
  l*=1.-leafShade;
  vec3 wall=mix(uC1,uC2,uv.y*.35);
  vec3 warm=mix(uC1,vec3(1.,.93,.8),.65);
  vec3 col=mix(wall*.94,warm,l*.85);
  col*=1.-.18*length(uv-vec2(.6,.55));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.02;
  gl_FragColor=vec4(col,1.);
}`

export function WindowLight({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={WINDOW} colors={colors} className="kin-canvas" maxDpr={1} scale={0.7} interactive={false} />
}
