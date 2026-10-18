'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { pick } from '@/lib/i18n'
import { clearCart, initCart, money, setQty, useCart } from './cart'

export type Product = { key: string; name: string; price: number; unit: string; image: string }

/*
 * Кнопка корзины (появляется, когда в ней что-то есть) и выезжающая панель: товары, количество,
 * итог и оформление. Цвета и шрифты — переменные темы, поэтому корзина своя в любом шаблоне.
 * Заказ уходит в /api/order: сервер сам пересчитывает цены по данным сайта.
 */
export function CartDrawer({ slug, lang, products, demo, phone }: { slug: string; lang: string; products: Product[]; demo: boolean; phone: string }) {
  const lines = useCart()
  const ref = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<'cart' | 'form' | 'sending' | 'done' | 'error'>('cart')
  const [err, setErr] = useState('')
  const [delivery, setDelivery] = useState<'pickup' | 'delivery'>('delivery')
  const [bump, setBump] = useState(false)
  const t = (ru: string, uz: string, en: string) => pick(lang, { ru, uz, en })
  const byKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products])
  const rows = lines.map((l) => ({ ...l, p: byKey.get(l.key) })).filter((r) => r.p) as { key: string; qty: number; p: Product }[]
  const count = rows.reduce((a, r) => a + r.qty, 0)
  const total = rows.reduce((a, r) => a + r.qty * r.p.price, 0)

  useEffect(() => initCart(slug), [slug])
  useEffect(() => {
    const on = () => {
      setBump(true)
      setTimeout(() => setBump(false), 500)
    }
    window.addEventListener('atlas-cart:added', on)
    return () => window.removeEventListener('atlas-cart:added', on)
  }, [])

  const open = () => {
    setStep('cart')
    ref.current?.showModal()
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setStep('sending')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, delivery, slug, lang, page: location.href, lines: rows.map((r) => ({ key: r.key, qty: r.qty })) }),
      })
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (out.ok) {
        clearCart()
        return setStep('done')
      }
      setErr(
        out.error === 'rate'
          ? t('Слишком много заказов подряд. Позвоните нам, пожалуйста.', 'Juda ko‘p buyurtma. Iltimos, qo‘ng‘iroq qiling.', 'Too many orders in a row. Please call us.')
          : out.error === 'fields'
            ? t('Укажите имя и телефон.', 'Ism va telefonni kiriting.', 'Please enter your name and phone.')
            : t('Не получилось отправить заказ. Позвоните нам, пожалуйста.', 'Buyurtmani yuborib bo‘lmadi. Iltimos, qo‘ng‘iroq qiling.', 'Could not send the order. Please call us.'),
      )
      setStep('error')
    } catch {
      setErr(t('Нет связи. Проверьте интернет.', 'Aloqa yo‘q. Internetni tekshiring.', 'No connection. Check the internet.'))
      setStep('error')
    }
  }

  return (
    <>
      {count > 0 ? (
        <button type="button" className={`cart-fab${bump ? ' is-bump' : ''}`} onClick={open} aria-label={t('Корзина', 'Savat', 'Cart')}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.4" fill="currentColor" />
            <circle cx="17" cy="20" r="1.4" fill="currentColor" />
          </svg>
          <span>{count}</span>
          <b>{money(total, lang)}</b>
        </button>
      ) : null}
      <dialog ref={ref} className="cart" onClick={(e) => e.target === ref.current && ref.current?.close()} aria-label={t('Корзина', 'Savat', 'Cart')}>
        <div className="cart__head">
          <p className="cart__title">{step === 'form' || step === 'error' || step === 'sending' ? t('Оформление', 'Rasmiylashtirish', 'Checkout') : t('Корзина', 'Savat', 'Cart')}</p>
          <button className="cart__x" onClick={() => ref.current?.close()} aria-label={t('Закрыть', 'Yopish', 'Close')}>
            ×
          </button>
        </div>

        {step === 'done' ? (
          <div className="cart__done">
            <p className="cart__big">{demo ? t('Это демо-сайт', 'Bu demo-sayt', 'This is a demo site') : t('Заказ принят', 'Buyurtma qabul qilindi', 'Order received')}</p>
            <p>
              {demo
                ? t('Так выглядит оформление заказа. На сайте владельца заказ сразу приходит ему в Telegram.', 'Buyurtma shunday rasmiylashtiriladi. Egasining saytida buyurtma darhol uning Telegramiga keladi.', 'This is how checkout works. On the owner’s site the order goes straight to their Telegram.')
                : t('Спасибо! Мы перезвоним, чтобы подтвердить заказ.', 'Rahmat! Buyurtmani tasdiqlash uchun qo‘ng‘iroq qilamiz.', 'Thank you! We will call you to confirm the order.')}
            </p>
            <button className="cart__btn" onClick={() => ref.current?.close()}>
              {t('Хорошо', 'Yaxshi', 'OK')}
            </button>
          </div>
        ) : step === 'cart' ? (
          rows.length ? (
            <>
              <ul className="cart__lines">
                {rows.map((r) => (
                  <li key={r.key}>
                    {r.p.image ? <img src={r.p.image} alt="" /> : <span className="cart__ph" aria-hidden="true" />}
                    <div>
                      <p className="cart__name">{r.p.name}</p>
                      <p className="cart__price">
                        {money(r.p.price, lang)}
                        {r.p.unit ? ` / ${r.p.unit}` : ''}
                      </p>
                    </div>
                    <div className="cart__qty">
                      <button onClick={() => setQty(r.key, r.qty - 1)} aria-label="−">
                        −
                      </button>
                      <span>{r.qty}</span>
                      <button onClick={() => setQty(r.key, r.qty + 1)} aria-label="+">
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="cart__sum">
                <span>{t('Итого', 'Jami', 'Total')}</span>
                <b>{money(total, lang)}</b>
              </div>
              <button className="cart__btn" onClick={() => setStep('form')}>
                {t('Оформить заказ', 'Buyurtma berish', 'Checkout')}
              </button>
            </>
          ) : (
            <p className="cart__empty">{t('Корзина пуста', 'Savat bo‘sh', 'Your cart is empty')}</p>
          )
        ) : (
          <form className="cart__form" onSubmit={submit}>
            <label>
              <span>{t('Ваше имя', 'Ismingiz', 'Your name')}</span>
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
            </label>
            <label>
              <span>{t('Телефон', 'Telefon', 'Phone')}</span>
              <input name="phone" type="tel" required inputMode="tel" defaultValue="+998 " maxLength={30} autoComplete="tel" />
            </label>
            <div className="cart__seg" role="radiogroup">
              <button type="button" className={delivery === 'delivery' ? 'is-on' : ''} onClick={() => setDelivery('delivery')}>
                {t('Доставка', 'Yetkazib berish', 'Delivery')}
              </button>
              <button type="button" className={delivery === 'pickup' ? 'is-on' : ''} onClick={() => setDelivery('pickup')}>
                {t('Самовывоз', 'Olib ketish', 'Pickup')}
              </button>
            </div>
            {delivery === 'delivery' ? (
              <label>
                <span>{t('Адрес', 'Manzil', 'Address')}</span>
                <input name="address" maxLength={200} autoComplete="street-address" required />
              </label>
            ) : null}
            <label>
              <span>{t('Комментарий', 'Izoh', 'Comment')}</span>
              <textarea name="comment" rows={2} maxLength={500} />
            </label>
            <input name="website" tabIndex={-1} autoComplete="off" className="lead__trap" aria-hidden="true" />
            <div className="cart__sum">
              <span>
                {t('Итого', 'Jami', 'Total')} · {count} {t('шт.', 'dona', 'items')}
              </span>
              <b>{money(total, lang)}</b>
            </div>
            {step === 'error' ? (
              <p className="lead__err">
                {err}
                {phone ? (
                  <>
                    {' '}
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
                  </>
                ) : null}
              </p>
            ) : null}
            <button className="cart__btn" disabled={step === 'sending'}>
              {step === 'sending' ? t('Отправляю…', 'Yuborilmoqda…', 'Sending…') : t('Подтвердить заказ', 'Buyurtmani tasdiqlash', 'Place order')}
            </button>
            <button type="button" className="cart__back" onClick={() => setStep('cart')}>
              ← {t('Назад в корзину', 'Savatga qaytish', 'Back to cart')}
            </button>
          </form>
        )}
      </dialog>
    </>
  )
}
