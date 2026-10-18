'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TransferView } from '@/lib/transfer'
import type { RunState } from '@/lib/github'
import { deleteTransferAction, disableHereAction, retryDeployAction, revealPasswordAction, runTransferAction, startTransferAction, transferStateAction } from './actions'

type Site = { slug: string; name: string; demo: boolean }

const STATUS: Record<TransferView['status'], string> = {
  waiting: 'Ждём заказчика',
  pushing: 'Отправляю код…',
  deploying: 'Выкладка у заказчика…',
  done: 'Готово',
  failed: 'Ошибка',
}

export function TransferBoard({ sites, transfers, preselect }: { sites: Site[]; transfers: TransferView[]; preselect?: string }) {
  const [list, setList] = useState(transfers)
  const [slug, setSlug] = useState(preselect || sites.find((s) => !s.demo)?.slug || sites[0]?.slug || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const put = (v?: TransferView) => v && setList((l) => (l.some((x) => x.id === v.id) ? l.map((x) => (x.id === v.id ? v : x)) : [v, ...l]))

  async function start() {
    setBusy(true)
    setErr('')
    const r = await startTransferAction(slug)
    setBusy(false)
    if (!r.ok) return setErr(r.message || 'Ошибка')
    put(r.view)
  }

  const picked = sites.find((s) => s.slug === slug)
  return (
    <>
      <section className="adm-panel">
        <h2>Новый перенос</h2>
        <ol className="adm-steps">
          <li>Выберите сайт и нажмите «Создать ссылку».</li>
          <li>Отправьте ссылку заказчику. Он входит в свой GitHub и подключает свой Cloudflare — по кнопкам, 5 минут.</li>
          <li>Когда оба зелёные — нажмите «Перенести». Через 3–6 минут сайт работает у заказчика; пароль админки увидите и вы, и он.</li>
        </ol>
        <div className="adm-create">
          <label className="adm-field">
            <span>Сайт</span>
            <select value={slug} onChange={(e) => setSlug(e.target.value)}>
              {sites.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} — /{s.slug}
                  {s.demo ? ' (демо из каталога)' : ''}
                </option>
              ))}
            </select>
          </label>
          <button className="adm-btn adm-btn--primary" disabled={busy || !slug} onClick={start}>
            {busy ? 'Создаю…' : 'Создать ссылку для заказчика'}
          </button>
        </div>
        {picked?.demo ? (
          <p className="adm-note adm-note--warn">
            Это демо из каталога. Обычно сначала делают «Выдать клиенту» (копия под его название), а переносят уже копию. Демо можно перенести и так — у нас оно останется в каталоге.
          </p>
        ) : null}
        {err ? <p className="adm-note adm-note--warn">{err}</p> : null}
      </section>
      {list.map((t) => (
        <TransferCard key={t.id} initial={t} onGone={() => setList((l) => l.filter((x) => x.id !== t.id))} />
      ))}
    </>
  )
}

