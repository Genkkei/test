import 'server-only'
import { createHmac } from 'node:crypto'
import { kvGet, kvPut, kvDel } from './kv'

/*
 * Telegram-бот владельца сайта: через него на сайт приходят заказы и записи.
 * Владелец создаёт бота в @BotFather и вставляет токен в админку — дальше всё делает сервер:
 * проверяет токен (getMe), ставит вебхук на /api/tg/<slug> с секретом, выводимым из токена,
 * и выдаёт ссылку t.me/<бот>?start=<код>. Кто нажал «Start» по этой ссылке, получает заявки.
 * Токен хранится в bot:<slug> и в браузер не отдаётся — только имя бота и список чатов.
 */

export type BotChat = { id: number; name: string }
type BotRecord = { token: string; username: string; name: string; code: string; chats: BotChat[]; at: string }
export type BotInfo = { username: string; name: string; chats: BotChat[]; link: string }

const API = 'https://api.telegram.org'

async function tg<T = unknown>(token: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  const data = (await res.json().catch(() => null)) as { ok: boolean; result?: T; description?: string } | null
  if (!data?.ok) throw new Error(data?.description || `Telegram ответил ${res.status}`)
  return data.result as T
}

export function webhookSecret(token: string): string {
  return createHmac('sha256', `atlas-tg:${process.env.ADMIN_SECRET || ''}`).update(token).digest('hex').slice(0, 48)
}

async function read(slug: string): Promise<BotRecord | null> {
  const raw = await kvGet(`bot:${slug}`)
  return raw ? (JSON.parse(raw) as BotRecord) : null
}

function info(r: BotRecord): BotInfo {
  return { username: r.username, name: r.name, chats: r.chats, link: `https://t.me/${r.username}?start=${r.code}` }
}

export async function botInfo(slug: string): Promise<BotInfo | null> {
  const r = await read(slug)
  return r ? info(r) : null
}

/** Публичный адрес конструктора, на который Telegram шлёт вебхук. */
export function publicBase(): string {
  return (process.env.ATLAS_URL || process.env.SITE_URL || '').replace(/\/$/, '')
}

export async function connectBot(slug: string, rawToken: string): Promise<BotInfo> {
  const token = rawToken.trim().replace(/\s+/g, '')
  if (!/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(token)) throw new Error('Это не похоже на токен. Он выглядит так: 1234567890:AAH…  — скопируйте его из сообщения @BotFather целиком.')
  let me: { username: string; first_name: string }
  try {
    me = await tg(token, 'getMe')
  } catch {
    throw new Error('Telegram не принял токен. Проверьте, что скопировали его полностью, без пробелов.')
  }
  const base = publicBase()
  if (!base.startsWith('https://')) throw new Error('Адрес конструктора не задан (ATLAS_URL) — бот может работать только на опубликованном сервере.')
  await tg(token, 'setWebhook', { url: `${base}/api/tg/${slug}`, secret_token: webhookSecret(token), allowed_updates: ['message'], drop_pending_updates: true })
  const prev = await read(slug)
  const rec: BotRecord = {
    token,
    username: me.username,
    name: me.first_name,
    // тот же бот — те же получатели; новый бот — список с нуля
    chats: prev && prev.username === me.username ? prev.chats : [],
    code: prev?.code || crypto.randomUUID().replace(/-/g, '').slice(0, 16),
    at: new Date().toISOString(),
  }
  await kvPut(`bot:${slug}`, JSON.stringify(rec))
  return info(rec)
}

export async function disconnectBot(slug: string): Promise<void> {
  const r = await read(slug)
  if (r) await tg(r.token, 'deleteWebhook').catch(() => null)
  await kvDel(`bot:${slug}`)
}

export async function removeChat(slug: string, id: number): Promise<BotInfo | null> {
  const r = await read(slug)
  if (!r) return null
  r.chats = r.chats.filter((c) => c.id !== id)
  await kvPut(`bot:${slug}`, JSON.stringify(r))
  return info(r)
}

type Update = { message?: { text?: string; chat: { id: number; type: string; first_name?: string; last_name?: string; username?: string; title?: string } } }

/** Вебхук: «/start <код>» добавляет чат в получатели, остальным бот отвечает ссылкой на сайт. */
export async function handleUpdate(slug: string, secret: string | null, update: Update, siteName: string, siteLink: string): Promise<boolean> {
  const r = await read(slug)
  if (!r || secret !== webhookSecret(r.token)) return false
  const m = update.message
  if (!m) return true
  const text = (m.text || '').trim()
  const chat = m.chat
  const who = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || (chat.username ? `@${chat.username}` : String(chat.id))
  if (text === `/start ${r.code}`) {
    if (!r.chats.some((c) => c.id === chat.id)) r.chats.push({ id: chat.id, name: who })
    await kvPut(`bot:${slug}`, JSON.stringify(r))
    await tg(r.token, 'sendMessage', { chat_id: chat.id, text: `Готово! Сюда будут приходить заявки с сайта «${siteName}».\n\nЧтобы проверить, нажмите «Отправить пробную заявку» в админке.` })
    return true
  }
  if (r.chats.some((c) => c.id === chat.id)) {
    await tg(r.token, 'sendMessage', { chat_id: chat.id, text: 'Этот чат получает заявки с сайта. Отвечайте клиентам по номеру телефона из заявки.' })
    return true
  }
  await tg(r.token, 'sendMessage', {
    chat_id: chat.id,
    text: `Здравствуйте! Это бот «${siteName}». Оставьте заявку на сайте — мы свяжемся с вами:\n${siteLink}`,
  })
  return true
}

export type Lead = { name: string; phone: string; date: string; time: string; comment: string; items: string }

function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
}

/** Заявка с сайта во все чаты-получатели. Возвращает число чатов, куда дошло. */
export async function sendLead(slug: string, siteName: string, kind: 'order' | 'booking', lead: Lead, page: string, test = false): Promise<number> {
  const r = await read(slug)
  if (!r || !r.chats.length) return 0
  const phone = lead.phone.replace(/[^\d+]/g, '')
  const lines = [
    `<b>${test ? '🧪 Пробная заявка' : kind === 'order' ? '🛒 Новый заказ' : '📅 Новая запись'}</b> · ${esc(siteName)}`,
    '',
    `👤 ${esc(lead.name)}`,
    `📞 <a href="tel:${esc(phone)}">${esc(lead.phone)}</a>`,
    lead.date || lead.time ? `🗓 ${esc([lead.date, lead.time].filter(Boolean).join(', '))}` : '',
    lead.items ? `📦 ${esc(lead.items)}` : '',
    lead.comment ? `💬 ${esc(lead.comment)}` : '',
    '',
    `<i>${esc(page)}</i>`,
  ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0))
  let sent = 0
  for (const c of r.chats) {
    try {
      await tg(r.token, 'sendMessage', { chat_id: c.id, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true })
      sent++
    } catch (e) {
      console.error(`[bot] ${slug} → ${c.id}:`, e)
    }
  }
  return sent
}
