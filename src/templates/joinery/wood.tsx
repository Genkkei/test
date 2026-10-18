/*
 * Дерево без фотографий: годовые кольца спила и «волокна» пород.
 * Кольца — замкнутые кривые с детерминированной неровностью (синусы от номера кольца),
 * поэтому сервер и браузер рисуют одно и то же, а спил выглядит живым, а не циркулем.
 */

function ring(cx: number, cy: number, r: number, k: number): string {
  const pts: string[] = []
  const n = 64
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const wob = 1 + 0.045 * Math.sin(a * 3 + k * 1.7) + 0.03 * Math.sin(a * 5 - k * 0.9) + 0.02 * Math.sin(a * 9 + k)
    const x = cx + Math.cos(a) * r * wob * 1.18
    const y = cy + Math.sin(a) * r * wob
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return `${pts.join(' ')}Z`
}

/** Спил ствола с живым краем: кольца прорисовываются от сердцевины наружу. */
export function Slab({ className = '' }: { className?: string }) {
  const rings = Array.from({ length: 17 }, (_, i) => 10 + i * 9.2)
  return (
    <svg className={`joinery-slab ${className}`} viewBox="0 0 400 320" aria-hidden="true">
      <defs>
        <filter id="joinery-bark" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="14" />
        </filter>
        <radialGradient id="joinery-heart" cx="46%" cy="52%" r="60%">
          <stop offset="0" style={{ stopColor: 'var(--joinery-light)' }} />
          <stop offset=".7" style={{ stopColor: 'var(--joinery-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--accent)' }} />
        </radialGradient>
      </defs>
      <path d={ring(186, 162, 168, 2)} style={{ fill: 'color-mix(in srgb, var(--accent) 70%, #1a0f06)' }} filter="url(#joinery-bark)" />
      <path d={ring(186, 162, 158, 3)} fill="url(#joinery-heart)" />
      <g className="joinery-rings">
        {rings.map((r, i) => (
          <path key={i} d={ring(186 - i * 0.6, 162 + i * 0.3, r, i)} pathLength={1} style={{ ['--i' as string]: i }} />
        ))}
      </g>
      <path className="joinery-crack" d="M186 162 L238 118 L262 110" pathLength={1} />
    </svg>
  )
}

export type Species = 'oak' | 'walnut' | 'elm' | 'ash' | 'pine' | 'slab'

const SPECIES: [Species, RegExp][] = [
  ['walnut', /орех|walnut|yong‘oq|yongoq/i],
  ['elm', /карагач|вяз|elm|qayrag‘och|qayragoch/i],
  ['ash', /ясен|ash|shumtol/i],
  ['pine', /сосн|хвой|pine|qarag‘ay|qaragay/i],
  ['slab', /слэб|слеб|slab|spil|спил/i],
  ['oak', /дуб|oak|eman/i],
]

export function speciesOf(text: string, i: number): Species {
  return SPECIES.find(([, re]) => re.test(text))?.[0] ?? (['oak', 'walnut', 'elm', 'ash', 'slab', 'pine'] as Species[])[i % 6]
}

/** Образец древесины: цвет породы + волокна — повторяющийся градиент со сдвигом. */
export function Grain({ species, className = '' }: { species: Species; className?: string }) {
  return <span className={`joinery-grain joinery-grain--${species} ${className}`} aria-hidden="true" />
}
