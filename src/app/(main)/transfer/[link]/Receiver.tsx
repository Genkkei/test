'use client'

import { useCallback, useEffect, useState } from 'react'
import type { TransferView } from '@/lib/transfer'
import type { CfAccount } from '@/lib/cloudflare'
import { connectCloudflareAction, connectGithubAction, receiverStateAction } from '../actions'

// Ключи с уже выставленными правами: заказчику остаётся нажать «Создать».
const GH_TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=repo,workflow&description=' + encodeURIComponent('Перенос сайта')
const CF_PERMS = [
  { key: 'workers_scripts', type: 'edit' },
  { key: 'd1', type: 'edit' },
  { key: 'workers_r2', type: 'edit' },
  { key: 'account_settings', type: 'read' },
  { key: 'workers_routes', type: 'edit' },
  { key: 'zone', type: 'edit' },
]
const CF_TOKEN_URL = `https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=${encodeURIComponent(JSON.stringify(CF_PERMS))}&name=${encodeURIComponent('Перенос сайта')}&accountId=*&zoneId=all`

export function Receiver({ link, initial, oauth, ghError }: { link: string; initial: TransferView; oauth: boolean; ghError?: string }) {
  const [t, setT] = useState(initial)
  const [password, setPassword] = useState<string | null>(null)
  const [ghToken, setGhToken] = useState('')
  const [cfToken, setCfToken] = useState('')
  const [accounts, setAccounts] = useState<CfAccount[] | null>(null)
  const [msg, setMsg] = useState<{ where: 'gh' | 'cf' | 'all'; text: string } | null>(ghError ? { where: 'gh', text: ghError } : null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    const r = await receiverStateAction(link)
    if (r.view) setT(r.view)
    if (r.password) setPassword(r.password)
    if (!r.ok && r.message) setMsg({ where: 'all', text: r.message })
  }, [link])
  useEffect(() => {
    if (t.status === 'done') {
      refresh()
      return
    }
    const id = setInterval(refresh, 6000)
    return () => clearInterval(id)
  }, [t.status, refresh])

  async function gh() {
    setBusy(true)
    const r = await connectGithubAction(link, ghToken)
    setBusy(false)
    if (r.view) setT(r.view)
    setMsg(r.ok ? null : { where: 'gh', text: r.message || 'Ошибка' })
    if (r.ok) setGhToken('')
  }
  async function cf(accountId?: string) {
    setBusy(true)
    const r = await connectCloudflareAction(link, cfToken, accountId)
    setBusy(false)
    if (r.view) setT(r.view)
    setAccounts(r.accounts ?? null)
    setMsg(r.ok ? null : { where: 'cf', text: r.message || 'Ошибка' })
    if (r.ok) setCfToken('')
  }

  const locked = t.status !== 'waiting' && t.status !== 'failed'
  return (
    <>
      {msg?.where === 'all' ? <p className="adm-note adm-note--warn">{msg.text}</p> : null}
      <ol className="adm-steps">
        <li className={t.github ? 'is-done' : 'is-now'}>
          <b>GitHub</b> — здесь будет храниться код вашего сайта.
          {t.github ? (
            <p>
              Подключён: <b>{t.github}</b> ✓
            </p>
          ) : (
            <>
              <p className="adm-muted">Нет аккаунта? Зарегистрируйтесь на github.com (бесплатно), затем вернитесь сюда.</p>
              {oauth ? (
                <p>
                  <a className="adm-btn adm-btn--primary" href={`/api/transfer/github/start?link=${link}`}>
                    Войти через GitHub
                  </a>
                </p>
              ) : null}
              <p className="adm-muted">{oauth ? 'Или по ключу:' : 'Подключение по ключу:'} 1) нажмите кнопку — откроется GitHub с уже отмеченными правами; 2) внизу нажмите «Generate token»; 3) скопируйте ключ (ghp_…) и вставьте сюда.</p>
              <p>
                <a className="adm-btn" href={GH_TOKEN_URL} target="_blank" rel="noopener noreferrer">
                  Создать ключ GitHub ↗
                </a>
              </p>
              <div className="adm-create">
                <label className="adm-field">
                  <span>Ключ GitHub</span>
                  <input value={ghToken} onChange={(e) => setGhToken(e.target.value)} placeholder="ghp_…" autoComplete="off" spellCheck={false} disabled={locked} />
                </label>
                <button className="adm-btn adm-btn--primary" disabled={busy || !ghToken || locked} onClick={gh}>
                  Подключить
                </button>
              </div>
            </>
          )}
          {msg?.where === 'gh' ? <p className="adm-note adm-note--warn">{msg.text}</p> : null}
        </li>
        <li className={t.cloudflare ? 'is-done' : t.github ? 'is-now' : ''}>
          <b>Cloudflare</b> — здесь будет работать сам сайт (бесплатный тариф подходит).
          {t.cloudflare ? (
            <p>
              Подключён аккаунт: <b>{t.cloudflare.account}</b> ✓
            </p>
          ) : (
            <>
              <p className="adm-muted">
                Нет аккаунта? Зарегистрируйтесь на dash.cloudflare.com (бесплатно) и один раз откройте раздел R2 → «Включить» (бесплатный объём, нужна карта для проверки, деньги не списываются).
              </p>
              <p className="adm-muted">1) нажмите кнопку — откроется Cloudflare с уже выставленными правами; 2) внизу «Continue to summary» → «Create Token»; 3) скопируйте ключ и вставьте сюда.</p>
              <p>
                <a className="adm-btn" href={CF_TOKEN_URL} target="_blank" rel="noopener noreferrer">
                  Создать ключ Cloudflare ↗
                </a>
              </p>
              <div className="adm-create">
                <label className="adm-field">
                  <span>Ключ Cloudflare</span>
                  <input value={cfToken} onChange={(e) => setCfToken(e.target.value)} placeholder="вставьте ключ" autoComplete="off" spellCheck={false} disabled={locked} />
                </label>
                <button className="adm-btn adm-btn--primary" disabled={busy || !cfToken || locked} onClick={() => cf()}>
                  Подключить
                </button>
              </div>
              {accounts ? (
                <div className="adm-create">
                  {accounts.map((a) => (
                    <button key={a.id} className="adm-btn" disabled={busy} onClick={() => cf(a.id)}>
                      {a.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
          {msg?.where === 'cf' ? <p className="adm-note adm-note--warn">{msg.text}</p> : null}
        </li>
        <li className={t.status === 'done' ? 'is-done' : t.github && t.cloudflare ? 'is-now' : ''}>
          <b>Перенос</b>{' '}
          {t.status === 'waiting'
            ? t.github && t.cloudflare
              ? '— всё подключено. Сообщите, что готово: перенос запустят с нашей стороны.'
              : '— начнётся, когда оба аккаунта подключены.'
            : t.status === 'pushing'
              ? '— отправляем код в ваш GitHub…'
              : t.status === 'deploying'
                ? '— ваш GitHub выкладывает сайт в ваш Cloudflare (3–6 минут). Страница обновляется сама.'
                : t.status === 'failed'
                  ? `— не получилось: ${t.message ?? ''}`
                  : '— готово!'}
          {t.repoUrl ? (
            <p>
              Код сайта: <a href={t.repoUrl} target="_blank" rel="noopener noreferrer">{t.repoUrl}</a>
            </p>
          ) : null}
        </li>
        {t.status === 'done' ? (
          <li className="is-now">
            <b>Ваш сайт</b>
            {t.siteUrl ? (
              <p>
                Сайт: <a href={t.siteUrl} target="_blank" rel="noopener noreferrer">{t.siteUrl}</a>
                <br />
                Админка: <a href={`${t.siteUrl}/admin`} target="_blank" rel="noopener noreferrer">{t.siteUrl}/admin</a>
              </p>
            ) : null}
            {password ? (
              <p>
                Пароль админки: <b className="mono">{password}</b> — сохраните его. Сменить: GitHub → ваш репозиторий → Settings → Secrets → ADMIN_PASSWORD.
              </p>
            ) : null}
          </li>
        ) : null}
      </ol>
    </>
  )
}
