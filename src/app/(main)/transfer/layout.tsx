import type { Metadata } from 'next'
import '../admin/admin.css'

export const metadata: Metadata = { title: 'Перенос сайта', robots: { index: false, follow: false } }

export default function TransferLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>
}
