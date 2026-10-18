'use server'

import { deleteRouter } from '@/lib/cloudflare'
import { isMaster } from '@/lib/auth'
import { getSite } from '@/lib/store'
import { createTransfer, deleteTransfer, getTransfer, linkOf, openKey, publicView, saveTransfer, type TransferView } from '@/lib/transfer'
import { refreshTransfer, retryDeploy, runTransfer } from '@/lib/transfer-run'
import type { RunState } from '@/lib/github'

type Out = { ok: boolean; message?: string; view?: TransferView; run?: RunState | null; link?: string; password?: string }

async function master() {
  if (!(await isMaster())) throw new Error('Нужен вход владельца конструктора')
}

const base = () => (process.env.ATLAS_URL || '').replace(/\/$/, '')
const fail = (e: unknown): Out => ({ ok: false, message: e instanceof Error ? e.message : String(e) })

export async function startTransferAction(slug: string): Promise<Out> {
  await master()
  const site = await getSite(slug)
  if (!site) return { ok: false, message: 'Нет такого сайта' }
  const { t, link } = await createTransfer(slug, site.name)
  return { ok: true, view: publicView(t), link: `${base()}/transfer/${link}` }
}

export async function transferStateAction(id: string): Promise<Out> {
  await master()
  const t0 = await getTransfer(id)
  if (!t0) return { ok: false, message: 'Перенос не найден' }
  try {
    const { t, run } = await refreshTransfer(t0)
    return { ok: true, view: publicView(t), run, link: t.status === 'waiting' ? `${base()}/transfer/${await linkOf(t)}` : undefined }
  } catch (e) {
    return { ...fail(e), view: publicView(t0) }
  }
}

export async function runTransferAction(id: string): Promise<Out> {
  await master()
  const t = await getTransfer(id)
  if (!t) return { ok: false, message: 'Перенос не найден' }
  try {
    const r = await runTransfer(t)
    return { ok: r.status !== 'failed', message: r.message, view: publicView(r) }
  } catch (e) {
    return { ...fail(e), view: publicView(t) }
  }
}

export async function retryDeployAction(id: string): Promise<Out> {
  await master()
  const t = await getTransfer(id)
  if (!t) return { ok: false, message: 'Перенос не найден' }
  try {
    return { ok: true, view: publicView(await retryDeploy(t)) }
  } catch (e) {
    return fail(e)
  }
}

export async function revealPasswordAction(id: string): Promise<Out> {
  await master()
  const t = await getTransfer(id)
  if (!t?.password) return { ok: false, message: 'Пароль появится после переноса' }
  return { ok: true, password: await openKey(t.password) }
}

/** Отключить сайт у нас — после того как он заработал у заказчика. Необратимо, нужно подтверждение. */
export async function disableHereAction(id: string, confirm: string): Promise<Out> {
  await master()
  const t = await getTransfer(id)
  if (!t) return { ok: false, message: 'Перенос не найден' }
  if (t.status !== 'done') return { ok: false, message: 'Сначала дождитесь, пока сайт заработает у заказчика' }
  if (confirm !== t.slug) return { ok: false, message: `Для подтверждения впишите адрес сайта: ${t.slug}` }
  const site = await getSite(t.slug)
  if (site?.listing.forSale) return { ok: false, message: 'Это демо из каталога — его адрес не отключаем' }
  try {
    await deleteRouter(t.slug)
  } catch (e) {
    return fail(e)
  }
  t.disabledHere = new Date().toISOString()
  await saveTransfer(t)
  return { ok: true, view: publicView(t), message: `Адрес ${t.slug} у нас отключён.` }
}

export async function deleteTransferAction(id: string): Promise<Out> {
  await master()
  const t = await getTransfer(id)
  if (t) await deleteTransfer(t)
  return { ok: true }
}
