import { redirect } from 'next/navigation'
import { adminPassword, isAdmin } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin')
  const closed = !adminPassword()
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <p className="adm-logo">Atlas</p>
        <h1>Вход в конструктор</h1>
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
