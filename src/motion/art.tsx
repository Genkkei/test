/*
 * Генеративная иллюстрация на месте фото: детерминирована от seed (одинакова на сервере
 * и в браузере), собрана из цветов темы. Это честная заглушка — не стоковое фото,
 * которое выдаёт себя за работу клиента. В админке её заменяет адрес настоящего снимка.
 */

function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type ArtKind = 'blobs' | 'rings' | 'stripes' | 'grid' | 'arch' | 'orbit' | 'waves'

export function Art({
  seed,
  colors,
  kind = 'blobs',
  className,
  label,
}: {
  seed: string
  colors: string[]
  kind?: ArtKind
  className?: string
  label?: string
}) {
  const r = rng(seed)
  const c = (i: number) => colors[i % colors.length]
  const id = `a${Math.floor(r() * 1e9).toString(36)}`
  const shapes: React.ReactNode[] = []

  if (kind === 'blobs') {
    for (let i = 0; i < 5; i++) {
      shapes.push(<circle key={i} cx={r() * 100} cy={r() * 100} r={18 + r() * 34} fill={c(i + 1)} opacity={0.85} />)
    }
  } else if (kind === 'rings') {
    const cx = 30 + r() * 40, cy = 30 + r() * 40
    for (let i = 0; i < 9; i++) shapes.push(<circle key={i} cx={cx} cy={cy} r={8 + i * 9} fill="none" stroke={c(i % 2 ? 1 : 2)} strokeWidth={0.6 + r() * 1.8} />)
  } else if (kind === 'stripes') {
    const a = Math.floor(r() * 180)
    for (let i = 0; i < 14; i++) shapes.push(<rect key={i} x={-50 + i * 14} y={-50} width={4 + r() * 7} height={220} fill={c(1 + (i % 3))} transform={`rotate(${a} 50 50)`} />)
  } else if (kind === 'grid') {
    for (let x = 0; x < 6; x++)
      for (let y = 0; y < 6; y++) if (r() > 0.45) shapes.push(<rect key={`${x}${y}`} x={x * 16.6 + 1} y={y * 16.6 + 1} width={14.6} height={14.6} rx={r() > 0.6 ? 7.3 : 0} fill={c(1 + Math.floor(r() * 3))} />)
  } else if (kind === 'arch') {
    const n = 3 + Math.floor(r() * 3)
    for (let i = 0; i < n; i++) {
      const w = 100 / n
      const h = 40 + r() * 50
      shapes.push(<path key={i} d={`M${i * w + 2} 100 V${100 - h + w / 2} A${w / 2 - 2} ${w / 2 - 2} 0 0 1 ${(i + 1) * w - 2} ${100 - h + w / 2} V100Z`} fill={c(1 + (i % 3))} />)
    }
  } else if (kind === 'orbit') {
    shapes.push(<circle key="s" cx={50} cy={50} r={22 + r() * 10} fill={c(1)} />)
    for (let i = 0; i < 3; i++) shapes.push(<ellipse key={i} cx={50} cy={50} rx={40 + i * 6} ry={10 + i * 6} fill="none" stroke={c(2 + i)} strokeWidth={0.8} transform={`rotate(${r() * 180} 50 50)`} />)
  } else {
    for (let i = 0; i < 8; i++) {
      const y = 10 + i * 11
      shapes.push(<path key={i} d={`M-5 ${y} C 25 ${y - 14 * r()}, 55 ${y + 14 * r()}, 105 ${y - 6}`} fill="none" stroke={c(1 + (i % 3))} strokeWidth={2 + r() * 4} strokeLinecap="round" />)
    }
  }

  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <filter id={`${id}b`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={kind === 'blobs' ? 9 : 0} />
        </filter>
        <filter id={`${id}g`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" />
        </filter>
      </defs>
      <rect width="100" height="100" fill={c(0)} />
      <g filter={`url(#${id}b)`}>{shapes}</g>
      <rect width="100" height="100" filter={`url(#${id}g)`} />
    </svg>
  )
}

/** Фото, если задано, иначе генеративная иллюстрация. */
export function Media({
  src,
  alt,
  seed,
  colors,
  kind,
  className,
}: {
  src?: string
  alt: string
  seed: string
  colors: string[]
  kind?: ArtKind
  className?: string
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />
  }
  return <Art className={className} seed={seed} colors={colors} kind={kind} label={alt} />
}
