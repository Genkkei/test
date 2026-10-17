/* Заглушка вместо фото украшения: золотая вещь на бархате, нарисованная векторно.
 * Шесть видов (кольцо, серьги, колье, браслет, бриллиант, браслет-бэнгл), выбор — по номеру. */

const G = (id: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#6b4c22" />
    <stop offset=".3" stopColor="#f3dc9e" />
    <stop offset=".5" stopColor="#a87b34" />
    <stop offset=".75" stopColor="#ffeebe" />
    <stop offset="1" stopColor="#5e421d" />
  </linearGradient>
)

function Stone({ x, y, r, id }: { x: number; y: number; r: number; id: string }) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`
  }).join(' ')
  const inner = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    return `${(x + Math.cos(a) * r * 0.55).toFixed(1)},${(y + Math.sin(a) * r * 0.55).toFixed(1)}`
  }).join(' ')
  return (
    <g>
      <polygon points={pts} fill={`url(#${id}s)`} stroke="#fff" strokeOpacity=".6" strokeWidth=".4" />
      <polygon points={inner} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth=".35" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        return <line key={i} x1={x + Math.cos(a) * r * 0.55} y1={y + Math.sin(a) * r * 0.55} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} stroke="#fff" strokeOpacity=".5" strokeWidth=".3" />
      })}
    </g>
  )
}

export function Jewel({ index, label, className, uid = "w" }: { index: number; label: string; className?: string; uid?: string }) {
  const id = `jw${uid}${index}`
  const kind = index % 6
  let body: React.ReactNode
  if (kind === 0) {
    body = (
      <g>
        <ellipse cx="50" cy="60" rx="24" ry="9" fill="none" stroke={`url(#${id}g)`} strokeWidth="4.5" />
        <path d="M44 51 L50 44 L56 51 Z" fill={`url(#${id}g)`} />
        <Stone x={50} y={40} r={7} id={id} />
      </g>
    )
  } else if (kind === 1) {
    body = (
      <g>
        {[36, 64].map((x) => (
          <g key={x}>
            <circle cx={x} cy="28" r="2.6" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.2" />
            <line x1={x} y1="31" x2={x} y2="44" stroke={`url(#${id}g)`} strokeWidth="1" />
            <path d={`M${x} 44 C ${x + 9} 54, ${x + 7} 70, ${x} 72 C ${x - 7} 70, ${x - 9} 54, ${x} 44 Z`} fill={`url(#${id}g)`} />
            <Stone x={x} y={60} r={3.6} id={id} />
          </g>
        ))}
      </g>
    )
  } else if (kind === 2) {
    const dots = Array.from({ length: 23 }, (_, i) => {
      const t = i / 22
      return [14 + t * 72, 22 + Math.sin(t * Math.PI) * 30]
    })
    body = (
      <g>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.3" fill={`url(#${id}g)`} />
        ))}
        <path d="M50 54 C 58 62, 56 76, 50 80 C 44 76, 42 62, 50 54 Z" fill={`url(#${id}g)`} />
        <Stone x={50} y={70} r={4} id={id} />
      </g>
    )
  } else if (kind === 3) {
    body = (
      <g>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return <ellipse key={i} cx={50 + Math.cos(a) * 26} cy={52 + Math.sin(a) * 14} rx="4.2" ry="2.6" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.3" transform={`rotate(${(a * 180) / Math.PI + 90} ${50 + Math.cos(a) * 26} ${52 + Math.sin(a) * 14})`} />
        })}
      </g>
    )
  } else if (kind === 4) {
    body = <Stone x={50} y={50} r={24} id={id} />
  } else {
    body = (
      <g>
        <ellipse cx="46" cy="54" rx="26" ry="12" fill="none" stroke={`url(#${id}g)`} strokeWidth="3" />
        <ellipse cx="54" cy="50" rx="26" ry="12" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.6" transform="rotate(-8 54 50)" />
      </g>
    )
  }
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        {G(`${id}g`)}
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#d6e6ef" />
          <stop offset="1" stopColor="#8aa3b3" />
        </linearGradient>
        <radialGradient id={`${id}b`} cx=".5" cy=".42" r=".7">
          <stop offset="0" stopColor="#2a221b" />
          <stop offset=".6" stopColor="#14110e" />
          <stop offset="1" stopColor="#0a0807" />
        </radialGradient>
        <radialGradient id={`${id}h`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}b)`} />
      <ellipse cx="50" cy="84" rx="30" ry="4" fill={`url(#${id}h)`} />
      <g transform={`rotate(${((index * 37) % 24) - 12} 50 52)`}>{body}</g>
    </svg>
  )
}
