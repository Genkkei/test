'use client'

import { useEffect, useRef, useState } from 'react'
import { pick } from '@/lib/i18n'
import type { Leads } from '@/lib/schema'

/*
 * Форма заявки: открывается любой ссылкой на #order (кнопка в шапке, на первом экране — их
 * владелец выбирает в админке). Цвета и шрифты — переменные темы сайта, поэтому окно
 * выглядит своим в любом шаблоне. Заявка уходит в /api/lead → Telegram владельца.
 */
export function LeadDialog({ slug, lang, leads, phone }: { slug: string; lang: string; leads: Leads; phone: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [err, setErr] = useState('')
  const t = (ru: string, uz: string, en: string) => pick(lang, { ru, uz, en })
  const booking = leads.kind === 'booking'

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#order"]')
      if (!a) return
      e.preventDefault()
      setState('idle')
      ref.current?.showModal()
    }
    document.addEventListener('click', onClick)
    if (location.hash === '#order') ref.current?.showModal()
    return () => document.removeEventListener('click', onClick)
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setState('sending')
    try {
      const res = await fetch('/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, slug, lang, page: location.href }) })
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (out.ok) return setState('done')
      setErr(
        out.error === 'rate'
          ? t('Слишком много заявок подряд. Попробуйте через 10 минут или позвоните нам.', 'Juda ko‘p ariza. 10 daqiqadan keyin urinib ko‘ring yoki qo‘ng‘iroq qiling.', 'Too many requests. Try again in 10 minutes or call us.')
          : out.error === 'fields'
            ? t('Укажите имя и телефон.', 'Ism va telefonni kiriting.', 'Please enter your name and phone.')
            : t('Не получилось отправить. Позвоните нам, пожалуйста.', 'Yuborib bo‘lmadi. Iltimos, qo‘ng‘iroq qiling.', 'Could not send. Please call us.'),
      )
      setState('error')
    } catch {
      setErr(t('Нет связи. Проверьте интернет и попробуйте ещё раз.', 'Aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring.', 'No connection. Check the internet and try again.'))
      setState('error')
    }
  }

  const title = leads.title || (booking ? t('Записаться', 'Yozilish', 'Book a visit') : t('Оформить заказ', 'Buyurtma berish', 'Place an order'))
  const today = new Date().toISOString().slice(0, 10)
  return (
    <dialog ref={ref} className="lead" onClick={(e) => e.target === ref.current && ref.current?.close()} aria-label={title}>
      <button className="lead__x" onClick={() => ref.current?.close()} aria-label={t('Закрыть', 'Yopish', 'Close')}>
        ×
      </button>
      {state === 'done' ? (
        <div className="lead__done">
          <p className="lead__title">{t('Заявка отправлена', 'Ariza yuborildi', 'Request sent')}</p>
          <p>{leads.thanks || t('Спасибо! Мы свяжемся с вами в ближайшее время.', 'Rahmat! Tez orada siz bilan bog‘lanamiz.', 'Thank you! We will get back to you shortly.')}</p>
          <button className="lead__btn" onClick={() => ref.current?.close()}>
            {t('Хорошо', 'Yaxshi', 'OK')}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="lead__form">
          <p className="lead__title">{title}</p>
          <label>
            <span>{t('Ваше имя', 'Ismingiz', 'Your name')}</span>
            <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
          <label>
            <span>{t('Телефон', 'Telefon', 'Phone')}</span>
            <input name="phone" type="tel" required inputMode="tel" defaultValue="+998 " maxLength={30} autoComplete="tel" />
          </label>
          {booking ? (
            <div className="lead__row">
              <label>
                <span>{t('Дата', 'Sana', 'Date')}</span>
                <input name="date" type="date" min={today} />
              </label>
              <label>
                <span>{t('Время', 'Vaqt', 'Time')}</span>
                <input name="time" type="time" step={900} />
              </label>
            </div>
          ) : (
            <label>
              <span>{t('Что заказать', 'Nima buyurtma qilasiz', 'What would you like')}</span>
              <textarea name="items" rows={3} maxLength={600} />
            </label>
          )}
          <label>
            <span>{booking ? t('Комментарий', 'Izoh', 'Comment') : t('Адрес и пожелания', 'Manzil va istaklar', 'Address and notes')}</span>
            <textarea name="comment" rows={2} maxLength={600} />
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" className="lead__trap" aria-hidden="true" />
          {state === 'error' ? <p className="lead__err">{err}</p> : null}
          <button className="lead__btn" disabled={state === 'sending'}>
            {state === 'sending' ? t('Отправляю…', 'Yuborilmoqda…', 'Sending…') : t('Отправить', 'Yuborish', 'Send')}
          </button>
          {phone ? (
            <p className="lead__alt">
              {t('Или позвоните', 'Yoki qo‘ng‘iroq qiling', 'Or call')}: <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
            </p>
          ) : null}
        </form>
      )}
    </dialog>
  )
}
