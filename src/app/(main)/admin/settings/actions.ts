'use server'

import { isMaster } from '@/lib/auth'
import { googleConfigured } from '@/lib/google'
import { integrationsView, saveIntegrations, type IntegrationsView } from '@/lib/settings'

type Out = { ok: boolean; message: string; view?: IntegrationsView }

export async function saveIntegrationsAction(input: {
  googleClientId?: string
  googleClientSecret?: string
  githubClientId?: string
  githubClientSecret?: string
  adminEmails?: string
}): Promise<Out> {
  if (!(await isMaster())) return { ok: false, message: 'Нужен вход владельца конструктора' }
  const id = (v?: string) => (v === undefined ? undefined : v.trim().slice(0, 200))
  if (input.googleClientId && !/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(input.googleClientId.trim())) return { ok: false, message: 'Client ID Google выглядит так: 1234-abcd.apps.googleusercontent.com' }
  if (input.githubClientId && !/^(Iv1\.|Ov2|Iv23)?[A-Za-z0-9]{8,40}$/.test(input.githubClientId.trim())) return { ok: false, message: 'Это не похоже на Client ID GitHub' }
  await saveIntegrations({
    googleClientId: id(input.googleClientId),
    googleClientSecret: input.googleClientSecret?.trim() || undefined,
    githubClientId: id(input.githubClientId),
    githubClientSecret: input.githubClientSecret?.trim() || undefined,
    adminEmails: input.adminEmails === undefined ? undefined : input.adminEmails.split(/[\s,;]+/),
  })
  return { ok: true, message: 'Сохранено', view: await integrationsView() }
}

/** Выключить вход общим паролем — только когда вход через Google настроен. */
export async function setPasswordLoginAction(on: boolean): Promise<Out> {
  if (!(await isMaster())) return { ok: false, message: 'Нужен вход владельца конструктора' }
  if (!on && !(await googleConfigured())) return { ok: false, message: 'Сначала настройте и проверьте вход через Google' }
  await saveIntegrations({ passwordLogin: on })
  return { ok: true, message: on ? 'Вход паролем включён' : 'Вход паролем выключен — только через Google', view: await integrationsView() }
}
