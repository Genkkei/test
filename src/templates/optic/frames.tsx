/* Формы оправ: одна линза рисуется вокруг центра (0,0), правая — зеркалом левой. */

export const SHAPES = ['round', 'square', 'cat', 'aviator'] as const
export type Shape = (typeof SHAPES)[number]

export function lensPath(shape: Shape): string {
  switch (shape) {
    case 'round':
      return 'M -52 0 A 52 52 0 1 0 52 0 A 52 52 0 1 0 -52 0 Z'
    case 'square':
      return 'M -60 -40 Q -60 -48 -52 -48 L 52 -48 Q 60 -48 60 -40 L 58 34 Q 57 46 45 46 L -45 46 Q -57 46 -58 34 Z'
    case 'cat':
      return 'M -62 -30 Q -40 -52 10 -46 Q 52 -44 64 -52 Q 62 6 40 32 Q 18 50 -16 44 Q -56 38 -62 -30 Z'
    case 'aviator':
      return 'M -58 -38 Q -6 -50 56 -40 Q 62 -10 46 22 Q 24 56 -12 50 Q -50 42 -58 -38 Z'
  }
}

/** Оправа целиком (две линзы, перемычка, заушники) в координатах 0..400 × 0..160. */
export function Frame({ shape, className = '', lens = true }: { shape: Shape; className?: string; lens?: boolean }) {
  const d = lensPath(shape)
  return (
    <g className={className}>
      <path d="M 18 62 L -6 54" className="frame-temple" />
      <path d="M 382 62 L 406 54" className="frame-temple" />
      <g transform="translate(110 80)">
        {lens ? <path d={d} className="frame-lens" /> : null}
        <path d={d} className="frame-rim" />
      </g>
      <g transform="translate(290 80) scale(-1 1)">
        {lens ? <path d={d} className="frame-lens" /> : null}
        <path d={d} className="frame-rim" />
      </g>
      <path d="M 166 70 Q 200 52 234 70" className="frame-bridge" />
    </g>
  )
}
