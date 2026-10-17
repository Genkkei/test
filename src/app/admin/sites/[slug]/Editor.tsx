'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BUSINESS_TYPES, SECTION_TYPES, sectionSchemas, type Section, type SectionType, type Site } from '@/lib/schema'
import { SECTION_META, type Field } from '@/lib/fields'
import { auditSite, buildJsonLd, seoDescription, seoTitle } from '@/lib/seo'
import type { TemplateMeta } from '@/templates/types'
import { saveSiteAction, deleteSiteAction } from '../../actions'

type Tab = 'sections' | 'design' | 'seo' | 'business' | 'general' | 'json'
const TABS: { id: Tab; label: string }[] = [
  { id: 'sections', label: 'Секции' },
  { id: 'design', label: 'Дизайн' },
  { id: 'seo', label: 'SEO · AEO · GEO' },
  { id: 'business', label: 'Бизнес' },
  { id: 'general', label: 'Основное' },
  { id: 'json', label: 'JSON' },
]

type Path = (string | number)[]

function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (!path.length) return value as T
  const [k, ...rest] = path
  const copy: any = Array.isArray(obj) ? [...(obj as unknown[])] : { ...(obj as object) }
  copy[k] = setIn(copy[k], rest, value)
  return copy
}

export function Editor({ initial, templates, fonts, publicUrl }: { initial: Site; templates: TemplateMeta[]; fonts: string[]; publicUrl: string }) {
  const router = useRouter()
  const [site, setSite] = useState<Site>(initial)
  const [saved, setSaved] = useState(JSON.stringify(initial))
  const [tab, setTab] = useState<Tab>('sections')
  const [msg, setMsg] = useState<{ ok: boolean; text: string; issues?: string[] } | null>(null)
  const [pending, start] = useTransition()
  const [previewKey, setPreviewKey] = useState(0)
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop')
  const [open, setOpen] = useState<string | null>(initial.sections[0]?.id ?? null)
  const dirty = JSON.stringify(site) !== saved

  const update = useCallback((path: Path, value: unknown) => setSite((s) => setIn(s, path, value)), [])

  const save = useCallback(() => {
    start(async () => {
      const res = await saveSiteAction(JSON.stringify(site), initial.slug)
      setMsg({ ok: res.ok, text: res.message, issues: res.issues })
      if (res.ok) {
        setSaved(JSON.stringify(site))
        setPreviewKey((k) => k + 1)
        if (site.slug !== initial.slug) router.replace(`/admin/sites/${site.slug}`)
      }
    })
  }, [site, initial.slug, router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onLeave)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onLeave)
    }
  }, [save, dirty])

  const checks = useMemo(() => auditSite(site), [site])
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)

  return (
    <div className="adm-editor">
      <header className="adm-bar">
        <Link href="/admin" className="adm-logo">
          Atlas
        </Link>
        <span className="adm-bar__crumb">
          <Link href="/admin">Сайты</Link> / {site.name}
        </span>
        <div className="adm-bar__side">
          {msg ? <span className={msg.ok ? 'adm-ok' : 'adm-error'}>{msg.text}</span> : null}
          {dirty ? <span className="adm-dirty">Есть изменения</span> : null}
          <a className="adm-btn" href={publicUrl} target="_blank">
            Открыть ↗
          </a>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={pending || !dirty}>
            {pending ? 'Сохраняю…' : 'Сохранить ⌘S'}
          </button>
        </div>
      </header>
      {msg?.issues?.length ? (
        <ul className="adm-issues">
          {msg.issues.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : null}

      <div className="adm-editor__body">
        <nav className="adm-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>
              {t.label}
              {t.id === 'seo' ? <span className={`adm-score adm-score--sm${score >= 85 ? ' is-good' : score >= 60 ? ' is-mid' : ''}`}>{score}</span> : null}
            </button>
          ))}
        </nav>

        <div className="adm-pane">
          {tab === 'sections' && <SectionsTab site={site} update={update} setSite={setSite} open={open} setOpen={setOpen} />}
          {tab === 'design' && <DesignTab site={site} update={update} templates={templates} fonts={fonts} />}
          {tab === 'seo' && <SeoTab site={site} update={update} checks={checks} publicUrl={publicUrl} />}
          {tab === 'business' && <BusinessTab site={site} update={update} />}
          {tab === 'general' && <GeneralTab site={site} update={update} initialSlug={initial.slug} />}
          {tab === 'json' && <JsonTab site={site} setSite={setSite} />}
        </div>

        <aside className="adm-preview">
          <div className="adm-preview__bar">
            <span className="adm-muted">{dirty ? 'Превью обновится после сохранения' : 'Превью'}</span>
            <div className="adm-seg">
              <button className={device === 'desktop' ? 'is-on' : ''} onClick={() => setDevice('desktop')}>
                Компьютер
              </button>
              <button className={device === 'phone' ? 'is-on' : ''} onClick={() => setDevice('phone')}>
                Телефон
              </button>
            </div>
          </div>
          <div className={`adm-preview__frame adm-preview__frame--${device}`}>
            <iframe key={previewKey} src={`/${initial.slug}`} title="Превью сайта" />
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ---------------- поля ---------------- */

