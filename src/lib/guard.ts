/*
 * Общие проверки публичных форм (заявка, заказ). Форма отправляется только со своей страницы:
 * запрос с чужого сайта (Origin другого адреса) отклоняется, тело больше 16 КБ не читается.
 */
export function formRefusal(request: Request): Response | null {
  const len = Number(request.headers.get('content-length') || 0)
  if (len > 16_384) return Response.json({ ok: false, error: 'big' }, { status: 413 })
  const origin = request.headers.get('origin')
  if (origin) {
    let host = ''
    try {
      host = new URL(origin).host
    } catch {}
    const own = [request.headers.get('x-forwarded-host'), request.headers.get('host')].filter(Boolean)
    if (!own.includes(host)) return Response.json({ ok: false, error: 'origin' }, { status: 403 })
  }
  return null
}
