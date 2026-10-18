'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { adminScope, canEdit, checkLogin, clientIp, endSession, isMaster, loginFailed, loginLimited, makePassword, setSitePassword, startSession } from '@/lib/auth'
import { copyTranslations, deleteSite, getSite, listSites, saveSite, saveTranslation } from '@/lib/store'
import { attachDomain, publishRouter, workersSubdomain, type DomainState } from '@/lib/cloudflare'
import { translatableOf } from '@/lib/i18n'
import { botInfo, connectBot, disconnectBot, removeChat, sendLead, type BotInfo } from '@/lib/bot'
import { siteSchema, type Site } from '@/lib/schema'
import { getTemplateMeta, TEMPLATE_METAS } from '@/templates/meta'

const RESERVED = new Set(['admin', 'api', 'llms', 'sitemap', 'robots', '_next', 'favicon'])

export type ActionState = { ok: boolean; message: string; issues?: string[] }

/** Только владелец конструктора: создание, копии, удаление, пароли. */
async function guard() {
  if (!(await isMaster())) throw new Error('Нужен вход владельца конструктора')
}

function refresh(slug: string) {
  revalidatePath(`/${slug}`)
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
}

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const ip = await clientIp()
  if (await loginLimited(ip)) return { ok: false, message: 'Слишком много попыток. Подождите 10 минут.' }
  const scope = await checkLogin(String(form.get('password') || '').trim())
  if (!scope) {
    await loginFailed(ip)
    return { ok: false, message: 'Неверный пароль' }
  }
  await startSession(scope)
  redirect(scope === '*' ? '/admin' : `/admin/sites/${scope}`)
}

export async function logout() {
  await endSession()
  redirect('/admin/login')
}

/** Сохранение из редактора: JSON целиком, сверка по схеме, затем запись. */
export async function saveSiteAction(json: string, originalSlug: string, lang?: string): Promise<ActionState> {
  if (!(await canEdit(originalSlug))) return { ok: false, message: 'Нет доступа к этому сайту' }
  const master = await isMaster()
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return { ok: false, message: 'Это не JSON' }
  }
  const parsed = siteSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, message: 'Данные не прошли проверку', issues: parsed.error.issues.slice(0, 8).map((i) => `${i.path.join('.')}: ${i.message}`) }
  }
  let site = parsed.data
  const base = await getSite(originalSlug)
  // перевод: сохраняются только тексты, структура и оформление остаются от основной версии
  if (base && lang && lang !== base.lang) {
    await saveTranslation(originalSlug, lang, translatableOf(site) as Record<string, unknown>)
    refresh(originalSlug)
    return { ok: true, message: `Перевод сохранён в ${new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}` }
  }
  // владелец сайта не меняет адрес, домены и карточку каталога — это делаем мы
  if (!master && base) site = { ...site, slug: base.slug, domains: base.domains, listing: base.listing }
  if (RESERVED.has(site.slug)) return { ok: false, message: `Адрес «${site.slug}» занят системой` }
  if (!TEMPLATE_METAS.some((t) => t.id === site.template)) return { ok: false, message: 'Нет такого шаблона' }
  if (site.slug !== originalSlug) {
    if (await getSite(site.slug)) return { ok: false, message: `Сайт с адресом «${site.slug}» уже есть` }
  }
  const saved = await saveSite(site)
  if (site.slug !== originalSlug) {
    await deleteSite(originalSlug)
    refresh(originalSlug)
  }
  refresh(saved.slug)
  return { ok: true, message: `Сохранено в ${new Date(saved.updatedAt).toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}` }
}

function uniqueSlug(base: string, taken: Set<string>): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'site'
  let slug = clean
  for (let i = 2; taken.has(slug) || RESERVED.has(slug); i++) slug = `${clean}-${i}`
  return slug
}

/** Новый сайт: копия выбранного образца, с темой выбранного шаблона. */
export async function createSiteAction(form: FormData) {
  await guard()
  const from = String(form.get('from') || '')
  const template = String(form.get('template') || '')
  const name = String(form.get('name') || '').trim() || 'Новый сайт'
  const sites = await listSites()
  const source = sites.find((s) => s.slug === from) ?? sites[0]
  if (!source) throw new Error('Нет образца')
  const tpl = getTemplateMeta(template || source.template)
  const slug = uniqueSlug(String(form.get('slug') || '') || translit(name), new Set(sites.map((s) => s.slug)))
  const site: Site = {
    ...structuredClone(source),
    slug,
    name,
    template: tpl.id,
    domains: [],
    theme: template && template !== source.template ? { ...tpl.defaultTheme } : source.theme,
    seo: { ...source.seo, title: '', index: true },
  }
  await saveSite(site)
  refresh(slug)
  redirect(`/admin/sites/${slug}`)
}

export async function duplicateSiteAction(form: FormData) {
  await guard()
  const source = await getSite(String(form.get('slug')))
  if (!source) return
  const slug = uniqueSlug(`${source.slug}-copy`, new Set((await listSites()).map((s) => s.slug)))
  await saveSite({ ...structuredClone(source), slug, name: `${source.name} (копия)`, domains: [] })
  refresh(slug)
  redirect(`/admin/sites/${slug}`)
}

