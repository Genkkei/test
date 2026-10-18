import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { listSites } from '@/lib/store'
import { listTransfers, publicView } from '@/lib/transfer'
import { TransferBoard } from './TransferBoard'

export const dynamic = 'force-dynamic'

export default async function TransferPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  if ((await requireAdmin()) !== '*') redirect('/admin')
  const [sites, transfers] = await Promise.all([listSites(), listTransfers()])
  return (
    <div className="adm-shell">
      <header className="adm-bar">
        <Link href="/admin" className="adm-logo">
          Atlas
        </Link>
        <span className="adm-bar__crumb">
          <Link href="/admin">Сайты</Link> / Перенос заказчику
        </span>
      </header>
      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Перенос сайта заказчику</h1>
            <p className="adm-muted">
              Сайт переезжает к заказчику полностью: код — в его GitHub, сайт, база и фото — в его Cloudflare. Заказчик подключает свои аккаунты сам по ссылке — пароли от них он никому не передаёт. Вы нажимаете «Перенести», его GitHub сам выкладывает сайт.
            </p>
          </div>
        </div>
        <TransferBoard
          sites={sites.map((s) => ({ slug: s.slug, name: s.name, demo: s.listing.forSale }))}
          transfers={transfers.map(publicView)}
          preselect={(await searchParams).slug}
        />
      </main>
    </div>
  )
}
