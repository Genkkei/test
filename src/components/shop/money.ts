/** Сумма в сумах с неразрывными пробелами: «35 000 сум» / «35 000 so‘m» / «35 000 UZS». Общая для сервера и браузера. */
export function money(n: number, lang: string): string {
  const v = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${v} ${lang === 'uz' ? 'so‘m' : lang === 'en' ? 'UZS' : 'сум'}`
}
