import type { NextConfig } from 'next'

const dev = process.env.NODE_ENV !== 'production'

/*
 * Заголовки безопасности для всех сайтов и админки. Сайты ничего не грузят со сторонних адресов
 * (шрифты локальные, карты — ссылками), поэтому политика узкая: свои скрипты, свои запросы,
 * картинки — свои и с https. Inline-скрипты нужны Next и нашим загрузчикам (масштаб телефона,
 * движение), поэтому 'unsafe-inline' остаётся; всё содержимое сайтов при этом экранирует React,
 * а ссылки и картинки из админки проверяет схема (schema.ts).
 * Новый внешний сервис (счётчик, виджет, видео) — добавить его домен сюда, иначе браузер его не пустит.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https:",
  `connect-src 'self'${dev ? ' ws:' : ''}`,
  "frame-src 'self'", // предпросмотр сайта в редакторе админки
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const common = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  ...(dev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      { source: '/:path*', headers: common },
      // админку не встраивают в чужие страницы, не кэшируют и не индексируют
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: `${CSP}; frame-ancestors 'none'`.replace("frame-ancestors 'self'; ", '') },
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // страница переноса: ссылка — ключ доступа, поэтому без кэша, без индекса и без Referer наружу
      {
        source: '/transfer/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ]
  },
}

export default nextConfig
