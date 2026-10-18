'use client'

import { useActionState, useState } from 'react'
import { handOverAction, type HandOver } from '../actions'

const MAP: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }
const toSlug = (s: string) => s.toLowerCase().replace(/./g, (c) => MAP[c] ?? c).replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)

export function HandOverForm({ sites, from }: { sites: { slug: string; name: string; niche: string }[]; from?: string }) {
  const [state, action, pending] = useActionState<HandOver, FormData>(handOverAction, { ok: false })
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [copied, setCopied] = useState(false)

  if (state.ok && state.url) {
    const msg = `Ваш сайт готов!\n\nСайт: ${state.url}\nАдминка: ${state.admin}\nПароль: ${state.password}\n\nВ админке: тексты, фото, цены, контакты, 3 языка и заявки в Telegram (вкладка «С чего начать» — пошагово). Пароль можно сменить во вкладке «Пароль».`
    return (
      <section className="adm-panel">
        <h2>Готово ✓</h2>
        <ol className="adm-steps">
          <li className="is-done">
            Сайт: <a href={state.url} target="_blank">{state.url}</a> (первые полминуты может открываться старая страница — это нормально)
          </li>
          <li className="is-done">
            Админка: <a href={state.admin} target="_blank">{state.admin}</a>
          </li>
          <li className="is-now">
            Пароль владельца: <b className="mono">{state.password}</b> — показывается один раз.
          </li>
          <li>
            Отправьте клиенту это сообщение:
            <pre className="adm-pre">{msg}</pre>
            <button
              className="adm-btn adm-btn--primary"
              onClick={() => navigator.clipboard.writeText(msg).then(() => setCopied(true))}
            >
              {copied ? 'Скопировано' : 'Скопировать сообщение'}
            </button>
          </li>
          <li>
            Дальше, вместе с клиентом: тексты и фото → <a href={`/admin/sites/${state.slug}`}>редактор сайта</a>; свой домен — вкладка «Публикация и домен»; бот заявок — вкладка «Заявки в Telegram».
          </li>
        </ol>
      </section>
    )
  }

  return (
    <form action={action} className="adm-panel adm-fields">
      {state.message ? <p className={state.ok ? 'adm-note' : 'adm-note adm-note--warn'}>{state.message}</p> : null}
      <label className="adm-field">
        <span>1. Какой сайт купили</span>
        <select name="from" defaultValue={from || sites[0]?.slug}>
          {sites.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name} — {s.niche}
            </option>
          ))}
        </select>
      </label>
      <label className="adm-field">
        <span>2. Название бизнеса клиента</span>
        <input
          name="name"
          required
          value={name}
          placeholder="Например, Кофейня Bahor"
          onChange={(e) => {
            setName(e.target.value)
            setSlug(toSlug(e.target.value))
          }}
        />
      </label>
      <label className="adm-field">
        <span>3. Адрес сайта (латиницей)</span>
        <input name="slug" value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} className="mono" placeholder="bahor" />
        <small className="adm-muted">Сайт откроется на {slug || '…'}.genkai.workers.dev. Свой домен (.uz) подключается потом во вкладке «Публикация и домен».</small>
      </label>
      <button className="adm-btn adm-btn--primary" disabled={pending}>
        {pending ? 'Создаю и публикую… (до минуты)' : 'Выдать клиенту'}
      </button>
    </form>
  )
}
