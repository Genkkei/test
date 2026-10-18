import 'server-only'
import { ROUTER_SCRIPT } from './router-script.generated'

/*
 * Публикация сайта из админки, без командной строки: воркер-маршрутизатор <slug> (тот же код,
 * что workers/router/index.js) с адресом <slug>.<поддомен>.workers.dev и, по желанию, свой домен.
 * Нужны секреты CF_API_TOKEN и CF_ACCOUNT_ID у воркера atlas; только владелец конструктора.
 */

const API = 'https://api.cloudflare.com/client/v4'

function creds() {
  const token = process.env.CF_API_TOKEN
  const account = process.env.CF_ACCOUNT_ID
  if (!token || !account) throw new Error('Публикация из админки не настроена: у воркера atlas нет секретов CF_API_TOKEN и CF_ACCOUNT_ID.')
  return { token, account }
}

async function cf<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = creds()
  const res = await fetch(`${API}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers || {}) } })
  const data = (await res.json().catch(() => null)) as { success: boolean; result: T; errors?: { message: string }[] } | null
  if (!data?.success) throw new Error(data?.errors?.map((e) => e.message).join('; ') || `Cloudflare ответил ${res.status}`)
  return data.result
}

export async function workersSubdomain(): Promise<string> {
  const { account } = creds()
  return (await cf<{ subdomain: string }>(`/accounts/${account}/workers/subdomain`)).subdomain
}

/** Воркер-маршрутизатор сайта. Повторный вызов просто перевыкладывает его. */
export async function publishRouter(slug: string): Promise<string> {
  const { account } = creds()
  const form = new FormData()
  form.set(
    'metadata',
    JSON.stringify({
      main_module: 'index.js',
      compatibility_date: '2026-10-01',
      bindings: [
        { type: 'service', name: 'ATLAS', service: process.env.ATLAS_SERVICE || 'atlas' },
        { type: 'plain_text', name: 'SITE', text: slug },
      ],
    }),
  )
  form.set('index.js', new Blob([ROUTER_SCRIPT], { type: 'application/javascript+module' }), 'index.js')
  await cf(`/accounts/${account}/workers/scripts/${slug}`, { method: 'PUT', body: form })
  await cf(`/accounts/${account}/workers/scripts/${slug}/subdomain`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled: true }) })
  return `https://${slug}.${await workersSubdomain()}.workers.dev`
}

export type DomainState = { status: 'active'; url: string } | { status: 'pending'; nameServers: string[] } | { status: 'error'; message: string }

/**
 * Свой домен сайта. Домен должен быть зоной в этом аккаунте Cloudflare: если её нет — создаём и
 * возвращаем NS-серверы, которые клиент прописывает у регистратора (ahost, webspace и т. п.);
 * когда зона активна — привязываем домен к воркеру сайта (сертификат Cloudflare выпускает сам).
 */
export async function attachDomain(slug: string, hostname: string): Promise<DomainState> {
  const { account } = creds()
  const host = hostname.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) return { status: 'error', message: 'Это не похоже на домен. Пример: mycafe.uz' }
  const apex = host.split('.').slice(-2).join('.')
  const zones = await cf<{ id: string; status: string; name_servers: string[] }[]>(`/zones?name=${apex}`)
  let zone = zones[0]
  if (!zone) {
    try {
      zone = await cf(`/zones`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: apex, account: { id: account }, type: 'full' }) })
    } catch (e) {
      return { status: 'error', message: `Cloudflare не создал зону ${apex}: ${e instanceof Error ? e.message : e}` }
    }
  }
  if (zone.status !== 'active') return { status: 'pending', nameServers: zone.name_servers }
  const targets = host === apex ? [apex, `www.${apex}`] : [host]
  for (const h of targets) {
    await cf(`/accounts/${account}/workers/domains`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hostname: h, service: slug, zone_id: zone.id, environment: 'production' }),
    })
  }
  return { status: 'active', url: `https://${host}` }
}

// --- Cloudflare получателя (перенос сайта заказчику) ---

export type CfAccount = { id: string; name: string; subdomain: string | null }

/**
 * Проверка ключа получателя: какие аккаунты он открывает и хватает ли прав на Workers, D1 и R2.
 * Возвращает аккаунты или понятную ошибку — ключ в ответ не попадает.
 */
export async function inspectToken(token: string): Promise<{ accounts: CfAccount[]; problems: string[] }> {
  const call = async (p: string) => {
    const res = await fetch(`${API}${p}`, { headers: { authorization: `Bearer ${token}` } })
    return (await res.json().catch(() => null)) as { success: boolean; result: unknown; errors?: { message: string }[] } | null
  }
  const accounts = await call('/accounts?per_page=50')
  if (!accounts?.success) throw new Error('Cloudflare не принял ключ. Скопируйте его целиком сразу после создания.')
  const list = accounts.result as { id: string; name: string }[]
  if (!list.length) throw new Error('Ключ не открывает ни одного аккаунта. При создании ключа выберите свой аккаунт в «Account Resources».')
  const out: CfAccount[] = []
  const problems = new Set<string>()
  for (const a of list.slice(0, 5)) {
    const sub = await call(`/accounts/${a.id}/workers/subdomain`)
    const scripts = await call(`/accounts/${a.id}/workers/scripts`)
    const d1 = await call(`/accounts/${a.id}/d1/database?per_page=1`)
    const r2 = await call(`/accounts/${a.id}/r2/buckets?per_page=1`)
    if (!scripts?.success) problems.add('нет права Workers Scripts: Edit')
    if (!d1?.success) problems.add('нет права D1: Edit')
    if (!r2?.success) problems.add('нет права Workers R2 Storage: Edit (или R2 не включён в аккаунте)')
    out.push({ id: a.id, name: a.name, subdomain: (sub?.result as { subdomain?: string } | null)?.subdomain ?? null })
  }
  return { accounts: out, problems: [...problems] }
}

/** Удалить воркер-адрес сайта у нас (после переноса заказчику). Необратимо: адрес перестаёт открываться. */
export async function deleteRouter(slug: string): Promise<void> {
  const { account } = creds()
  await cf(`/accounts/${account}/workers/scripts/${slug}?force=true`, { method: 'DELETE' })
}