function Text({ label, value, onChange, area, hint, mono, max }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; hint?: string; mono?: boolean; max?: number }) {
  return (
    <label className="adm-field">
      <span>
        {label}
        {max ? <em className={value.length > max ? 'is-over' : ''}>{value.length}/{max}</em> : null}
      </span>
      {area ? (
        <textarea value={value} rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))} onChange={(e) => onChange(e.target.value)} className={mono ? 'mono' : ''} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={mono ? 'mono' : ''} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function Strings({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [draft, setDraft] = useState(value.join('\n'))
  useEffect(() => setDraft(value.join('\n')), [value])
  return (
    <label className="adm-field">
      <span>{label}</span>
      <textarea
        rows={Math.max(2, Math.min(8, value.length + 1))}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))
        }}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <i />
      <span>{label}</span>
    </label>
  )
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: unknown) => void }) {
  switch (field.kind) {
    case 'text':
      return <Text label={field.label} value={value ?? ''} onChange={onChange} hint={field.hint} />
    case 'textarea':
      return <Text label={field.label} value={value ?? ''} onChange={onChange} area hint={field.hint} />
    case 'image':
      return (
        <div className="adm-image">
          <Text label={field.label} value={value ?? ''} onChange={onChange} hint="Пусто — генеративная иллюстрация в цветах сайта" mono />
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" />
          ) : null}
        </div>
      )
    case 'bool':
      return <Toggle label={field.label} value={!!value} onChange={onChange} />
    case 'strings':
      return <Strings label={field.label} value={value ?? []} onChange={onChange} hint={field.hint} />
    case 'link':
      return (
        <div className="adm-pair">
          <Text label={`${field.label}: текст`} value={value?.label ?? ''} onChange={(v) => onChange({ ...value, label: v })} />
          <Text label="ссылка" value={value?.href ?? ''} onChange={(v) => onChange({ ...value, href: v })} mono />
        </div>
      )
    case 'list': {
      const list: any[] = value ?? []
      return (
        <div className="adm-list">
          <p className="adm-list__label">
            {field.label} <em>{list.length}</em>
          </p>
          {list.map((item, i) => (
            <div key={i} className="adm-list__item">
              <div className="adm-list__head">
                <b>
                  {field.itemLabel} {i + 1}
                  {item.title || item.name || item.q ? <span> — {item.title || item.name || item.q}</span> : null}
                </b>
                <div className="adm-icons">
                  <button title="Выше" disabled={i === 0} onClick={() => onChange(move(list, i, -1))}>
                    ↑
                  </button>
                  <button title="Ниже" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, 1))}>
                    ↓
                  </button>
                  <button title="Дублировать" onClick={() => onChange([...list.slice(0, i + 1), structuredClone(item), ...list.slice(i + 1)])}>
                    ⧉
                  </button>
                  <button title="Удалить" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </div>
              </div>
              <div className="adm-fields">
                {field.item.map((f) => (
                  <FieldInput key={f.key} field={f} value={item[f.key]} onChange={(v) => onChange(list.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))} />
                ))}
              </div>
            </div>
          ))}
          <button className="adm-btn adm-btn--dashed" onClick={() => onChange([...list, structuredClone(field.empty)])}>
            + {field.itemLabel}
          </button>
        </div>
      )
    }
  }
}

function move<T>(list: T[], i: number, d: number): T[] {
  const copy = [...list]
  const [x] = copy.splice(i, 1)
  copy.splice(i + d, 0, x)
  return copy
}

/* ---------------- вкладки ---------------- */

type TabProps = { site: Site; update: (path: Path, value: unknown) => void }

