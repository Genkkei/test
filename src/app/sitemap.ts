import type { MetadataRoute } from 'next'
import { listSites } from '@/lib/store'
import { PLATFORM_URL, siteAsset, siteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = (await listSites()).filter((s) => s.seo.index)
  return [
    { url: PLATFORM_URL, changeFrequency: 'weekly', priority: 0.6 },
    ...sites.map((s) => ({
      url: siteUrl(s),
      lastModified: s.updatedAt || undefined,
      changeFrequency: 'weekly' as const,
      priority: 1,
      images: [siteAsset(s, 'og')],
    })),
  ]
}

// данные из хранилища правок — на каждый запрос
export const dynamic = 'force-dynamic'
