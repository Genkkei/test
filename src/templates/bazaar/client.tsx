'use client'

import { useEffect, useState } from 'react'

/** Блюдо дня сменяется, как надпись мелом: первое слово есть в HTML. */
export function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2400)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="bazaar-rot" aria-live="off">
      <span key={i} className="bazaar-rot__word">
        {words[i]}
      </span>
    </span>
  )
}
