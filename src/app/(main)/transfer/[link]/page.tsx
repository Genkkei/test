import { notFound } from 'next/navigation'
import { oauthConfigured } from '@/lib/github'
import { publicView, transferByLink } from '@/lib/transfer'
import { Receiver } from './Receiver'

export const dynamic = 'force-dynamic'

export default async function ReceiverPage({ params, searchParams }: { params: Promise<{ link: string }>; searchParams: Promise<{ gh?: string }> }) {
  const { link } = await params
  const t = await transferByLink(link)
  if (!t) notFound()
  const ghError = (await searchParams).gh
  return (
    <main className="adm-main" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="adm-head">
        <div>
          <p className="adm-logo">Перенос сайта</p>
          <h1>{t.name}</h1>
          <p className="adm-muted">
            Сайт переедет в ваши аккаунты: код — в ваш GitHub, сам сайт — в ваш Cloudflare. Это бесплатно и займёт около 5 минут. Пароли от аккаунтов вводить здесь не нужно.
          </p>
        </div>
      </div>
      <Receiver link={link} initial={publicView(t)} oauth={await oauthConfigured()} ghError={ghError ? ghError.slice(0, 200) : undefined} />
    </main>
  )
}