function SectionsTab({ site, update, setSite, open, setOpen }: TabProps & { setSite: (fn: (s: Site) => Site) => void; open: string | null; setOpen: (id: string | null) => void }) {
  const [add, setAdd] = useState<SectionType>('services')
  const sections = site.sections
  const addSection = () => {
    const id = `${add}-${Math.random().toString(36).slice(2, 7)}`
    const fresh = sectionSchemas[add].parse({ id, type: add, title: SECTION_META[add].name }) as Section
    setSite((s) => ({ ...s, sections: [...s.sections.slice(0, -1), fresh, ...s.sections.slice(-1)] }))
    setOpen(id)
  }
  return (
    <div className="adm-sections">
      <div className="adm-pane__head">
        <h2>Секции страницы</h2>
        <p className="adm-muted">Порядок сверху вниз. Выключенная секция не рисуется и не попадает в разметку.</p>
      </div>
      {sections.map((sec, i) => {
        const m = SECTION_META[sec.type]
        const isOpen = open === sec.id
        return (
          <div key={sec.id} className={`adm-sec${isOpen ? ' is-open' : ''}${sec.enabled ? '' : ' is-off'}`}>
            <div className="adm-sec__head">
              <button className="adm-sec__toggle" onClick={() => setOpen(isOpen ? null : sec.id)}>
                <span className="adm-sec__type">{m.name}</span>
                <span className="adm-sec__title">{sec.title || sec.label || '—'}</span>
              </button>
              <div className="adm-icons">
                <Toggle label="" value={sec.enabled} onChange={(v) => update(['sections', i, 'enabled'], v)} />
                <button title="Выше" disabled={i === 0} onClick={() => update(['sections'], move(sections, i, -1))}>
                  ↑
                </button>
                <button title="Ниже" disabled={i === sections.length - 1} onClick={() => update(['sections'], move(sections, i, 1))}>
                  ↓
                </button>
                <button
                  title="Дублировать"
                  onClick={() => update(['sections'], [...sections.slice(0, i + 1), { ...structuredClone(sec), id: `${sec.type}-${Math.random().toString(36).slice(2, 7)}` }, ...sections.slice(i + 1)])}
                >
                  ⧉
                </button>
                <button
                  title="Удалить"
                  onClick={() => {
                    if (confirm(`Удалить секцию «${m.name}»?`)) update(['sections'], sections.filter((_, j) => j !== i))
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            {isOpen ? (
              <div className="adm-sec__body">
                {m.description ? <p className="adm-muted">{m.description}</p> : null}
                <div className="adm-fields">
                  {m.fields.map((f) => (
                    <FieldInput key={f.key} field={f} value={(sec as any)[f.key]} onChange={(v) => update(['sections', i, f.key], v)} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
      <div className="adm-add">
        <select value={add} onChange={(e) => setAdd(e.target.value as SectionType)}>
          {SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {SECTION_META[t].name}
            </option>
          ))}
        </select>
        <button className="adm-btn adm-btn--primary" onClick={addSection}>
          + Добавить секцию
        </button>
      </div>
    </div>
  )
}

const COLOR_LABELS: [keyof Site['theme'], string][] = [
  ['bg', 'Фон'],
  ['fg', 'Текст'],
  ['accent', 'Акцент'],
  ['muted', 'Второстепенный текст'],
  ['surface', 'Поверхности'],
  ['line', 'Линии'],
]

function DesignTab({ site, update, templates, fonts }: TabProps & { templates: TemplateMeta[]; fonts: string[] }) {
  const t = site.theme
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Шаблон</h2>
        <p className="adm-muted">Содержимое не меняется — меняется подача. Тему шаблона можно взять целиком или оставить свою.</p>
      </div>
      <div className="adm-tpls">
        {templates.map((tp) => (
          <div key={tp.id} className={`adm-tpl${site.template === tp.id ? ' is-on' : ''}`}>
            <button className="adm-tpl__pick" onClick={() => update(['template'], tp.id)} style={{ background: tp.preview.bg, color: tp.preview.fg }}>
              <span style={{ background: tp.preview.accent }} />
              <b>{tp.preview.word}</b>
            </button>
            <p>{tp.mood}</p>
            {site.template === tp.id ? (
              <button className="adm-link" onClick={() => update(['theme'], { ...tp.defaultTheme })}>
                Вернуть цвета и шрифты шаблона
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="adm-pane__head">
        <h2>Цвета</h2>
      </div>
      <div className="adm-colors">
        {COLOR_LABELS.map(([key, label]) => (
          <label key={key} className="adm-color">
            <input type="color" value={t[key] as string} onChange={(e) => update(['theme', key], e.target.value)} />
            <span>
              {label}
              <input className="mono" value={t[key] as string} onChange={(e) => update(['theme', key], e.target.value)} />
            </span>
          </label>
        ))}
      </div>
      <Contrast fg={t.fg} bg={t.bg} />

      <div className="adm-pane__head">
        <h2>Шрифты и движение</h2>
      </div>
      <div className="adm-fields adm-fields--2">
        <label className="adm-field">
          <span>Заголовки</span>
          <select value={t.display} onChange={(e) => update(['theme', 'display'], e.target.value)}>
            {fonts.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>Текст</span>
          <select value={t.body} onChange={(e) => update(['theme', 'body'], e.target.value)}>
            {fonts.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="adm-field">
          <span>Анимация: {['выключена', 'как задумано', 'смелее'][t.motion]}</span>
          <input type="range" min={0} max={2} step={1} value={t.motion} onChange={(e) => update(['theme', 'motion'], Number(e.target.value))} />
        </label>
      </div>
    </div>
  )
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

function Contrast({ fg, bg }: { fg: string; bg: string }) {
  if (!/^#[0-9a-f]{6}$/i.test(fg) || !/^#[0-9a-f]{6}$/i.test(bg)) return null
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
  const ratio = (a + 0.05) / (b + 0.05)
  return (
    <p className={ratio >= 4.5 ? 'adm-ok' : 'adm-error'}>
      Контраст текста и фона: {ratio.toFixed(1)} : 1 {ratio >= 7 ? '— AAA' : ratio >= 4.5 ? '— AA' : '— ниже нормы WCAG (4.5)'}
    </p>
  )
}

function SeoTab({ site, update, checks, publicUrl }: TabProps & { checks: ReturnType<typeof auditSite>; publicUrl: string }) {
  const [ld, setLd] = useState(false)
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Как сайт видят поисковики</h2>
      </div>
      <div className="adm-serp">
        <p className="adm-serp__url">{publicUrl.replace(/^https?:\/\//, '')}</p>
        <p className="adm-serp__title">{seoTitle(site)}</p>
        <p className="adm-serp__desc">{seoDescription(site)}</p>
      </div>

      <ul className="adm-checks">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? 'is-ok' : ''}>
            <b>{c.ok ? '✓' : '!'}</b>
            <span>
              {c.label}
              {!c.ok ? <small>{c.hint}</small> : null}
            </span>
          </li>
        ))}
      </ul>

      <div className="adm-fields">
        <Text label="Заголовок страницы (title)" value={site.seo.title} onChange={(v) => update(['seo', 'title'], v)} max={65} hint="Пусто — «Название — слоган»" />
        <Text label="Описание (description)" value={site.seo.description} onChange={(v) => update(['seo', 'description'], v)} area max={160} hint="Пусто — берётся из сводки" />
        <Text
          label="Сводка-ответ (AEO)"
          value={site.seo.answer}
          onChange={(v) => update(['seo', 'answer'], v)}
          area
          hint="Что это, где, для кого, сколько стоит. Показывается под первым экраном, уходит в llms.txt и Speakable."
        />
        <Strings label="Ключевые темы (по строке)" value={site.seo.keywords} onChange={(v) => update(['seo', 'keywords'], v)} />
        <Text label="Обложка для соцсетей (адрес)" value={site.seo.ogImage} onChange={(v) => update(['seo', 'ogImage'], v)} hint="Пусто — генерируется автоматически в цветах сайта" mono />
        <Toggle label="Разрешить индексацию" value={site.seo.index} onChange={(v) => update(['seo', 'index'], v)} />
      </div>

      <div className="adm-links">
        <a href={`/${site.slug}/llms.txt`} target="_blank">
          llms.txt ↗
        </a>
        <a href={`/${site.slug}/llms-full.txt`} target="_blank">
          llms-full.txt ↗
        </a>
        <a href={`/${site.slug}/opengraph-image`} target="_blank">
          Обложка ↗
        </a>
        <a href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(publicUrl)}`} target="_blank">
          Проверка в Google ↗
        </a>
        <button className="adm-link" onClick={() => setLd(!ld)}>
          {ld ? 'Скрыть' : 'Показать'} JSON-LD
        </button>
      </div>
      {ld ? <pre className="adm-code">{JSON.stringify(buildJsonLd(site), null, 2)}</pre> : null}
    </div>
  )
}

function BusinessTab({ site, update }: TabProps) {
  const b = site.business
  const set = (k: keyof Site['business']) => (v: unknown) => update(['business', k], v)
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Бизнес</h2>
        <p className="adm-muted">Название, адрес, телефон и часы — основа локального SEO и карточек в картах. Указывайте только проверенные данные.</p>
      </div>
      <div className="adm-fields adm-fields--2">
        <label className="adm-field">
          <span>Тип в schema.org</span>
          <select value={b.type} onChange={(e) => set('type')(e.target.value)}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <Text label="Юридическое название" value={b.legalName} onChange={set('legalName')} />
        <Text label="Телефон" value={b.phone} onChange={set('phone')} />
        <Text label="Почта" value={b.email} onChange={set('email')} />
        <Text label="Улица, дом" value={b.street} onChange={set('street')} />
        <Text label="Город" value={b.city} onChange={set('city')} />
        <Text label="Регион" value={b.region} onChange={set('region')} />
        <Text label="Страна (код)" value={b.country} onChange={set('country')} />
        <Text label="Индекс" value={b.postalCode} onChange={set('postalCode')} />
        <Text label="Широта" value={b.lat} onChange={set('lat')} mono />
        <Text label="Долгота" value={b.lng} onChange={set('lng')} mono />
        <Text label="Ценовой уровень" value={b.priceRange} onChange={set('priceRange')} hint="$, $$, $$$" />
        <Text label="Год основания" value={b.founded} onChange={set('founded')} />
        <Text label="География" value={b.areaServed} onChange={set('areaServed')} />
      </div>
      <div className="adm-fields">
        <Strings label="Часы работы (по строке)" value={b.hours} onChange={set('hours')} hint="Формат schema.org: Mo-Fr 09:00-18:00, Sa 10:00-16:00" />
        <FieldInput
          field={{ key: 'socials', label: 'Соцсети и профили', kind: 'list', itemLabel: 'Профиль', empty: { name: '', url: '' }, item: [{ key: 'name', label: 'Название', kind: 'text' }, { key: 'url', label: 'Ссылка', kind: 'text' }] }}
          value={b.socials}
          onChange={set('socials')}
        />
      </div>
    </div>
  )
}

function GeneralTab({ site, update, initialSlug }: TabProps & { initialSlug: string }) {
  const [confirmText, setConfirmText] = useState('')
  return (
    <div>
      <div className="adm-pane__head">
        <h2>Основное</h2>
      </div>
      <div className="adm-fields">
        <Text label="Название" value={site.name} onChange={(v) => update(['name'], v)} />
        <Text label="Слоган" value={site.tagline} onChange={(v) => update(['tagline'], v)} />
        <Text label="Сфера" value={site.niche} onChange={(v) => update(['niche'], v)} />
        <Text label="Адрес в конструкторе" value={site.slug} onChange={(v) => update(['slug'], v.toLowerCase())} mono hint="Латиница, цифры и дефис. Смена адреса переносит сайт." />
        <Strings label="Свои домены (по строке)" value={site.domains} onChange={(v) => update(['domains'], v)} hint="Направьте домен на сервер конструктора — первый станет canonical." />
        <Text label="Язык (код)" value={site.lang} onChange={(v) => update(['lang'], v)} />
        <FieldInput field={{ key: 'cta', label: 'Кнопка в шапке', kind: 'link' }} value={site.nav.cta} onChange={(v) => update(['nav', 'cta'], v)} />
      </div>
      <div className="adm-danger">
        <h3>Удалить сайт</h3>
        <p className="adm-muted">Введите адрес «{initialSlug}», чтобы подтвердить.</p>
        <form action={deleteSiteAction} className="adm-pair">
          <input type="hidden" name="slug" value={initialSlug} />
          <input name="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mono" />
          <button className="adm-btn adm-btn--danger" disabled={confirmText !== initialSlug}>
            Удалить навсегда
          </button>
        </form>
      </div>
    </div>
  )
}

function JsonTab({ site, setSite }: { site: Site; setSite: (fn: (s: Site) => Site) => void }) {
  const [text, setText] = useState(() => JSON.stringify(site, null, 2))
  const [err, setErr] = useState('')
  return (
    <div>
      <div className="adm-pane__head">
        <h2>JSON сайта</h2>
        <p className="adm-muted">Полный доступ к данным: удобно переносить сайт между конструкторами. Проверка схемы — при сохранении.</p>
      </div>
      <textarea className="adm-json mono" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      {err ? <p className="adm-error">{err}</p> : null}
      <div className="adm-links">
        <button
          className="adm-btn adm-btn--primary"
          onClick={() => {
            try {
              const next = JSON.parse(text)
              setSite(() => next)
              setErr('')
            } catch (e) {
              setErr(`Ошибка JSON: ${(e as Error).message}`)
            }
          }}
        >
          Применить
        </button>
        <button className="adm-btn" onClick={() => setText(JSON.stringify(site, null, 2))}>
          Обновить из редактора
        </button>
      </div>
    </div>
  )
}
