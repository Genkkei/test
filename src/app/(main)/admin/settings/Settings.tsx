'use client'

import { useState } from 'react'
import type { IntegrationsView } from '@/lib/settings'
import { saveIntegrationsAction, setPasswordLoginAction } from './actions'

function Copy({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  return (
    <span className="adm-create">
      <code className="mono">{value}</code>
      <button type="button" className="adm-btn" onClick={() => navigator.clipboard.writeText(value).then(() => setDone(true))}>
        {done ? 'Скопировано' : 'Копировать'}
      </button>
    </span>
  )
}

export function Settings({ initial, base, googleRedirect, githubRedirect }: { initial: IntegrationsView; base: string; googleRedirect: string; githubRedirect: string }) {
  const [v, setV] = useState(initial)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [g, setG] = useState({ id: initial.googleClientId, secret: '', emails: initial.adminEmails.join(', ') })
  const [gh, setGh] = useState({ id: initial.githubClientId, secret: '' })

  async function save(input: Parameters<typeof saveIntegrationsAction>[0]) {
    setBusy(true)
    const r = await saveIntegrationsAction(input)
    setBusy(false)
    setMsg({ ok: r.ok, text: r.message })
    if (r.view) setV(r.view)
  }
  const googleReady = !!(v.googleClientId && v.googleSecretSet && v.adminEmails.length)
  const ghNewApp = `https://github.com/settings/applications/new`

  return (
    <>
      {msg ? <p className={msg.ok ? 'adm-note' : 'adm-note adm-note--warn'}>{msg.text}</p> : null}

      <section className="adm-panel">
        <h2>1. Вход в админку через Google {googleReady ? '✓' : ''}</h2>
        <ol className="adm-steps">
          <li>
            Откройте{' '}
            <a href="https://console.cloud.google.com/auth/clients/create" target="_blank" rel="noopener noreferrer">
              Google Cloud → Создать клиент OAuth ↗
            </a>{' '}
            (войдите своим Google; если попросит — создайте проект с любым именем и на экране «Branding» впишите название «Atlas» и свою почту).
          </li>
          <li>
            Тип приложения — <b>Web application</b>. В «Authorized redirect URIs» добавьте:
            <Copy value={googleRedirect} />
          </li>
          <li>Нажмите «Create», скопируйте Client ID и Client secret сюда:</li>
        </ol>
        <div className="adm-fields">
          <label className="adm-field">
            <span>Client ID</span>
            <input value={g.id} onChange={(e) => setG({ ...g, id: e.target.value })} placeholder="1234-abcd.apps.googleusercontent.com" disabled={v.fromEnv.google} />
          </label>
          <label className="adm-field">
            <span>Client secret {v.googleSecretSet ? '(задан — оставьте пустым, чтобы не менять)' : ''}</span>
            <input value={g.secret} onChange={(e) => setG({ ...g, secret: e.target.value })} placeholder="GOCSPX-…" autoComplete="off" disabled={v.fromEnv.google} />
          </label>
          <label className="adm-field">
            <span>Кто может входить (почты Google через запятую)</span>
            <input value={g.emails} onChange={(e) => setG({ ...g, emails: e.target.value })} placeholder="you@gmail.com" disabled={v.fromEnv.emails} />
          </label>
          <button className="adm-btn adm-btn--primary" disabled={busy} onClick={() => save({ googleClientId: g.id, googleClientSecret: g.secret, adminEmails: g.emails })}>
            Сохранить
          </button>
        </div>
        {googleReady ? (
          <p className="adm-muted">
            Проверьте: выйдите из админки и нажмите «Войти через Google». Если в Google проект в режиме «Testing», добавьте свою почту в «Audience → Test users».
          </p>
        ) : null}
      </section>

      <section className="adm-panel">
        <h2>2. Вход заказчиков через GitHub (для переноса) {v.githubClientId && v.githubSecretSet ? '✓' : ''}</h2>
        <ol className="adm-steps">
          <li>
            Откройте{' '}
            <a href={ghNewApp} target="_blank" rel="noopener noreferrer">
              GitHub → New OAuth App ↗
            </a>
            .
          </li>
          <li>
            Application name — <b>Atlas</b>; Homepage URL: <Copy value={base} />
          </li>
          <li>
            Authorization callback URL: <Copy value={githubRedirect} />
          </li>
          <li>«Register application» → «Generate a new client secret» → скопируйте Client ID и секрет сюда:</li>
        </ol>
        <div className="adm-fields">
          <label className="adm-field">
            <span>Client ID</span>
            <input value={gh.id} onChange={(e) => setGh({ ...gh, id: e.target.value })} placeholder="Ov23li…" disabled={v.fromEnv.github} />
          </label>
          <label className="adm-field">
            <span>Client secret {v.githubSecretSet ? '(задан — оставьте пустым, чтобы не менять)' : ''}</span>
            <input value={gh.secret} onChange={(e) => setGh({ ...gh, secret: e.target.value })} autoComplete="off" disabled={v.fromEnv.github} />
          </label>
          <button className="adm-btn adm-btn--primary" disabled={busy} onClick={() => save({ githubClientId: gh.id, githubClientSecret: gh.secret })}>
            Сохранить
          </button>
        </div>
      </section>

      <section className="adm-panel">
        <h2>3. Вход общим паролем</h2>
        <p className="adm-muted">
          Сейчас: <b>{v.passwordLogin ? 'включён' : 'выключен — только Google'}</b>. Когда вход через Google проверен, пароль лучше выключить: тогда войти в конструктор можно только с вашего Google (с его двухфакторной защитой). Пароли сайтов клиентов работают как раньше.
        </p>
        <p className="adm-muted">Если доступ к Google потерян: у воркера atlas задайте переменную FORCE_PASSWORD_LOGIN=1 — пароль снова заработает.</p>
        <div>
          <button
            className="adm-btn"
            disabled={busy || (v.passwordLogin && !googleReady)}
            onClick={async () => {
              setBusy(true)
              const r = await setPasswordLoginAction(!v.passwordLogin)
              setBusy(false)
              setMsg({ ok: r.ok, text: r.message })
              if (r.view) setV(r.view)
            }}
          >
            {v.passwordLogin ? 'Выключить вход паролем' : 'Включить вход паролем'}
          </button>
        </div>
      </section>
    </>
  )
}
