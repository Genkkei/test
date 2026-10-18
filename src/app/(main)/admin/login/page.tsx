import { redirect } from 'next/navigation'
import { adminPassword, hostSite, isAdmin } from '@/lib/auth'
import { getSite } from '@/lib/store'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin')
  const slug = await hostSite()
  const site = slug ? await getSite(slug) : null
  const closed = !adminPassword() && !site
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
            {process.env.NODE_ENV !== 'production' && !process.env.ADMIN_PASSWORD ? <p className="adm-note">Режим разработки: пароль «admin».</p> : null}
            <LoginForm />
          </>
        )}
      </div>
    </main>
  )
}
