/* Машина сбоку векторно: четыре силуэта (седан, кроссовер, минивэн, купе), цвет кузова — свой.
 * Колёса — отдельные группы, их крутит CSS (.drv-wheel), пока машина «едет». */

export type CarKind = 'sedan' | 'suv' | 'van' | 'coupe'

const BODY: Record<CarKind, { body: string; glass: string }> = {
  sedan: {
    body: 'M8 60 L10 50 Q14 43 34 41 L60 28 Q70 23 92 23 L118 23 Q132 23 144 31 L158 40 Q184 42 190 49 L192 60 Z',
    glass: 'M66 39 L74 31 Q80 27 92 27 L104 27 L104 39 Z M108 27 L118 27 Q130 27 140 34 L146 39 L108 39 Z',
  },
  suv: {
    body: 'M8 60 L9 42 Q11 33 26 32 L48 30 L60 17 Q64 13 80 13 L142 13 Q152 13 158 21 L168 31 Q188 33 191 42 L192 60 Z',
    glass: 'M54 30 L64 18 Q67 16 78 16 L104 16 L104 30 Z M108 16 L140 16 Q148 16 153 22 L161 30 L108 30 Z',
  },
  van: {
    body: 'M8 60 L9 36 Q11 25 26 21 L50 11 Q56 9 70 9 L164 9 Q178 9 182 20 L188 38 Q192 44 192 60 Z',
    glass: 'M38 30 L54 15 Q58 13 70 13 L100 13 L100 30 Z M104 13 L136 13 L136 30 L104 30 Z M140 13 L164 13 Q174 13 177 21 L180 30 L140 30 Z',
  },
  coupe: {
    body: 'M8 60 L11 51 Q20 45 44 42 L72 29 Q82 25 100 25 L116 25 Q132 27 148 37 Q182 41 189 49 L192 60 Z',
    glass: 'M78 40 L86 32 Q92 28 102 28 L112 28 L112 40 Z M116 28 Q128 30 138 36 L142 40 L116 40 Z',
  },
}

export function carKindOf(text: string): CarKind {
  const t = text.toLowerCase()
  if (/внедор|кросс|cross|suv|krossover|jeep|4x4|джип/.test(t)) return 'suv'
  if (/минив|van|микроавт|miniven/.test(t)) return 'van'
  if (/купе|coupe|спорт|sport|кабри|kabri/.test(t)) return 'coupe'
  return 'sedan'
}

export function Car({ kind, color, label, className }: { kind: CarKind; color: string; label?: string; className?: string }) {
  const v = BODY[kind]
  const Wheel = ({ x }: { x: number }) => (
    <g className="drv-wheel" style={{ transformOrigin: `${x}px 60px` }}>
      <circle cx={x} cy="60" r="14" fill="#111" />
      <circle cx={x} cy="60" r="8.5" fill="#cfd2d6" />
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={x - 1.2} y="52" width="2.4" height="8" fill="#6d7177" transform={`rotate(${a} ${x} 60)`} />
      ))}
      <circle cx={x} cy="60" r="2.4" fill="#111" />
    </g>
  )
  return (
    <svg className={className} viewBox="0 0 200 80" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <ellipse cx="100" cy="75" rx="92" ry="4" fill="#000" opacity=".16" />
      <path d={v.body} fill={color} />
      <path d={v.body} fill="url(#drvShade)" />
      <path d={v.glass} fill="url(#drvGlass)" />
      <circle cx="46" cy="60" r="17.5" fill="#15171a" />
      <circle cx="154" cy="60" r="17.5" fill="#15171a" />
      <path d="M8 60 H192" stroke="#15171a" strokeWidth="3" />
      <path d="M12 52 H190" stroke="#000" strokeOpacity=".18" strokeWidth=".8" />
      <rect x="183" y="44" width="7" height="3" rx="1.5" fill="#fff" opacity=".9" />
      <rect x="9" y="45" width="5" height="3" rx="1.5" fill="#ff3b30" opacity=".9" />
      <Wheel x={46} />
      <Wheel x={154} />
      <defs>
        <linearGradient id="drvGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a4048" />
          <stop offset=".5" stopColor="#14171b" />
          <stop offset="1" stopColor="#262b31" />
        </linearGradient>
        <linearGradient id="drvShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".28" />
        </linearGradient>
      </defs>
    </svg>
  )
}
