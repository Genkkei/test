/*
 * Диван линией и заливкой: ткань — переменная --sofa-fabric, поэтому один и тот же рисунок
 * перекрашивается без перерисовки (переключатель обивки на первом экране, точки на карточках).
 * Тени и блики — полупрозрачные слои поверх ткани: цвет любой, объём одинаковый.
 */

export type CouchKind = 'two' | 'three' | 'corner' | 'chair' | 'pouf' | 'bed' | 'modular'

const WORDS: [CouchKind, RegExp][] = [
  ['corner', /углов|burchak|corner|sectional/i],
  ['modular', /модул|modul/i],
  ['bed', /кровать|ложе|krovat|karavot|bed/i],
  ['pouf', /пуф|банкет|puf|pouf|ottoman/i],
  ['chair', /кресл|kreslo|armchair|chair/i],
  ['three', /тр[её]х|3-|uch o‘rin|three|3 ?seat/i],
  ['two', /дв[ау]х|2-|ikki|two|loveseat/i],
]
const ORDER: CouchKind[] = ['three', 'corner', 'two', 'chair', 'modular', 'pouf', 'bed']

export function couchKind(title: string, i: number): CouchKind {
  return WORDS.find(([, re]) => re.test(title))?.[0] ?? ORDER[i % ORDER.length]
}

const shade = 'rgb(0 0 0 / .16)'
const shade2 = 'rgb(0 0 0 / .28)'
const light = 'rgb(255 255 255 / .16)'

function Legs({ xs, y }: { xs: number[]; y: number }) {
  return (
    <g className="sofa-legs">
      {xs.map((x) => (
        <rect key={x} x={x} y={y} width="7" height="14" rx="2" />
      ))}
    </g>
  )
}

export function Couch({ kind, className = '' }: { kind: CouchKind; className?: string }) {
  const f = 'var(--sofa-fabric)'
  let body: React.ReactNode
  switch (kind) {
    case 'chair':
      body = (
        <>
          <Legs xs={[86, 206]} y={160} />
          <rect x="92" y="58" width="116" height="74" rx="22" style={{ fill: f }} />
          <rect x="92" y="58" width="116" height="74" rx="22" fill={shade} />
          <rect x="72" y="96" width="36" height="66" rx="16" style={{ fill: f }} />
          <rect x="192" y="96" width="36" height="66" rx="16" style={{ fill: f }} />
          <rect x="100" y="118" width="100" height="42" rx="14" style={{ fill: f }} />
          <rect x="100" y="118" width="100" height="10" rx="5" fill={light} />
        </>
      )
      break
    case 'pouf':
      body = (
        <>
          <Legs xs={[104, 190]} y={150} />
          <rect x="94" y="96" width="112" height="58" rx="24" style={{ fill: f }} />
          <rect x="94" y="96" width="112" height="14" rx="7" fill={light} />
          <path d="M150 100 V150" stroke={shade2} strokeWidth="2" />
        </>
      )
      break
    case 'bed':
      body = (
        <>
          <Legs xs={[30, 264]} y={160} />
          <rect x="20" y="40" width="54" height="124" rx="16" style={{ fill: f }} />
          <rect x="20" y="40" width="54" height="124" rx="16" fill={shade} />
          <rect x="60" y="118" width="226" height="44" rx="12" style={{ fill: f }} />
          <rect x="70" y="104" width="206" height="22" rx="10" fill="rgb(255 255 255 / .8)" />
          <rect x="80" y="92" width="56" height="20" rx="9" fill="rgb(255 255 255 / .92)" />
        </>
      )
      break
    case 'corner':
      body = (
        <>
          <Legs xs={[22, 160, 268]} y={160} />
          <rect x="16" y="56" width="268" height="58" rx="18" style={{ fill: f }} />
          <rect x="16" y="56" width="268" height="58" rx="18" fill={shade} />
          <rect x="196" y="74" width="92" height="92" rx="16" style={{ fill: f }} />
          <rect x="10" y="98" width="30" height="66" rx="13" style={{ fill: f }} />
          <rect x="34" y="114" width="168" height="48" rx="12" style={{ fill: f }} />
          <rect x="34" y="114" width="168" height="10" rx="5" fill={light} />
          <rect x="196" y="74" width="92" height="12" rx="6" fill={light} />
          <path d="M118 116 V160 M196 120 V164" stroke={shade2} strokeWidth="2" />
        </>
      )
      break
    case 'modular':
      body = (
        <>
          <Legs xs={[24, 140, 266]} y={160} />
          {[16, 112, 208].map((x) => (
            <g key={x}>
              <rect x={x} y="62" width="88" height="56" rx="16" style={{ fill: f }} />
              <rect x={x} y="62" width="88" height="56" rx="16" fill={shade} />
              <rect x={x} y="114" width="88" height="48" rx="12" style={{ fill: f }} />
              <rect x={x} y="114" width="88" height="10" rx="5" fill={light} />
            </g>
          ))}
        </>
      )
      break
    case 'two':
      body = (
        <>
          <Legs xs={[58, 236]} y={160} />
          <rect x="62" y="58" width="176" height="62" rx="20" style={{ fill: f }} />
          <rect x="62" y="58" width="176" height="62" rx="20" fill={shade} />
          <rect x="42" y="94" width="38" height="70" rx="16" style={{ fill: f }} />
          <rect x="220" y="94" width="38" height="70" rx="16" style={{ fill: f }} />
          <rect x="72" y="116" width="156" height="46" rx="12" style={{ fill: f }} />
          <rect x="72" y="116" width="156" height="10" rx="5" fill={light} />
          <path d="M150 118 V160" stroke={shade2} strokeWidth="2" />
        </>
      )
      break
    default:
      body = (
        <>
          <Legs xs={[26, 266]} y={160} />
          <rect x="30" y="56" width="240" height="64" rx="20" style={{ fill: f }} />
          <rect x="30" y="56" width="240" height="64" rx="20" fill={shade} />
          <rect x="12" y="94" width="40" height="70" rx="16" style={{ fill: f }} />
          <rect x="248" y="94" width="40" height="70" rx="16" style={{ fill: f }} />
          <rect x="44" y="116" width="212" height="46" rx="12" style={{ fill: f }} />
          <rect x="44" y="116" width="212" height="10" rx="5" fill={light} />
          <path d="M115 118 V160 M185 118 V160" stroke={shade2} strokeWidth="2" />
        </>
      )
  }
  return (
    <svg className={`sofa-couch ${className}`} viewBox="0 0 300 180" aria-hidden="true">
      <ellipse cx="150" cy="174" rx="140" ry="6" fill="rgb(0 0 0 / .12)" />
      {body}
    </svg>
  )
}
