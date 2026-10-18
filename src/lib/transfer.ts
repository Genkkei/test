import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { kvDel, kvGet, kvList, kvPut } from './kv'
import { seal, unseal } from './seal'

/*
 * Перенос сайта заказчику. Владелец конструктора создаёт перенос и отправляет заказчику ссылку;
 * заказчик по ней подключает свой GitHub и свой Cloudflare (пароли он никому не передаёт);
 * владелец нажимает «Перенести» — код уходит в репозиторий заказчика, его GitHub сам выкладывает
 * сайт в его Cloudflare. Ключи заказчика хранятся зашифрованными и удаляются, когда перенос закончен.
 */

export type TransferStatus = 'waiting' | 'pushing' | 'deploying' | 'done' | 'failed'
export type Transfer = {
  id: string
  slug: string
  name: string
  createdAt: string
  expiresAt: string
  link: string // зашифрованная ссылка для заказчика
  gh?: { token: string; login: string }
  cf?: { token: string; accountId: string; accountName: string; subdomain: string | null }
  repo?: { owner: string; repo: string; url: string }
  password?: string // зашифрованный пароль админки на стороне заказчика
  status: TransferStatus
  message?: string
  siteUrl?: string
  doneAt?: string
  disabledHere?: string
}

const TTL_MS = 3 * 24 * 3600 * 1000
const hash = (s: string) => createHash('sha256').update(s).digest('hex')

export async function createTransfer(slug: string, name: string): Promise<{ t: Transfer; link: string }> {
  const id = randomBytes(9).toString('base64url')
  const link = randomBytes(32).toString('base64url')
  const now = Date.now()
  const t: Transfer = { id, slug, name, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + TTL_MS).toISOString(), link: await seal('transfer-link', link), status: 'waiting' }
  await kvPut(`xfer:${id}`, JSON.stringify(t))
  await kvPut(`xfer-link:${hash(link)}`, id)
  return { t, link }
}

export async function getTransfer(id: string): Promise<Transfer | null> {
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null
  const raw = await kvGet(`xfer:${id}`)
  return raw ? (JSON.parse(raw) as Transfer) : null
}

/** Перенос по ссылке заказчика. Просроченная ссылка не открывается (пока перенос не начат). */
export async function transferByLink(link: string): Promise<Transfer | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(link)) return null
  const id = await kvGet(`xfer-link:${hash(link)}`)
  const t = id ? await getTransfer(id) : null
  if (!t) return null
  if (t.status === 'waiting' && Date.parse(t.expiresAt) < Date.now()) return null
  return t
}

export async function saveTransfer(t: Transfer): Promise<void> {
  await kvPut(`xfer:${t.id}`, JSON.stringify(t))
}

export async function listTransfers(): Promise<Transfer[]> {
  const all = await kvList('xfer:')
  return [...all.values()].map((v) => JSON.parse(v) as Transfer).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function deleteTransfer(t: Transfer): Promise<void> {
  try {
    await kvDel(`xfer-link:${hash(await unseal('transfer-link', t.link))}`)
  } catch {}
  await kvDel(`xfer:${t.id}`)
}

export const linkOf = (t: Transfer) => unseal('transfer-link', t.link)
export const sealKey = (v: string) => seal('transfer-key', v)
export const openKey = (v: string) => unseal('transfer-key', v)

/** Состояние для страниц: без ключей, только то, что можно показать. */
export function publicView(t: Transfer) {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    status: t.status,
    message: t.message ?? null,
    github: t.gh ? t.gh.login : null,
    cloudflare: t.cf ? { account: t.cf.accountName, subdomain: t.cf.subdomain } : null,
    repoUrl: t.repo?.url ?? null,
    siteUrl: t.siteUrl ?? null,
    expiresAt: t.expiresAt,
    disabledHere: t.disabledHere ?? null,
  }
}
export type TransferView = ReturnType<typeof publicView>
