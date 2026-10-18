/* Ставки конфигуратора из блока цен: позиция с «м²» в периоде — фасад за квадратный метр,
 * остальные — дополнения за штуку. Отдельный модуль: серверный шаблон зовёт его до передачи в клиент. */

export type Rate = { name: string; perM2: boolean; price: number; note: string }
const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0
export const parseRates = (items: { name: string; price: string; period: string; features: string[] }[]): Rate[] =>
  items.map((it) => ({ name: it.name, perM2: /м²|m²|m2|кв\.? ?м|kv\.? ?m/i.test(it.period), price: num(it.price), note: it.features[0] ?? '' }))

