import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { googleCallback } from '@/lib/google'
import { atlasBase, integrationsView } from '@/lib/settings'
import { Settings } from './Settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  if ((await requireAdmin()) !== '*') redirect('/admin')
  const base = atlasBase()
  return (
    <div className="adm-shell">
      <header className="adm-bar">
        <Link href="/admin" className="adm-logo">
          Atlas
        </Link>
        <span className="adm-bar__crumb">
          <Link href="/admin">Сайты</Link> / Настройки входа
        </span>
      </header>
      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Входы: Google и GitHub</h1>
            <p className="adm-muted">Настраивается один раз. После этого вы входите в админку через свой Google, а заказчики при переносе подключают GitHub одной кнопкой.</p>
          </div>
        </div>
        <Settings initial={await integrationsView()} base={base} googleRedirect={googleCallback()} githubRedirect={`${base}/api/transfer/github/callback`} />
      </main>
    </div>
  )
}
