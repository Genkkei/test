'use server'

import { headers } from 'next/headers'
import { githubUser, missingScopes, oauthConfigured } from '@/lib/github'
import { inspectToken, type CfAccount } from '@/lib/cloudflare'
import { hitLimit } from '@/lib/guard'
import { kvGet, kvPut } from '@/lib/kv'
import { openKey, publicView, saveTransfer, sealKey, transferByLink, type TransferView } from '@/lib/transfer'
import { refreshTransfer } from '@/lib/transfer-run'

/*
 * Действия заказчика на странице переноса. Доступ — только по ссылке (32 случайных байта, в базе — хэш),
 * 30 действий за 10 минут с адреса. Ключи заказчика шифруются сразу и обратно в браузер не отдаются.
 */

type Out = { ok: boolean; message?: string; view?: TransferView; accounts?: CfAccount[]; password?: string; oauth?: boolean }

async function guard(link: string) {
  const ip = (await headers()).get('cf-connecting-ip') || 'local'
  if (await hitLimit({ get: kvGet, put: kvPut }, `rl:xfer:${ip}`, 30, 600_000)) throw new Error('Слишком много попыток, подождите 10 минут')
  const t = await transferByLink(link)
  if (!t) throw new Error('Ссылка недействительна или истекла. Попросите новую.')
  return t
}
const fail = (e: unknown): Out => ({ ok: false, message: e instanceof Error ? e.message : String(e) })

export async function receiverStateAction(link: string): Promise<Out> {
  try {
    const t = (await refreshTransfer(await guard(link))).t
    // пароль админки видит заказчик — сайт теперь его
    const password = t.status === 'done' || t.status === 'deploying' ? (t.password ? await openKey(t.password) : undefined) : undefined
    return { ok: true, view: publicView(t), password, oauth: oauthConfigured() }
  } catch (e) {
    return fail(e)
  }
}

export async function connectGithubAction(link: string, token: string): Promise<Out> {
  try {
    const t = await guard(link)
    if (t.status !== 'waiting' && t.status !== 'failed') return { ok: false, message: 'Перенос уже идёт' }
    const clean = token.trim()
    if (!/^(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})$/.test(clean)) return { ok: false, message: 'Это не похоже на ключ GitHub. Он начинается с ghp_ или github_pat_.' }
    const u = await githubUser(clean)
    const lacks = missingScopes(u)
    if (lacks.length) return { ok: false, message: `У ключа нет прав: ${lacks.join(', ')}. Создайте ключ по кнопке — галочки уже стоят.` }
    t.gh = { token: await sealKey(clean), login: u.login }
    await saveTransfer(t)
    return { ok: true, view: publicView(t) }
  } catch (e) {
    return fail(e)
  }
}

export async function connectCloudflareAction(link: string, token: string, accountId?: string): Promise<Out> {
  try {
    const t = await guard(link)
    if (t.status !== 'waiting' && t.status !== 'failed') return { ok: false, message: 'Перенос уже идёт' }
    const clean = token.trim()
    if (!/^[A-Za-z0-9_-]{30,60}$/.test(clean)) return { ok: false, message: 'Это не похоже на ключ Cloudflare. Скопируйте его целиком сразу после создания.' }
    const { accounts, problems } = await inspectToken(clean)
    if (problems.length) return { ok: false, message: `Ключу не хватает прав: ${problems.join('; ')}. Создайте ключ по кнопке — права уже выставлены.` }
    const acc = accountId ? accounts.find((a) => a.id === accountId) : accounts.length === 1 ? accounts[0] : null
    if (!acc) return { ok: false, accounts, message: 'Ключ открывает несколько аккаунтов — выберите, куда переносить сайт.' }
    t.cf = { token: await sealKey(clean), accountId: acc.id, accountName: acc.name, subdomain: acc.subdomain }
    await saveTransfer(t)
    return { ok: true, view: publicView(t) }
  } catch (e) {
    return fail(e)
  }
}