export async function deleteSiteAction(form: FormData) {
  await guard()
  const slug = String(form.get('slug'))
  if (String(form.get('confirm')) !== slug) return
  await deleteSite(slug)
  refresh(slug)
  redirect('/admin')
}

const MAP: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' }
function translit(s: string): string {
  return s.toLowerCase().replace(/./g, (c) => MAP[c] ?? c)
}

/** Новый пароль владельца сайта. Показывается один раз — в хранилище только хэш. */
export async function resetSitePasswordAction(slug: string): Promise<{ ok: boolean; password?: string; message?: string }> {
  await guard()
  if (!(await getSite(slug))) return { ok: false, message: 'Нет такого сайта' }
  const password = makePassword()
  await setSitePassword(slug, password)
  return { ok: true, password }
}

/** Владелец сайта меняет свой пароль сам. */
export async function changeOwnPasswordAction(slug: string, password: string): Promise<ActionState> {
  if (!(await canEdit(slug))) return { ok: false, message: 'Нет доступа' }
  if (password.trim().length < 8) return { ok: false, message: 'Пароль — не короче 8 символов' }
  await setSitePassword(slug, password.trim())
  return { ok: true, message: 'Пароль изменён' }
}

export async function currentScope() {
  return adminScope()
}

// --- Telegram-бот заявок ---

export async function connectBotAction(slug: string, token: string): Promise<{ ok: boolean; message?: string; bot?: BotInfo }> {
  if (!(await canEdit(slug))) return { ok: false, message: 'Нет доступа' }
  try {
    return { ok: true, bot: await connectBot(slug, token) }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Не получилось подключить бота' }
  }
}

export async function botStatusAction(slug: string): Promise<BotInfo | null> {
  if (!(await canEdit(slug))) return null
  return botInfo(slug)
}

export async function disconnectBotAction(slug: string): Promise<{ ok: boolean }> {
  if (!(await canEdit(slug))) return { ok: false }
  await disconnectBot(slug)
  return { ok: true }
}

export async function removeChatAction(slug: string, id: number): Promise<BotInfo | null> {
  if (!(await canEdit(slug))) return null
  return removeChat(slug, id)
}

export async function testLeadAction(slug: string): Promise<ActionState> {
  if (!(await canEdit(slug))) return { ok: false, message: 'Нет доступа' }
  const site = await getSite(slug)
  if (!site) return { ok: false, message: 'Нет сайта' }
  const n = await sendLead(slug, site.name, site.leads.kind, { name: 'Пробный Клиент', phone: '+998 90 000-00-00', date: site.leads.kind === 'booking' ? 'завтра' : '', time: site.leads.kind === 'booking' ? '15:00' : '', items: '', comment: 'Это проверка: так будут выглядеть заявки с сайта.' }, 'Отправлено из админки', true)
  return n ? { ok: true, message: `Отправлено в ${n} чат(а). Проверьте Telegram.` } : { ok: false, message: 'Некуда отправлять: сначала нажмите Start у бота (шаг 3).' }
}

// --- Выдача сайта клиенту ---

export type HandOver = { ok: boolean; message?: string; slug?: string; url?: string; admin?: string; password?: string }

/**
 * «Выдать клиенту»: копия демо-сайта под клиента (с переводами), свой адрес, пароль владельца
 * и публикация воркера сайта — одним действием. Демо в каталоге остаётся как было.
 */
export async function handOverAction(_: HandOver, form: FormData): Promise<HandOver> {
  await guard()
  const from = String(form.get('from') || '')
  const name = String(form.get('name') || '').trim()
  const source = await getSite(from)
  if (!source) return { ok: false, message: 'Нет такого демо-сайта' }
  if (name.length < 2) return { ok: false, message: 'Впишите название бизнеса клиента' }
  const taken = new Set((await listSites()).map((s) => s.slug))
  const slug = uniqueSlug(String(form.get('slug') || '') || translit(name), taken)
  let sub = 'genkai'
  try {
    sub = await workersSubdomain()
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
  const site: Site = {
    ...structuredClone(source),
    slug,
    name,
    domains: [`${slug}.${sub}.workers.dev`],
    listing: { ...source.listing, forSale: false },
    seo: { ...source.seo, title: '' },
  }
  await saveSite(site)
  await copyTranslations(from, slug)
  const password = makePassword()
  await setSitePassword(slug, password)
  try {
    const url = await publishRouter(slug)
    return { ok: true, slug, url, admin: `${url}/admin`, password }
  } catch (e) {
    return { ok: false, slug, password, message: `Сайт создан, но не опубликован: ${e instanceof Error ? e.message : e}. Нажмите «Опубликовать» в редакторе сайта.` }
  }
}

export async function publishAction(slug: string): Promise<{ ok: boolean; message: string }> {
  await guard()
  try {
    return { ok: true, message: `Опубликован: ${await publishRouter(slug)}` }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) }
  }
}

export async function domainAction(slug: string, host: string): Promise<DomainState> {
  await guard()
  const site = await getSite(slug)
  if (!site) return { status: 'error', message: 'Нет сайта' }
  try {
    const res = await attachDomain(slug, host)
    if (res.status === 'active') {
      const h = res.url.replace('https://', '')
      await saveSite({ ...site, domains: [h, ...site.domains.filter((d) => d !== h)] })
      refresh(slug)
    }
    return res
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : String(e) }
  }
}