function TransferCard({ initial, onGone }: { initial: TransferView; onGone: () => void }) {
  const [t, setT] = useState(initial)
  const [run, setRun] = useState<RunState | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  const [confirm, setConfirm] = useState('')

  const refresh = useCallback(async () => {
    const r = await transferStateAction(t.id)
    if (r.view) setT(r.view)
    setRun(r.run ?? null)
    if (r.link) setLink(r.link)
    if (!r.ok && r.message) setMsg(r.message)
  }, [t.id])

  useEffect(() => {
    refresh()
  }, [refresh])
  // пока заказчик подключается или идёт выкладка — обновляем сами
  useEffect(() => {
    if (t.status === 'done') return
    const id = setInterval(refresh, t.status === 'deploying' ? 8000 : 5000)
    return () => clearInterval(id)
  }, [t.status, refresh])

  const act = async (fn: () => Promise<{ ok: boolean; message?: string; view?: TransferView }>) => {
    setBusy(true)
    setMsg('')
    const r = await fn()
    setBusy(false)
    if (r.view) setT(r.view)
    if (r.message) setMsg(r.message)
  }
  const copy = (text: string, what: string) => navigator.clipboard.writeText(text).then(() => setCopied(what))

  const ready = !!t.github && !!t.cloudflare
  const invite = link
    ? `Здравствуйте! Чтобы ваш сайт «${t.name}» переехал в ваши аккаунты, откройте ссылку и пройдите 2 шага (5 минут, нужны аккаунты GitHub и Cloudflare — их можно создать там же бесплатно):\n${link}\n\nСсылка действует 3 дня. Пароли от аккаунтов никому не передавайте — они не нужны.`
    : ''
  const done = `Ваш сайт «${t.name}» теперь в ваших аккаунтах.\n\nСайт: ${t.siteUrl ?? ''}\nАдминка: ${t.siteUrl ?? ''}/admin\nПароль: ${password ?? '(нажмите «Показать пароль»)'}\nКод: ${t.repoUrl ?? ''}\n\nКаждое изменение кода в GitHub выкладывается само. Тексты, фото и цены меняются в админке.`

  return (
    <section className="adm-panel">
      <div className="adm-head" style={{ marginBottom: 0 }}>
        <div>
          <h2>
            {t.name} <span className="adm-muted">/{t.slug}</span>
          </h2>
          <p className="adm-muted">
            {STATUS[t.status]}
            {t.message ? ` — ${t.message}` : ''}
          </p>
        </div>
      </div>
      <ol className="adm-steps">
        <li className={link || t.status !== 'waiting' ? 'is-done' : 'is-now'}>
          Ссылка для заказчика
          {link ? (
            <>
              <pre className="adm-pre">{invite}</pre>
              <button className="adm-btn" onClick={() => copy(invite, 'invite')}>
                {copied === 'invite' ? 'Скопировано' : 'Скопировать сообщение для заказчика'}
              </button>
            </>
          ) : null}
        </li>
        <li className={t.github ? 'is-done' : 'is-now'}>GitHub заказчика: {t.github ? <b>{t.github} ✓</b> : 'ещё не подключён'}</li>
        <li className={t.cloudflare ? 'is-done' : 'is-now'}>
          Cloudflare заказчика: {t.cloudflare ? <b>{t.cloudflare.account} ✓</b> : 'ещё не подключён'}
        </li>
        <li className={t.status === 'done' ? 'is-done' : ready ? 'is-now' : ''}>
          {t.status === 'waiting' || t.status === 'failed' ? (
            <button className="adm-btn adm-btn--primary" disabled={!ready || busy} onClick={() => act(() => runTransferAction(t.id))}>
              {busy ? 'Переношу…' : t.status === 'failed' && t.repoUrl ? 'Перенести ещё раз' : 'Перенести'}
            </button>
          ) : (
            <span>Перенос: {STATUS[t.status]}</span>
          )}
          {t.repoUrl ? (
            <p className="adm-muted">
              Код: <a href={t.repoUrl} target="_blank">{t.repoUrl}</a>
            </p>
          ) : null}
          {run?.url ? (
            <p className="adm-muted">
              Выкладка: {run.status === 'completed' ? (run.conclusion === 'success' ? 'успешно' : `ошибка (${run.conclusion})`) : `идёт${run.step ? ` — ${run.step}` : ''}`} ·{' '}
              <a href={run.url} target="_blank">
                журнал
              </a>
            </p>
          ) : null}
          {t.status === 'failed' && t.repoUrl ? (
            <button className="adm-btn" disabled={busy} onClick={() => act(() => retryDeployAction(t.id))}>
              Повторить выкладку
            </button>
          ) : null}
        </li>
        {t.status === 'done' || t.status === 'deploying' ? (
          <li className={t.status === 'done' ? 'is-now' : ''}>
            {t.siteUrl ? (
              <p>
                Сайт: <a href={t.siteUrl} target="_blank">{t.siteUrl}</a> · админка: <a href={`${t.siteUrl}/admin`} target="_blank">{t.siteUrl}/admin</a>
              </p>
            ) : null}
            {password ? (
              <p>
                Пароль админки: <b className="mono">{password}</b>
              </p>
            ) : (
              <button className="adm-btn" onClick={async () => setPassword((await revealPasswordAction(t.id)).password ?? null)}>
                Показать пароль
              </button>
            )}
            {t.status === 'done' ? (
              <>
                <pre className="adm-pre">{done}</pre>
                <button className="adm-btn" onClick={() => copy(done, 'done')}>
                  {copied === 'done' ? 'Скопировано' : 'Скопировать сообщение для заказчика'}
                </button>
              </>
            ) : null}
          </li>
        ) : null}
        {t.status === 'done' ? (
          <li>
            {t.disabledHere ? (
              <span>Адрес у нас отключён — сайт работает только у заказчика.</span>
            ) : (
              <>
                <p>
                  Необязательно: отключить адрес этого сайта у нас (воркер <b>{t.slug}</b> в вашем Cloudflare). Сделайте это, когда заказчик проверил сайт у себя. Отменить нельзя.
                </p>
                <div className="adm-create">
                  <label className="adm-field">
                    <span>Для подтверждения впишите {t.slug}</span>
                    <input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </label>
                  <button className="adm-btn" disabled={busy || confirm !== t.slug} onClick={() => act(() => disableHereAction(t.id, confirm))}>
                    Отключить у нас
                  </button>
                </div>
              </>
            )}
          </li>
        ) : null}
      </ol>
      {msg ? <p className={t.status === 'failed' ? 'adm-note adm-note--warn' : 'adm-note'}>{msg}</p> : null}
      <div>
        <button
          className="adm-btn"
          onClick={async () => {
            if (!window.confirm('Удалить этот перенос из списка? Сайт у заказчика не затрагивается.')) return
            await deleteTransferAction(t.id)
            onGone()
          }}
        >
          Убрать из списка
        </button>
      </div>
    </section>
  )
}
