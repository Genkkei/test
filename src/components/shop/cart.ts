'use client'

import { useSyncExternalStore } from 'react'

/*
 * Корзина сайта: { ключ товара → количество } в localStorage под своим ключом на каждый сайт.
 * Ключ товара — «<id секции>:<номер товара>»: по нему сервер сам находит название и цену,
 * клиенту в заказе доверяем только ключ и количество.
 */

export type Line = { key: string; qty: number }
type State = { slug: string; lines: Line[] }

let state: State = { slug: '', lines: [] }
const listeners = new Set<() => void>()
const storeKey = (slug: string) => `atlas-cart:${slug}`

function emit() {
  try {
    localStorage.setItem(storeKey(state.slug), JSON.stringify(state.lines))
  } catch {}
  for (const l of listeners) l()
}

export function initCart(slug: string) {
  if (state.slug === slug) return
  let lines: Line[] = []
  try {
    lines = JSON.parse(localStorage.getItem(storeKey(slug)) || '[]')
  } catch {}
  state = { slug, lines: Array.isArray(lines) ? lines.filter((l) => l && typeof l.key === 'string' && l.qty > 0) : [] }
  for (const l of listeners) l()
}

export function addToCart(key: string, qty = 1) {
  const has = state.lines.find((l) => l.key === key)
  state = { ...state, lines: has ? state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l)) : [...state.lines, { key, qty }] }
  emit()
  window.dispatchEvent(new CustomEvent('atlas-cart:added', { detail: key }))
}

export function setQty(key: string, qty: number) {
  state = { ...state, lines: qty <= 0 ? state.lines.filter((l) => l.key !== key) : state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)) }
  emit()
}

export function clearCart() {
  state = { ...state, lines: [] }
  emit()
}

const EMPTY: Line[] = []
export function useCart(): Line[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state.lines,
    () => EMPTY,
  )
}

export { money } from './money'
