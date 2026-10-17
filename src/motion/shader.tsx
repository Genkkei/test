'use client'

import { useEffect, useRef } from 'react'

/*
 * Полноэкранный фрагментный шейдер без библиотек: один треугольник, свои uniform'ы.
 * Шаблоны отдают только текст шейдера. Даёт всем одинаково:
 *   uTime, uRes (px), uMouse (0..1, сглаженный), uScroll (0..1 от высоты страницы),
 *   uVel (скорость прокрутки, сглаженная), uC1..uC4 (цвета темы, linear 0..1).
 * Рисует только пока холст в кадре и вкладка видна; плотность пикселей ограничена,
 * потому что полноэкранный шейдер платит за каждый пиксель. При reduced motion — один кадр.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

export const GLSL_NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*snoise(p);p=r*p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
`

const HEADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime;uniform vec2 uRes;uniform vec2 uMouse;uniform float uScroll;uniform float uVel;
uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;uniform vec3 uC4;
${GLSL_NOISE}
`

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().replace('#', '')
  const n = parseInt(m.length === 3 ? m.replace(/./g, (c) => c + c) : m, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function ShaderCanvas({
  frag,
  colors,
  className,
  maxDpr = 1.5,
  scale = 1,
  interactive = true,
}: {
  /** тело шейдера: должна быть функция void main(), заголовок с uniform'ами подставляется */
  frag: string
  colors: string[]
  className?: string
  maxDpr?: number
  /** доля разрешения: 0.5 — рисовать в половину и растягивать (для мягких полей) */
  scale?: number
  interactive?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const colorKey = colors.join(',')

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' })
    if (!gl) {
      canvas.dataset.nogl = '1'
      return
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, HEADER + frag))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog))
      canvas.dataset.nogl = '1'
      return
    }
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = (n: string) => gl.getUniformLocation(prog, n)
    const uTime = u('uTime'), uRes = u('uRes'), uMouse = u('uMouse'), uScroll = u('uScroll'), uVel = u('uVel')
    colorKey.split(',').slice(0, 4).forEach((c, i) => gl.uniform3fv(u(`uC${i + 1}`), hexToRgb(c)))
    for (let i = colorKey.split(',').length; i < 4; i++) gl.uniform3fv(u(`uC${i + 1}`), hexToRgb(colorKey.split(',')[0]))

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('reduce-motion')
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let vel = 0
    let lastY = window.scrollY
    let visible = true
    let raf = 0
    const t0 = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * scale
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const frame = (now: number) => {
      raf = 0
      resize()
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      const y = window.scrollY
      vel += (Math.max(-80, Math.min(80, y - lastY)) - vel) * 0.1
      lastY = y
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      gl.uniform1f(uTime, reduce ? 12 : (now - t0) / 1000)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uScroll, y / max)
      gl.uniform1f(uVel, vel / 80)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onMove = (e: PointerEvent) => {
      if (!interactive) return
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = 1 - (e.clientY - r.top) / r.height
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', kick)
    const ro = new ResizeObserver(kick)
    ro.observe(canvas)
    kick()
    canvas.dataset.ready = '1'

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', kick)
      // loseContext() здесь нельзя: в StrictMode эффект запускается дважды на том же холсте,
      // и второй запуск получил бы потерянный контекст — шейдер «не компилируется» без лога
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [frag, colorKey, maxDpr, scale, interactive])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
