'use client'

import { useState } from 'react'
import { pick } from '@/lib/i18n'
import { addToCart } from './cart'

export function AddToCart({ k, lang }: { k: string; lang: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={`shop-add${done ? ' is-done' : ''}`}
      onClick={() => {
        addToCart(k)
        setDone(true)
        setTimeout(() => setDone(false), 1200)
      }}
    >
      {done ? pick(lang, { ru: 'В корзине ✓', uz: 'Savatda ✓', en: 'Added ✓' }) : pick(lang, { ru: 'В корзину', uz: 'Savatga', en: 'Add to cart' })}
    </button>
  )
}

/** Фильтр по категориям: прячет карточки чужих категорий; без скрипта видны все. */
export function ShopFilter({ cats, lang, target }: { cats: string[]; lang: string; target: string }) {
  const [cur, setCur] = useState('')
  if (cats.length < 2) return null
  const choose = (c: string) => {
    setCur(c)
    document.querySelectorAll<HTMLElement>(`#${target} [data-cat]`).forEach((el) => {
      el.hidden = !!c && el.dataset.cat !== c
    })
  }
  return (
    <div className="shop-cats" role="tablist">
      {['', ...cats].map((c) => (
        <button key={c || 'all'} type="button" role="tab" aria-selected={cur === c} className={cur === c ? 'is-on' : ''} onClick={() => choose(c)}>
          {c || pick(lang, { ru: 'Все', uz: 'Barchasi', en: 'All' })}
        </button>
      ))}
    </div>
  )
}
