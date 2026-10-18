'use client'

import { useEffect, useState } from 'react'

/**
 * Терминал первого экрана: команды набираются по букве, после каждой — короткий ответ.
 * Без скрипта (и при reduced motion) показана вся сессия сразу — текст в HTML не пропадает.
 */
export function Terminal({ lines, done }: { lines: string[]; done: string }) {
  const [shown, setShown] = useState<{ i: number; n: number } | null>(null)
  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let i = 0
    let n = 0
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      setShown({ i, n })
      if (n < lines[i].length) {
        n++
        t = setTimeout(tick, 45 + Math.random() * 60)
      } else if (i < lines.length - 1) {
        i++
        n = 0
        t = setTimeout(tick, 650)
      } else {
        t = setTimeout(() => {
          i = 0
          n = 0
          tick()
        }, 3200)
      }
    }
    t = setTimeout(tick, 600)
    return () => clearTimeout(t)
  }, [lines])
  const rows = shown ? lines.slice(0, shown.i + 1) : lines
  return (
    <div className="orbit-term__body">
      {rows.map((l, k) => {
        const typing = shown && k === shown.i
        const text = typing ? l.slice(0, shown!.n) : l
        const finished = !typing || shown!.n >= l.length
        return (
          <div key={k}>
            <p className="orbit-term__cmd">
              <span className="orbit-term__ps">~/kod $</span> {text}
              {typing ? <i className="orbit-caret" aria-hidden="true" /> : null}
            </p>
            {finished && (!typing || k < lines.length) ? <p className="orbit-term__out">✓ {done}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
