import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listSites } from '@/lib/store'
import { HandOverForm } from './HandOverForm'

export const dynamic = 'force-dynamic'

export default async function HandOverPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  if ((await requireAdmin()) !== '*') redirect('/admin')
  const sites = (await listSites()).filter((s) => s.listing.forSale)
  const from = (await searchParams).from
  return (
    <div className="adm-shell">
      <header className="adm-bar">
        <Link href="/admin" className="adm-logo">
          Atlas
        </Link>
        <span className="adm-bar__crumb">
          <Link href="/admin">Сайты</Link> / Выдать сайт клиенту
        </span>
      </header>
      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Выдать сайт клиенту</h1>
            <p className="adm-muted">Клиент купил сайт из каталога. Здесь за одну кнопку: копия демо под его название, свой адрес, админка с паролем. Демо в каталоге не меняется — его можно продавать дальше.</p>
          </div>
        </div>
        <HandOverForm sites={sites.map((s) => ({ slug: s.slug, name: s.name, niche: s.niche }))} from={from} />
      </main>
    </div>
  )
}
