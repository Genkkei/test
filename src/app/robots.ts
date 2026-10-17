import type { MetadataRoute } from 'next'
import { PLATFORM_URL } from '@/lib/seo'

// ИИ-краулеры разрешены явно: закрыть их — значит пропасть из генеративных ответов (GEO).
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'YandexAdditional', 'Bytespider', 'CCBot', 'meta-externalagent']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/admin'] })),
    ],
    sitemap: `${PLATFORM_URL}/sitemap.xml`,
    host: PLATFORM_URL,
  }
}
