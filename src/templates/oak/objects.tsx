/*
 * Предметы мебели плоской графикой — вместо фото, пока владелец не загрузил свои.
 * Вид выбирается по словам в категории или названии (на любом из трёх языков), поэтому
 * переведённая карточка рисует тот же предмет. Цвета — из темы сайта: тело, дерево, линия.
 */

export type ObjKind = 'chair' | 'armchair' | 'sofa' | 'table' | 'lamp' | 'shelf' | 'vase' | 'bed' | 'stool' | 'sideboard' | 'wardrobe' | 'mirror'

const WORDS: [ObjKind, RegExp][] = [
  ['wardrobe', /шкаф|гардероб|купе|kiyim javon|shkaf|wardrobe|closet/i],
  ['sideboard', /комод|тумб|буфет|sideboard|dresser|komod|tumba/i],
  ['armchair', /кресл|armchair|kreslo|lounge/i],
  ['sofa', /диван|софа|sofa|divan|couch/i],
  ['bed', /кроват|bed|karavot/i],
  ['stool', /табурет|пуф|stool|pouf|kursicha|puf/i],
  ['chair', /стул|chair|stul|o‘rindiq/i],
  ['table', /стол|table|stol/i],
  ['lamp', /ламп|свет|торшер|светил|lamp|light|chiroq/i],
  ['shelf', /стеллаж|полк|shelf|javon|tokcha|rack/i],
  ['vase', /ваз|декор|кашпо|текстил|vase|decor|guldon|bezak/i],
  ['mirror', /зеркал|mirror|ko‘zgu|oyna/i],
]

export function kindOf(...texts: string[]): ObjKind {
  const t = texts.join(' ')
  return WORDS.find(([, re]) => re.test(t))?.[0] ?? 'chair'
}

type Paint = { body: string; wood: string; line: string }

