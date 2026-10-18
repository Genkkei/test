'use client'

import { useEffect, useState } from 'react'

/*
 * Табло раунда: три минуты боя, минута отдыха, гонг. Считает по реальному времени, чтобы на
 * неактивной вкладке не отставать; до гидратации показывает «3:00» — то же, что в HTML.
 */
export function RoundTimer({ labels }: { labels: { round: string; fight: string; rest: string } }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion')) return
    const start = performance.now()
    const id = setInterval(() => setT(Math.floor((performance.now() - start) / 1000)), 250)
    return () => clearInterval(id)
  }, [])
  const cycle = 240
  const round = Math.floor(t / cycle) % 12 + 1
  const inCycle = t % cycle
  const fighting = inCycle < 180
  const left = fighting ? 180 - inCycle : cycle - inCycle
  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')
  const bell = inCycle === 0 || inCycle === 180
  return (
    <div className={`bout-timer${fighting ? '' : ' is-rest'}${bell && t > 0 ? ' is-bell' : ''}`} aria-hidden="true">
      <span className="bout-timer__round">
        {labels.round} {String(round).padStart(2, '0')}
      </span>
      <span className="bout-timer__clock">
        {mm}:{ss}
      </span>
      <span className="bout-timer__state">{fighting ? labels.fight : labels.rest}</span>
      <i className="bout-timer__bar" style={{ ['--bout-k' as string]: (fighting ? inCycle / 180 : (inCycle - 180) / 60).toFixed(3) }} />
    </div>
  )
}
