import type { CSSProperties } from 'react'
import type { Logo as LogoData, Shape } from '@/lib/brand'
import { wordText } from '@/lib/brand'
import { fontStack } from '@/lib/fonts'
import type { Site } from '@/lib/schema'

/*
 * Логотип сайта из brand.logo. Цвет «fg» — currentColor: знак и надпись берут цвет того места, где стоят
 * (светлая шапка поверх фото, тёмный подвал), «accent» и прочие роли — переменные темы сайта.
 * Размер — от font-size родителя: в шапке шаблона логотип того же роста, что была надпись.
 */

const CSS_ROLE: Record<string, string> = {
  fg: 'currentColor',
  bg: 'var(--bg)',
  accent: 'var(--accent)',
  muted: 'var(--muted)',
  surface: 'var(--surface)',
  line: 'var(--line)',
  none: 'none',
}

export function Mark({ shapes, className, title, colors }: { shapes: Shape[]; className?: string; title?: string; colors?: Partial<Record<string, string>> }) {
  const c = (r: string) => colors?.[r] ?? CSS_ROLE[r]
  return (
    <svg className={className} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {shapes.map((s, i) => {
        const p = { fill: c(s.fill), stroke: c(s.stroke), strokeWidth: s.sw, opacity: s.op }
        if (s.t === 'path') return <path key={i} d={s.d} {...p} strokeLinecap={s.cap} strokeLinejoin="round" />
        if (s.t === 'circle') return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...p} />
        if (s.t === 'ellipse') return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...p} />
        return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} transform={s.rot ? `rotate(${s.rot} ${s.x + s.w / 2} ${s.y + s.h / 2})` : undefined} {...p} />
      })}
    </svg>
  )
}

export function wordStyle(logo: LogoData, site: Site): CSSProperties {
  return {
    fontFamily: fontStack(logo.word.font || site.theme.display),
    fontWeight: logo.word.weight,
    letterSpacing: `${logo.word.tracking}em`,
    fontStyle: logo.word.italic ? 'italic' : undefined,
    textTransform: 'none',
  }
}

/** variant: header — в строку и без подписи; footer и book — по раскладке бренда, с подписью. */
export function Logo({ site, variant = 'header', className = '', colors }: { site: Site; variant?: 'header' | 'footer' | 'book'; className?: string; colors?: Partial<Record<string, string>> }) {
  const logo = site.brand?.logo
  if (!logo) return null
  const layout = variant === 'header' && logo.layout === 'stack' ? 'row' : logo.layout
  const showMark = layout !== 'word' && logo.shapes.length > 0
  const showWord = layout !== 'mark'
  const word = wordText(logo.word, site.name)
  const el = (
    <span className={`brand-logo brand-logo--${layout} brand-logo--${variant} ${className}`}>
      {showMark ? <Mark shapes={logo.shapes} className="brand-logo__mark" colors={colors} /> : null}
      {showWord ? (
        <span className="brand-logo__text">
          <span className="brand-logo__word" style={wordStyle(logo, site)}>
            {word}
          </span>
          {variant !== 'header' && logo.word.sub ? <span className="brand-logo__sub">{logo.word.sub}</span> : null}
        </span>
      ) : null}
      {layout === 'mark' ? <span className="sr-only">{site.name}</span> : null}
    </span>
  )
  // в подвале шаблоны дают названию огромный кегль — логотип ужимается под ширину своего места:
  // --n — длина надписи, по ней CSS считает предельный размер (globals.css, .brand-fit)
  if (variant !== 'footer') return el
  return (
    <span className="brand-fit" style={{ ['--n' as string]: showWord ? word.length : 0, ['--m' as string]: showMark ? 2 : 0 }}>
      {el}
    </span>
  )
}
