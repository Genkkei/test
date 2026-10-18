import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// buildCommand задан явно: `opennextjs-cloudflare build` по умолчанию зовёт `npm run build`,
// а сборка Cloudflare сама вызывает его же — бесконечная цепочка (ловушка из heska-perfumes).
export default {
  ...defineCloudflareConfig(),
  buildCommand: 'npm run build',
}
