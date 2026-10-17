'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { checkPassword, endSession, isAdmin, loginFailed, loginLimited, startSession } from '@/lib/auth'
import { deleteSite, getSite, listSites, saveSite } from '@/lib/store'
import { siteSchema, type Site } from '@/lib/schema'
import { getTemplateMeta, TEMPLATE_METAS } from '@/templates/meta'

const RESERVED = new Set(['admin', 'api', 'llms', 'sitemap', 'robots', '_next', 'favicon'])

export type ActionState = { ok: boolean; message: string; issues?: string[] }

async function guard() {
  if (!(await isAdmin())) throw new Error('Нужен вход в админку')
}

function refresh(slug: string) {
  revalidatePath(`/${slug}`)
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
}

export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (loginLimited(ip)) return { ok: false, message: 'Слишком много попыток. Подождите 10 минут.' }
  if (!checkPassword(String(form.get('password') || ''))) {
    loginFailed(ip)
    return { ok: false, message: 'Неверный пароль' }
  }
  await startSession()
  redirect('/admin')
}

export async function logout() {
  await endSession()
  redirect('/admin/login')
}

/** Сохранение из редактора: JSON целиком, сверка по схеме, затем запись. */
export async function saveSiteAction(json: string, originalSlug: string): Promise<ActionState> {
  await guard()
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
  const site = parsed.data
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
  return { ok: true, message: `Сохранено в ${new Date(saved.updatedAt).toLocaleTimeString('ru-RU')}` }
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
