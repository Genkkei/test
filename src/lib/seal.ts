import nacl from 'tweetnacl'
import { blake2b } from 'blakejs'

/*
 * Шифрование на сервере: токены, которые мы храним (боты клиентов, ключи на время переноса), —
 * AES-GCM ключом из ADMIN_SECRET с отдельной «целью» на каждый вид данных, чтобы шифртекст одного
 * вида нельзя было подсунуть вместо другого.
 */

async function key(purpose: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`atlas:${purpose}:${process.env.ADMIN_SECRET || ''}`))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function seal(purpose: string, text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(purpose), new TextEncoder().encode(text)))
  return `v1.${Buffer.from(iv).toString('base64url')}.${Buffer.from(ct).toString('base64url')}`
}

/** Расшифровка. Строка без префикса v1. — запись старого образца, возвращается как есть. */
export async function unseal(purpose: string, stored: string): Promise<string> {
  if (!stored.startsWith('v1.')) return stored
  const [, iv, ct] = stored.split('.')
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(iv, 'base64url') }, await key(purpose), Buffer.from(ct, 'base64url'))
  return new TextDecoder().decode(pt)
}

/**
 * «Запечатанный ящик» libsodium (crypto_box_seal) — так GitHub требует шифровать секреты репозитория:
 * одноразовая пара ключей, nonce = BLAKE2b(эфемерный ключ ‖ ключ получателя), на выходе — эфемерный ключ ‖ шифртекст.
 * Расшифровать может только GitHub; у нас значение не остаётся.
 */
export function sealedBox(message: string, recipientKeyB64: string): string {
  const pk = Uint8Array.from(Buffer.from(recipientKeyB64, 'base64'))
  const eph = nacl.box.keyPair()
  const nonce = blake2b(new Uint8Array([...eph.publicKey, ...pk]), undefined, 24)
  const box = nacl.box(new TextEncoder().encode(message), nonce, pk, eph.secretKey)
  return Buffer.from(new Uint8Array([...eph.publicKey, ...box])).toString('base64')
}
