import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { listSites } from '@/lib/store'
import { auditSite, siteUrl } from '@/lib/seo'
import { getTemplateMeta, TEMPLATE_METAS } from '@/templates/meta'
import { createSiteAction, duplicateSiteAction, logout } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const scope = await requireAdmin()
  // владелец сайта видит только свой сайт
  if (scope !== '*') redirect(`/admin/sites/${scope}`)
  const sites = await listSites()
  return (
    <div className="adm-shell">
      <header className="adm-bar">
        <Link href="/admin" className="adm-logo">
          Atlas
        </Link>
        <span className="adm-bar__crumb">Сайты</span>
        <div className="adm-bar__side">
          <Link href="/" className="adm-btn">
            Витрина
          </Link>
          <form action={logout}>
            <button className="adm-btn">Выйти</button>
          </form>
        </div>
      </header>

      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Сайты</h1>
            <p className="adm-muted">{sites.length} сайтов на {TEMPLATE_METAS.length} шаблонах</p>
          </div>
        </div>

        <div className="adm-table">
          {sites.map((s) => {
            const checks = auditSite(s)
            const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
            const tpl = getTemplateMeta(s.template)
            return (
              <div key={s.slug} className="adm-row">
                <span className="adm-swatch" style={{ background: `linear-gradient(135deg, ${s.theme.bg} 50%, ${s.theme.accent} 50%)` }} />
                <div className="adm-row__main">
                  <Link href={`/admin/sites/${s.slug}`} className="adm-row__name">
                    {s.name}
                  </Link>
                  <span className="adm-muted">
                    /{s.slug} · {tpl.name} · {s.niche}
                  </span>
                </div>
                <span className={`adm-score${score >= 85 ? ' is-good' : score >= 60 ? ' is-mid' : ''}`} title="SEO-готовность">
                  {score}
                </span>
                <div className="adm-row__actions">
                  <Link href={`/admin/sites/${s.slug}`} className="adm-btn adm-btn--primary">
                    Редактировать
                  </Link>
                  <a href={siteUrl(s)} target="_blank" className="adm-btn">
                    Открыть ↗
                  </a>
                  <form action={duplicateSiteAction}>
                    <input type="hidden" name="slug" value={s.slug} />
                    <button className="adm-btn">Копия</button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>

        <section className="adm-panel">
          <h2>Новый сайт</h2>
          <p className="adm-muted">Берётся структура и тексты образца, оформление — выбранного шаблона. Дальше всё правится в редакторе.</p>
          <form action={createSiteAction} className="adm-create">
            <label className="adm-field">
              <span>Название</span>
              <input name="name" placeholder="Например, Cafe Bahor" required />
            </label>
            <label className="adm-field">
              <span>Адрес (латиница)</span>
              <input name="slug" placeholder="cafe-bahor" pattern="[a-z0-9-]*" />
            </label>
            <label className="adm-field">
              <span>Образец содержимого</span>
              <select name="from" defaultValue={sites[0]?.slug}>
                {sites.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — {s.niche}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              <span>Шаблон</span>
              <select name="template" defaultValue="">
                <option value="">Как у образца</option>
                {TEMPLATE_METAS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.niches[0]}
                  </option>
                ))}
              </select>
            </label>
            <button className="adm-btn adm-btn--primary">Создать</button>
          </form>
        </section>
      </main>
    </div>
  )
}
