'use client'

import { useActionState } from 'react'
import { login, type ActionState } from '../actions'

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, { ok: false, message: '' })
  return (
    <form action={action} className="adm-form">
      <label className="adm-field">
        <span>Пароль</span>
        <input type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      {state.message ? <p className="adm-error">{state.message}</p> : null}
      <button className="adm-btn adm-btn--primary" disabled={pending}>
        {pending ? 'Проверяю…' : 'Войти'}
      </button>
    </form>
  )
}