function Shape({ kind, p }: { kind: ObjKind; p: Paint }) {
  const leg = { stroke: p.wood, strokeWidth: 5, strokeLinecap: 'round' as const }
  switch (kind) {
    case 'chair':
      return (
        <g>
          <path d="M70 40 Q100 30 130 40 L126 98 L74 98 Z" fill={p.body} />
          <rect x="62" y="98" width="76" height="16" rx="8" fill={p.body} />
          <line x1="72" y1="114" x2="64" y2="172" {...leg} />
          <line x1="128" y1="114" x2="136" y2="172" {...leg} />
          <line x1="86" y1="114" x2="90" y2="164" {...leg} strokeWidth={4} />
          <line x1="114" y1="114" x2="110" y2="164" {...leg} strokeWidth={4} />
        </g>
      )
    case 'armchair':
      return (
        <g>
          <path d="M48 70 Q48 40 78 40 L122 40 Q152 40 152 70 L152 128 L48 128 Z" fill={p.body} />
          <rect x="34" y="84" width="30" height="58" rx="14" fill={p.body} style={{ filter: "brightness(.92)" }} />
          <rect x="136" y="84" width="30" height="58" rx="14" fill={p.body} style={{ filter: "brightness(.92)" }} />
          <rect x="58" y="108" width="84" height="28" rx="10" fill={p.body} style={{ filter: "brightness(1.06)" }} />
          <line x1="52" y1="142" x2="46" y2="170" {...leg} />
          <line x1="148" y1="142" x2="154" y2="170" {...leg} />
        </g>
      )
    case 'sofa':
      return (
        <g>
          <rect x="22" y="70" width="156" height="56" rx="18" fill={p.body} />
          <rect x="14" y="96" width="26" height="52" rx="12" fill={p.body} style={{ filter: "brightness(.9)" }} />
          <rect x="160" y="96" width="26" height="52" rx="12" fill={p.body} style={{ filter: "brightness(.9)" }} />
          <rect x="38" y="112" width="60" height="30" rx="10" fill={p.body} style={{ filter: "brightness(1.07)" }} />
          <rect x="102" y="112" width="60" height="30" rx="10" fill={p.body} style={{ filter: "brightness(1.07)" }} />
          <line x1="30" y1="148" x2="28" y2="164" {...leg} />
          <line x1="170" y1="148" x2="172" y2="164" {...leg} />
        </g>
      )
    case 'table':
      return (
        <g>
          <ellipse cx="100" cy="86" rx="76" ry="14" fill={p.wood} />
          <rect x="24" y="86" width="152" height="8" fill={p.wood} style={{ filter: "brightness(.85)" }} />
          <line x1="52" y1="94" x2="44" y2="170" {...leg} strokeWidth={7} />
          <line x1="148" y1="94" x2="156" y2="170" {...leg} strokeWidth={7} />
          <line x1="80" y1="94" x2="84" y2="160" {...leg} strokeWidth={6} opacity=".7" />
        </g>
      )
    case 'lamp':
      return (
        <g>
          <path d="M66 70 Q100 18 134 70 Z" fill={p.body} />
          <ellipse cx="100" cy="70" rx="34" ry="6" fill={p.body} style={{ filter: "brightness(.85)" }} />
          <circle cx="100" cy="80" r="7" fill="#fff4cf" />
          <line x1="100" y1="76" x2="100" y2="166" stroke={p.line} strokeWidth="4" />
          <ellipse cx="100" cy="170" rx="30" ry="7" fill={p.line} />
        </g>
      )
    case 'shelf':
      return (
        <g>
          <line x1="44" y1="30" x2="44" y2="174" {...leg} strokeWidth={6} />
          <line x1="156" y1="30" x2="156" y2="174" {...leg} strokeWidth={6} />
          {[48, 88, 128, 168].map((y) => (
            <rect key={y} x="38" y={y} width="124" height="7" rx="2" fill={p.wood} />
          ))}
          <rect x="54" y="62" width="14" height="26" fill={p.body} />
          <rect x="70" y="58" width="10" height="30" fill={p.line} opacity=".8" />
          <circle cx="128" cy="114" r="14" fill={p.body} />
          <rect x="100" y="140" width="40" height="28" rx="4" fill={p.body} style={{ filter: "brightness(.9)" }} />
          <path d="M120 48 q8 -18 16 0" fill={p.body} />
        </g>
      )
    case 'vase':
      return (
        <g>
          <path d="M84 70 Q60 110 76 160 L124 160 Q140 110 116 70 Z" fill={p.body} />
          <rect x="84" y="56" width="32" height="16" rx="6" fill={p.body} style={{ filter: "brightness(.9)" }} />
          <path d="M100 56 Q90 24 70 18 M100 56 Q112 22 136 22 M100 56 Q100 30 104 12" stroke={p.wood} strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="70" cy="18" rx="8" ry="4" fill={p.wood} />
          <ellipse cx="136" cy="22" rx="8" ry="4" fill={p.wood} />
        </g>
      )
    case 'bed':
      return (
        <g>
          <rect x="22" y="58" width="22" height="104" rx="6" fill={p.wood} />
          <rect x="40" y="104" width="142" height="30" rx="8" fill={p.body} />
          <rect x="46" y="88" width="44" height="20" rx="8" fill="#fff" opacity=".85" />
          <rect x="94" y="96" width="88" height="14" rx="6" fill={p.body} style={{ filter: "brightness(1.12)" }} />
          <rect x="40" y="134" width="142" height="10" fill={p.wood} />
          <line x1="178" y1="144" x2="178" y2="164" {...leg} />
        </g>
      )
    case 'stool':
      return (
        <g>
          <ellipse cx="100" cy="80" rx="44" ry="16" fill={p.body} />
          <rect x="56" y="80" width="88" height="24" rx="10" fill={p.body} style={{ filter: "brightness(.92)" }} />
          <line x1="72" y1="104" x2="62" y2="170" {...leg} />
          <line x1="128" y1="104" x2="138" y2="170" {...leg} />
          <line x1="100" y1="104" x2="100" y2="166" {...leg} opacity=".7" />
        </g>
      )
    case 'sideboard':
      return (
        <g>
          <rect x="24" y="66" width="152" height="84" rx="6" fill={p.body} />
          <line x1="74" y1="70" x2="74" y2="146" stroke={p.line} strokeWidth="2" opacity=".35" />
          <line x1="126" y1="70" x2="126" y2="146" stroke={p.line} strokeWidth="2" opacity=".35" />
          {[49, 100, 151].map((x) => (
            <circle key={x} cx={x} cy="108" r="3.5" fill={p.wood} />
          ))}
          <line x1="36" y1="150" x2="32" y2="172" {...leg} />
          <line x1="164" y1="150" x2="168" y2="172" {...leg} />
          <circle cx="60" cy="52" r="12" fill={p.wood} />
          <rect x="120" y="36" width="10" height="30" fill={p.line} opacity=".7" />
        </g>
      )
    case 'wardrobe':
      return (
        <g>
          <rect x="40" y="22" width="120" height="146" rx="4" fill={p.body} />
          <line x1="100" y1="26" x2="100" y2="164" stroke={p.line} strokeWidth="2" opacity=".35" />
          <line x1="92" y1="84" x2="92" y2="110" stroke={p.wood} strokeWidth="4" strokeLinecap="round" />
          <line x1="108" y1="84" x2="108" y2="110" stroke={p.wood} strokeWidth="4" strokeLinecap="round" />
          <rect x="40" y="168" width="120" height="8" fill={p.wood} />
        </g>
      )
    case 'mirror':
      return (
        <g>
          <path d="M60 170 L60 70 Q60 24 100 24 Q140 24 140 70 L140 170 Z" fill={p.wood} />
          <path d="M68 166 L68 72 Q68 32 100 32 Q132 32 132 72 L132 166 Z" fill={p.body} opacity=".55" />
          <path d="M80 60 L96 44 M84 80 L112 52" stroke="#fff" strokeWidth="3" opacity=".6" strokeLinecap="round" />
        </g>
      )
  }
}

export function FurnitureObject({ kind, body, wood, line, className, title }: Paint & { kind: ObjKind; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 200 190" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <ellipse cx="100" cy="178" rx="70" ry="6" fill={line} opacity=".12" />
      <Shape kind={kind} p={{ body, wood, line }} />
    </svg>
  )
}
