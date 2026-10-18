import 'server-only'
import { kvGet, kvPut } from './kv'
import { seal, unseal } from './seal'

/*
 * Подключения конструктора, которые владелец настраивает кнопками в админке (Настройки → Входы):
 * вход через Google, вход заказчиков через GitHub, кто может входить через Google, можно ли входить
 * паролем. Секреты в базе — зашифрованы; переменные окружения воркера, если заданы, главнее.
 */

export type Integrations = {
  googleClientId: string
  googleClientSecret: string
  githubClientId: string
  githubClientSecret: string
  /** почты Google, которым открыта вся админка конструктора */
  adminEmails: string[]
  /** вход общим паролем; выключают, когда вход через Google проверен */
  passwordLogin: boolean
}

type Stored = Omit<Integrations, 'googleClientSecret' | 'githubClientSecret'> & { googleClientSecret: string; githubClientSecret: string }

const KEY = 'cfg:integrations'
const EMPTY: Stored = { googleClientId: '', googleClientSecret: '', githubClientId: '', githubClientSecret: '', adminEmails: [], passwordLogin: true }

async function stored(): Promise<Stored> {
  const raw = await kvGet(KEY)
  return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Stored>) } : EMPTY
}

export async function integrations(): Promise<Integrations> {
  const s = await stored()
  const open = async (v: string) => (v ? await unseal('integration', v).catch(() => '') : '')
  const env = process.env
  return {
    googleClientId: env.GOOGLE_CLIENT_ID || s.googleClientId,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET || (await open(s.googleClientSecret)),
    githubClientId: env.GITHUB_CLIENT_ID || s.githubClientId,
    githubClientSecret: env.GITHUB_CLIENT_SECRET || (await open(s.githubClientSecret)),
    adminEmails: (env.ADMIN_EMAILS ? env.ADMIN_EMAILS.split(',') : s.adminEmails).map((e) => e.trim().toLowerCase()).filter(Boolean),
    // аварийный ключ: если вход через Google сломался, а пароль выключен — FORCE_PASSWORD_LOGIN=1 у воркера
    passwordLogin: env.FORCE_PASSWORD_LOGIN === '1' || s.passwordLogin,
  }
}

/** Что показать в админке: без секретов, только «задан или нет». */
export async function integrationsView() {
  const i = await integrations()
  const env = process.env
  return {
    googleClientId: i.googleClientId,
    googleSecretSet: !!i.googleClientSecret,
    githubClientId: i.githubClientId,
    githubSecretSet: !!i.githubClientSecret,
    adminEmails: i.adminEmails,
    passwordLogin: i.passwordLogin,
    fromEnv: { google: !!env.GOOGLE_CLIENT_ID, github: !!env.GITHUB_CLIENT_ID, emails: !!env.ADMIN_EMAILS },
  }
}
export type IntegrationsView = Awaited<ReturnType<typeof integrationsView>>

/** Сохранить: пустое поле секрета — оставить прежний. */
export async function saveIntegrations(input: Partial<Integrations>): Promise<void> {
  const s = await stored()
  const next: Stored = { ...s }
  if (input.googleClientId !== undefined) next.googleClientId = input.googleClientId.trim()
  if (input.githubClientId !== undefined) next.githubClientId = input.githubClientId.trim()
  if (input.googleClientSecret) next.googleClientSecret = await seal('integration', input.googleClientSecret.trim())
  if (input.githubClientSecret) next.githubClientSecret = await seal('integration', input.githubClientSecret.trim())
  if (input.adminEmails) next.adminEmails = input.adminEmails.map((e) => e.trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
  if (input.passwordLogin !== undefined) next.passwordLogin = input.passwordLogin
  await kvPut(KEY, JSON.stringify(next))
}

export const atlasBase = () => (process.env.ATLAS_URL || '').replace(/\/$/, '')
