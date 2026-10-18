'use client'

import { ShaderCanvas } from '@/motion/shader'

/*
 * Горн: снизу дышит раскалённый жар (fbm), вверх летят искры — по одной на клетку
 * сетки, которая сама едет вверх, поэтому на пиксель считается одна клетка, а не сотня частиц.
 * Курсор — второй очаг: возле него жар ярче и искр больше.
 */
const FORGE = `
vec3 heat(float k){
  // цвета каления: тёмно-вишнёвый → оранжевый (акцент темы) → соломенный → белый
  vec3 a=vec3(.35,.03,.01), b=uC2, c=vec3(1.,.82,.45), d=vec3(1.,.97,.9);
  return k<.4?mix(a,b,k/.4):k<.8?mix(b,c,(k-.4)/.4):mix(c,d,(k-.8)/.2);
}
float spark(vec2 uv,float t,float sc,float sp,float seed){
  vec2 p=uv*sc; p.y-=t*sp; p.x+=sin(p.y*.7+seed)*.35;
  vec2 id=floor(p), f=fract(p)-.5;
  float h=hash(id+seed);
  if(h<.86) return 0.;
  vec2 o=vec2(hash(id+seed+1.3)-.5,hash(id+seed+2.7)-.5)*.55;
  float d=length((f-o)*vec2(1.,.28));
  float blink=.55+.45*sin(t*9.+h*40.);
  return smoothstep(.055,.0,d)*blink;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 q=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime;
  vec2 m=vec2((uMouse.x-.5)*uRes.x/uRes.y,.5-uMouse.y);
  // жар снизу
  float n=fbm(vec2(q.x*1.6,q.y*1.2-t*.18))*.5+.5;
  float bed=smoothstep(.75,-.05,uv.y)*(.55+.45*n);
  float near=exp(-length(q-m)*3.2)*.55;
  float g=clamp(bed*.85+near*n,0.,1.);
  vec3 col=uC1*.6;
  col+=heat(g)*pow(g,1.6)*1.15;
  // искры: три слоя разного размера и скорости
  float s=spark(q,t,9.,.55,0.)+spark(q,t,15.,.8,7.)*.8+spark(q,t,24.,1.15,13.)*.6;
  s*=smoothstep(1.1,.0,uv.y+.1)+near*1.6;
  col+=heat(.85)*s*1.4;
  // виньетка и зерно
  col*=1.-.45*length(uv-vec2(.5,.35));
  col+=(hash(gl_FragCoord.xy+fract(t))-.5)*.03;
  gl_FragColor=vec4(col,1.);
}`

export function ForgeCanvas({ colors }: { colors: string[] }) {
  return <ShaderCanvas frag={FORGE} colors={colors} className="anvil-canvas" maxDpr={1.25} />
}
