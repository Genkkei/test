'use client'

import { useEffect, useState } from 'react'

export function Rotator({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (words.length < 2 || document.documentElement.classList.contains('reduce-motion')) return
    const id = setInterval(() => setI((x) => (x + 1) % words.length), 2400)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="sugar-rot" aria-live="off">
      <span key={i} className="sugar-rot__word">
        {words[i]}
      </span>
    </span>
  )
}
