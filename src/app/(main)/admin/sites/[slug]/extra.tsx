'use client'

import { useState, useTransition } from 'react'
import type { Site } from '@/lib/schema'
import type { BotInfo } from '@/lib/bot'
import { domainAction, publishAction, botStatusAction, changeOwnPasswordAction, connectBotAction, disconnectBotAction, removeChatAction, resetSitePasswordAction, testLeadAction } from '../../actions'

export type { BotInfo }

/*
 * Вкладки для владельца сайта: «С чего начать», «Заявки в Telegram», «Пароль».
 * Пишем так, будто человек открыл админку впервые и не знает слов «вебхук» и «токен»:
 * шаги по номерам, одна кнопка на шаг, результат каждого шага виден сразу.
 */

export function HelpTab({ site, master, publicUrl, go }: { site: Site; master: boolean; publicUrl: string; go: (tab: string) => void }) {
  return (
    <div className="adm-help">
      <div className="adm-pane__head">
        <h2>Ваш сайт «{site.name}»</h2>
        <p className="adm-muted">
          Сайт открыт по адресу{' '}
          <a href={publicUrl} target="_blank">
            {publicUrl.replace(/^https?:\/\//, '')}
          </a>
          . Всё, что вы меняете здесь, появляется на сайте сразу после кнопки «Сохранить» (справа вверху).
        </p>
      </div>
      <ol className="adm-steps">
        <li>
          <b>Поменяйте тексты и цены.</b> Вкладка «Тексты и блоки» — каждый блок сайта раскрывается по нажатию. Меняйте слова прямо в полях, справа видно, как это выглядит.
          <button className="adm-link" onClick={() => go('sections')}>
            Открыть →
          </button>
        </li>
        <li>
          <b>Проверьте телефон, адрес и часы работы.</b> Вкладка «Контакты и часы». Их же видят Google и Яндекс Карты.
          <button className="adm-link" onClick={() => go('business')}>
            Открыть →
          </button>
        </li>
        <li>
          <b>Поставьте свои фото.</b> В любом блоке, где есть фото, нажмите «Загрузить» и выберите снимок с телефона или компьютера (до 8 МБ).
        </li>
        <li>
          <b>Подключите заявки в Telegram.</b> Клиенты оставляют на сайте заказ или запись — вам приходит сообщение с именем и телефоном. Занимает 3 минуты.
          <button className="adm-link" onClick={() => go('bot')}>
            Подключить →
          </button>
        </li>
        <li>
          <b>Переведите сайт.</b> Вверху переключатель «Русский · O‘zbekcha · English»: выберите язык и поправьте тексты той версии. Фото и порядок блоков общие для всех языков.
        </li>
        <li>
          <b>Сохраните.</b> Кнопка «Сохранить» справа вверху (или Ctrl+S). Пока не сохранили — сверху горит «Есть изменения».
        </li>
      </ol>
      <p className="adm-note">
        Что-то сломалось или непонятно — напишите нам в Telegram{' '}
        <a href="https://t.me/genkkei" target="_blank">
          @genkkei
        </a>
        , поможем. Испортить сайт насовсем нельзя: если сохранили не то — напишите, вернём.
      </p>
      {master ? <p className="adm-muted">Вы вошли как владелец конструктора — видите все сайты и служебные вкладки.</p> : null}
    </div>
  )
}

export function BotTab({ slug, bot: initial, site, update }: { slug: string; bot: BotInfo | null; site: Site; update: (path: (string | number)[], value: unknown) => void }) {
  const [bot, setBot] = useState(initial)
  const [token, setToken] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const hero = site.sections.findIndex((s) => s.type === 'hero')
  const heroCta = hero >= 0 ? (site.sections[hero] as { cta?: { label: string; href: string } }).cta : undefined

  const connect = () =>
    start(async () => {
      const res = await connectBotAction(slug, token)
      if (res.ok && res.bot) {
        setBot(res.bot)
        setToken('')
        setMsg({ ok: true, text: `Бот @${res.bot.username} подключён. Теперь шаг 3.` })
        if (!site.leads.enabled) update(['leads', 'enabled'], true)
      } else setMsg({ ok: false, text: res.message || 'Не получилось' })
    })
  const refresh = () => start(async () => setBot(await botStatusAction(slug)))
  const test = () =>
    start(async () => {
      const res = await testLeadAction(slug)
      setMsg({ ok: res.ok, text: res.message })
    })

  const step = !bot ? 2 : bot.chats.length ? 4 : 3
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Заявки в Telegram</h2>
        <p className="adm-muted">Клиент нажимает на сайте «Записаться» или «Заказать», вводит имя и телефон — вам в Telegram приходит сообщение. Нужен свой бот: он бесплатный и делается за минуту.</p>
      </div>
      {msg ? <p className={msg.ok ? 'adm-note' : 'adm-note adm-note--warn'}>{msg.text}</p> : null}

      <ol className="adm-steps">
        <li className={bot ? 'is-done' : ''}>
          <b>Создайте бота.</b> Откройте в Telegram{' '}
          <a href="https://t.me/BotFather" target="_blank">
            @BotFather
          </a>{' '}
          → нажмите «Start» → отправьте ему <code>/newbot</code> → придумайте название (например, «{site.name} заявки») и адрес бота на английском, заканчивающийся на <code>bot</code>. В ответ придёт длинный ключ вида <code>1234567890:AAH…</code> — это токен.
        </li>
        <li className={step === 2 ? 'is-now' : bot ? 'is-done' : ''}>
          <b>Вставьте токен сюда.</b>
          {bot ? (
            <span className="adm-ok"> Подключён бот @{bot.username}.</span>
          ) : (
            <div className="adm-pair">
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="1234567890:AAH…" className="mono" autoComplete="off" />
              <button className="adm-btn adm-btn--primary" disabled={pending || token.length < 20} onClick={connect}>
                {pending ? 'Подключаю…' : 'Подключить'}
              </button>
            </div>
          )}
        </li>
        <li className={step === 3 ? 'is-now' : step > 3 ? 'is-done' : ''}>
          <b>Нажмите Start у своего бота.</b> С того телефона, куда должны приходить заявки, откройте ссылку и нажмите «Start». Можно с нескольких телефонов (например, ваш и администратора).
          {bot ? (
            <div className="adm-pair">
              <a className="adm-btn adm-btn--primary" href={bot.link} target="_blank">
                Открыть бота @{bot.username}
              </a>
              <button className="adm-btn" onClick={refresh} disabled={pending}>
                Я нажал Start — проверить
              </button>
            </div>
          ) : null}
          {bot?.chats.length ? (
            <ul className="adm-chats">
              {bot.chats.map((c) => (
                <li key={c.id}>
                  ✓ Заявки получает: <b>{c.name}</b>
                  <button className="adm-link" onClick={() => start(async () => setBot(await removeChatAction(slug, c.id)))}>
                    убрать
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li className={step === 4 ? 'is-now' : ''}>
          <b>Проверьте.</b> Пришлём пробную заявку — так будут выглядеть настоящие.
          <div className="adm-pair">
            <button className="adm-btn" onClick={test} disabled={pending || !bot?.chats.length}>
              Отправить пробную заявку
            </button>
          </div>
        </li>
      </ol>

      <div className="adm-pane__head">
        <h2>Форма на сайте</h2>
        <p className="adm-muted">После изменений нажмите «Сохранить» справа вверху.</p>
      </div>
      <div className="adm-fields">
        <label className="adm-check">
          <input type="checkbox" checked={site.leads.enabled} onChange={(e) => update(['leads', 'enabled'], e.target.checked)} />
          Принимать заявки с сайта
        </label>
        <div className="adm-seg">
          <button className={site.leads.kind === 'booking' ? 'is-on' : ''} onClick={() => update(['leads', 'kind'], 'booking')}>
            Запись (дата и время)
          </button>
          <button className={site.leads.kind === 'order' ? 'is-on' : ''} onClick={() => update(['leads', 'kind'], 'order')}>
            Заказ (что заказать)
          </button>
        </div>
        <label className="adm-field">
          <span>Заголовок формы</span>
          <input value={site.leads.title} placeholder={site.leads.kind === 'order' ? 'Оформить заказ' : 'Записаться'} onChange={(e) => update(['leads', 'title'], e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Текст после отправки</span>
          <input value={site.leads.thanks} placeholder="Спасибо! Мы перезвоним в течение 15 минут." onChange={(e) => update(['leads', 'thanks'], e.target.value)} />
        </label>
        <p className="adm-muted">Какие кнопки открывают форму:</p>
        <label className="adm-check">
          <input
            type="checkbox"
            checked={site.nav.cta.href.startsWith('#order')}
            onChange={(e) => update(['nav', 'cta', 'href'], e.target.checked ? '#order' : '#contacts')}
          />
          Кнопка в шапке сайта{site.nav.cta.label ? ` («${site.nav.cta.label}»)` : ''}
        </label>
        {heroCta ? (
          <label className="adm-check">
            <input
              type="checkbox"
              checked={heroCta.href.startsWith('#order')}
              onChange={(e) => update(['sections', hero, 'cta', 'href'], e.target.checked ? '#order' : '#contacts')}
            />
            Главная кнопка первого экрана{heroCta.label ? ` («${heroCta.label}»)` : ''}
          </label>
        ) : null}
        <p className="adm-muted">Любой другой кнопке тоже можно вписать ссылку <code>#order</code> — она будет открывать форму.</p>
      </div>
      {bot ? (
        <div className="adm-danger">
          <h3>Отключить бота</h3>
          <p className="adm-muted">Заявки перестанут приходить. Бот в Telegram останется — его можно удалить в @BotFather.</p>
          <button
            className="adm-btn adm-btn--danger"
            onClick={() =>
              start(async () => {
                await disconnectBotAction(slug)
                setBot(null)
              })
            }
          >
            Отключить
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AccessTab({ slug, master, hasPassword }: { slug: string; master: boolean; hasPassword: boolean }) {
  const [pw, setPw] = useState('')
  const [shown, setShown] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Пароль от админки</h2>
        <p className="adm-muted">Админка открывается по адресу вашего сайта + /admin. Пароль знаете только вы.</p>
      </div>
      {msg ? <p className={msg.ok ? 'adm-note' : 'adm-note adm-note--warn'}>{msg.text}</p> : null}
      {master ? (
        <div className="adm-fields">
          <p className="adm-muted">{hasPassword ? 'У владельца сайта есть пароль.' : 'Пароля владельца пока нет — сайт правится только из конструктора.'}</p>
          <button
            className="adm-btn adm-btn--primary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await resetSitePasswordAction(slug)
                if (res.ok && res.password) setShown(res.password)
                else setMsg({ ok: false, text: res.message || 'Не получилось' })
              })
            }
          >
            {hasPassword ? 'Выдать новый пароль владельцу' : 'Создать пароль владельцу'}
          </button>
          {shown ? (
            <p className="adm-note">
              Пароль: <b className="mono">{shown}</b> — скопируйте и передайте заказчику. Больше он не покажется (храним только отпечаток).
            </p>
          ) : null}
        </div>
      ) : (
        <div className="adm-fields">
          <label className="adm-field">
            <span>Новый пароль (не короче 8 символов)</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          </label>
          <button
            className="adm-btn adm-btn--primary"
            disabled={pending || pw.length < 8}
            onClick={() =>
              start(async () => {
                const res = await changeOwnPasswordAction(slug, pw)
                setMsg({ ok: res.ok, text: res.message })
                if (res.ok) setPw('')
              })
            }
          >
            Сменить пароль
          </button>
        </div>
      )}
    </div>
  )
}

export function PublishTab({ slug, url }: { slug: string; url: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [host, setHost] = useState('')
  const [ns, setNs] = useState<string[] | null>(null)
  const [pending, start] = useTransition()
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Публикация и домен</h2>
        <p className="adm-muted">
          Сейчас сайт открывается на <a href={url} target="_blank">{url.replace('https://', '')}</a>. Правки видны сразу после «Сохранить» — публиковать заново не нужно; кнопка ниже — если адрес не открывается.
        </p>
      </div>
      {msg ? <p className={msg.ok ? 'adm-note' : 'adm-note adm-note--warn'}>{msg.text}</p> : null}
      <button className="adm-btn" disabled={pending} onClick={() => start(async () => { const r = await publishAction(slug); setMsg({ ok: r.ok, text: r.message }) })}>
        Опубликовать адрес заново
      </button>

      <div className="adm-pane__head" style={{ marginTop: 28 }}>
        <h2>Свой домен клиента</h2>
        <p className="adm-muted">Например, mycafe.uz. Домен покупает клиент (или вы) у любого регистратора .uz — ahost.uz, webspace.uz, cctld.uz.</p>
      </div>
      <ol className="adm-steps">
        <li className={ns ? 'is-done' : 'is-now'}>
          <b>Впишите домен и нажмите «Подключить».</b>
          <div className="adm-pair">
            <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="mycafe.uz" className="mono" />
            <button
              className="adm-btn adm-btn--primary"
              disabled={pending || host.length < 4}
              onClick={() =>
                start(async () => {
                  const r = await domainAction(slug, host)
                  if (r.status === 'active') {
                    setNs(null)
                    setMsg({ ok: true, text: `Готово: сайт открывается на ${r.url} (сертификат выпускается до 15 минут).` })
                  } else if (r.status === 'pending') {
                    setNs(r.nameServers)
                    setMsg({ ok: true, text: 'Домен добавлен в Cloudflare. Остался шаг 2.' })
                  } else setMsg({ ok: false, text: r.message })
                })
              }
            >
              Подключить
            </button>
          </div>
        </li>
        <li className={ns ? 'is-now' : ''}>
          <b>У регистратора домена замените NS-серверы</b> на эти два (в личном кабинете регистратора: «DNS-серверы» / «NS»):
          {ns ? (
            <div className="adm-ns">
              {ns.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>
          ) : (
            <span className="adm-muted"> появятся после шага 1, если домен ещё не в Cloudflare.</span>
          )}
        </li>
        <li>
          <b>Через 1–24 часа нажмите «Подключить» ещё раз</b> — когда регистратор применит NS, домен привяжется к сайту, и он станет главным адресом (canonical для Google).
        </li>
      </ol>
    </div>
  )
}
