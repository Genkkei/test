import { redirect } from 'next/navigation'
import { adminPassword, hostSite, isAdmin } from '@/lib/auth'
import { getSite } from '@/lib/store'
import { LoginForm } from './LoginForm'
import { googleConfigured } from '@/lib/google'
import { integrations } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  if (await isAdmin()) redirect('/admin')
  const slug = await hostSite()
  const site = slug ? await getSite(slug) : null
  const google = !site && (await googleConfigured())
  const passwordOn = !!site || (await integrations()).passwordLogin
  const closed = !adminPassword() && !site && !google
  const err = (await searchParams).err?.slice(0, 160)
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <p className="adm-logo">{site ? site.name : 'Atlas'}</p>
        <h1>{site ? 'Вход в админку сайта' : 'Вход в конструктор'}</h1>
        {site ? <p className="adm-muted">Введите пароль, который вам выдали вместе с сайтом. Забыли — напишите нам в Telegram @genkkei.</p> : null}
        {closed ? (
          <p className="adm-note adm-note--warn">Админка закрыта: на сервере не задан ADMIN_PASSWORD.</p>
        ) : (
          <>
            {err ? <p className="adm-error">{err}</p> : null}
            {google ? (
              <a className="adm-btn adm-btn--primary" href="/api/auth/google/start">
                Войти через Google
              </a>
            ) : null}
            {process.env.NODE_ENV !== 'production' && !process.env.ADMIN_PASSWORD ? <p className="adm-note">Режим разработки: пароль «admin».</p> : null}
            {passwordOn ? (
              <>
                {google ? <p className="adm-muted">или паролем:</p> : null}
                <LoginForm />
              </>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
