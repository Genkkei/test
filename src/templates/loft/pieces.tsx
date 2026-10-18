/*
 * Предметы лофт-мебели линией, как на чертеже цеха: сталь — толстой линией, массив — заливкой
 * акцентом. Вид выбирается по названию позиции на любом из трёх языков, иначе по порядку.
 */

export type LoftKind = 'table' | 'stool' | 'rack' | 'desk' | 'bench' | 'bar' | 'console'

const WORDS: [LoftKind, RegExp][] = [
  ['bar', /барн|bar|bar stol/i],
  ['stool', /стул|табурет|stul|taburet|stool|chair/i],
  ['rack', /стеллаж|полк|shelf|rack|javon|stellaj/i],
  ['desk', /письмен|рабоч|desk|ish stoli|kompyuter/i],
  ['bench', /скам|bench|skameyka|o‘rindiq/i],
  ['console', /консол|тумб|console|tumba|komod|комод/i],
  ['table', /стол|table|stol/i],
]
const ORDER: LoftKind[] = ['table', 'stool', 'rack', 'desk', 'bench', 'bar', 'console']

export function loftKind(title: string, i: number): LoftKind {
  return WORDS.find(([, re]) => re.test(title))?.[0] ?? ORDER[i % ORDER.length]
}

export function LoftPiece({ kind, className = '' }: { kind: LoftKind; className?: string }) {
  const steel = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.2, strokeLinecap: 'square' as const, pathLength: 1, className: 'loft-draw' }
  const wood = { style: { fill: 'var(--accent)' }, className: 'loft-wood' }
  let body: React.ReactNode
  switch (kind) {
    case 'stool':
      body = (
        <>
          <rect x="70" y="40" width="60" height="9" rx="2" {...wood} />
          <path d="M78 49 L70 150 M122 49 L130 150 M74 108 H126" {...steel} />
        </>
      )
      break
    case 'rack':
      body = (
        <>
          <path d="M56 22 V154 M144 22 V154 M56 22 H144 M56 154 H144 M56 22 L144 64 M144 22 L56 64" {...steel} />
          {[44, 84, 124].map((y) => (
            <rect key={y} x="56" y={y} width="88" height="7" {...wood} />
          ))}
        </>
      )
      break
    case 'desk':
      body = (
        <>
          <rect x="28" y="62" width="144" height="10" rx="2" {...wood} />
          <path d="M36 72 V150 M36 72 H60 V150 M164 72 V150 M140 72 V150 M140 92 H164 M140 116 H164" {...steel} />
        </>
      )
      break
    case 'bench':
      body = (
        <>
          <rect x="22" y="92" width="156" height="11" rx="2" {...wood} />
          <path d="M34 103 L44 150 H64 L74 103 M126 103 L136 150 H156 L166 103 M54 150 H146" {...steel} />
        </>
      )
      break
    case 'bar':
      body = (
        <>
          <rect x="40" y="34" width="120" height="10" rx="2" {...wood} />
          <path d="M60 44 V150 M140 44 V150 M60 128 H140 M44 150 H76 M124 150 H156" {...steel} />
        </>
      )
      break
    case 'console':
      body = (
        <>
          <rect x="34" y="60" width="132" height="9" rx="2" {...wood} />
          <rect x="44" y="104" width="112" height="8" rx="2" {...wood} />
          <path d="M42 69 V150 M158 69 V150 M42 69 L158 150 M158 69 L42 150" {...steel} />
        </>
      )
      break
    default:
      body = (
        <>
          <rect x="18" y="66" width="164" height="12" rx="2" {...wood} />
          <path d="M34 78 L28 150 M166 78 L172 150 M28 150 L60 78 M172 150 L140 78 M46 118 H154" {...steel} />
        </>
      )
  }
  return (
    <svg className={`loft-piece ${className}`} viewBox="0 0 200 170" aria-hidden="true">
      <line x1="8" y1="158" x2="192" y2="158" stroke="currentColor" strokeOpacity=".25" strokeDasharray="2 5" />
      {body}
    </svg>
  )
}
