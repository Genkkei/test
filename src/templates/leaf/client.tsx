'use client'

import { useEffect, useState } from 'react'

/** Название чая сменяется мягко, как пар: первое слово есть в HTML. */
export function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2800)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="leaf-rot" aria-live="off">
      <span key={i} className="leaf-rot__word">
        {words[i]}
      </span>
    </span>
  )
}
