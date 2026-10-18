/*
 * «Герои» первого экрана: предмет ниши, который живёт рядом с заголовком (мяч отскакивает, зерно
 * падает в чашку, молот бьёт с искрами…). Рисунок не зависит от названия бренда — только от ниши.
 * Цвета — переменные сайта: --na-a акцент, --na-f текст, --na-b фон; у некоторых предметов свой
 * «настоящий» цвет (теннисный мяч, яблоко). Части с классами анимирует NicheActor (anime.js):
 *   na-body — весь предмет · na-shadow — тень · na-draw — линии, которые рисуются · na-fill — заливка
 *   после рисования · na-spark — искры/блёстки · na-arm — качающаяся часть · na-wheel — колёса ·
 *   na-steam — пар · na-bubble — пузырьки · na-petal — лепестки · na-stack — то, что падает стопкой ·
 *   na-step — следы · na-spin — вращается · na-flash — вспышка.
 */

export type Choreo = 'bounce' | 'drop' | 'flutter' | 'draw' | 'strike' | 'drive' | 'swing' | 'bloom' | 'rise' | 'spin' | 'pulse' | 'stack' | 'pop' | 'steam' | 'snip' | 'steps' | 'flash'

export type Actor = { choreo: Choreo; svg: string }

const A = 'var(--na-a)'
const F = 'var(--na-f)'
const B = 'var(--na-b)'
const shadow = (w = 34, y = 112) => `<ellipse class="na-shadow" cx="60" cy="${y}" rx="${w}" ry="5" fill="${F}" opacity=".14"/>`
const sparks = (n: number, cx: number, cy: number, color = A, r = 2.6) =>
  Array.from({ length: n }, (_, i) => `<circle class="na-spark" cx="${cx}" cy="${cy}" r="${r - (i % 3) * 0.6}" fill="${i % 4 === 3 ? '#fff6d8' : color}" opacity="0"/>`).join('')
const twinkles = (pts: [number, number][]) =>
  pts.map(([x, y]) => `<path class="na-spark" d="M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6}Z" fill="${A}" opacity="0"/>`).join('')
const steam = (xs: number[], top = 18, bottom = 44) =>
  xs.map((x) => `<path class="na-steam" d="M${x} ${bottom} C${x - 7} ${bottom - 8} ${x + 7} ${bottom - 16} ${x} ${(bottom + top) / 2} S${x - 6} ${top + 6} ${x + 1} ${top}" fill="none" stroke="${F}" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>`).join('')
const bubbles = (pts: [number, number, number][], color = '#fff') => pts.map(([x, y, r]) => `<circle class="na-bubble" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="1.6" opacity="0"/>`).join('')

export const ACTORS: Record<string, Actor> = {
  // --- спорт ---
  ball: {
    choreo: 'bounce',
    svg: `${shadow(22)}<g class="na-body"><circle cx="60" cy="86" r="24" fill="#d7ef3f"/><path d="M38 76c10 6 10 20 0 26M82 76c-10 6-10 20 0 26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" transform="rotate(-25 60 86)"/><circle cx="52" cy="78" r="6" fill="#fff" opacity=".25"/></g>`,
  },
  glove: {
    choreo: 'drop',
    svg: `${shadow(26)}<g class="na-body"><path d="M38 52c0-14 10-22 26-22 18 0 26 10 26 26v18c0 14-10 24-26 24H50c-8 0-12-6-12-12V80c-6 0-10-4-10-10s4-10 10-10z" fill="${A}"/><path d="M50 84h36v14H50z" fill="${F}" opacity=".85"/><path d="M60 46c8-2 16 0 20 6" fill="none" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/></g>`,
  },
  dumbbell: {
    choreo: 'drop',
    svg: `${shadow(40)}<g class="na-body"><rect x="30" y="82" width="60" height="8" rx="4" fill="${F}"/><rect x="18" y="68" width="14" height="36" rx="4" fill="${A}"/><rect x="88" y="68" width="14" height="36" rx="4" fill="${A}"/><rect x="10" y="74" width="10" height="24" rx="3" fill="${A}"/><rect x="100" y="74" width="10" height="24" rx="3" fill="${A}"/></g>`,
  },
  wave: {
    choreo: 'steps',
    svg: `<g class="na-body"><circle cx="60" cy="40" r="10" fill="${A}"/><path class="na-step" d="M10 76c12-10 22-10 34 0s22 10 34 0 22-10 34 0" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round"/><path class="na-step" d="M10 92c12-10 22-10 34 0s22 10 34 0 22-10 34 0" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round" opacity=".6"/><path class="na-step" d="M10 108c12-10 22-10 34 0s22 10 34 0 22-10 34 0" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round" opacity=".35"/></g>`,
  },
  gamepad: {
    choreo: 'pop',
    svg: `${shadow(40)}<g class="na-body"><path d="M30 60h60c14 0 22 12 22 26 0 12-6 20-14 20-6 0-10-4-14-10H36c-4 6-8 10-14 10-8 0-14-8-14-20 0-14 8-26 22-26z" fill="${F}"/><path d="M34 76v14M27 83h14" stroke="${A}" stroke-width="4" stroke-linecap="round"/><circle cx="84" cy="78" r="4" fill="${A}"/><circle cx="94" cy="88" r="4" fill="${A}" opacity=".7"/></g>${twinkles([[18, 40], [104, 36], [62, 30]])}`,
  },
  // --- кофе, чай, еда ---
  cup: {
    choreo: 'steam',
    svg: `${shadow(30)}<g class="na-body"><path class="na-draw" d="M30 56h52v24c0 16-12 28-26 28s-26-12-26-28z" fill="none" stroke="${F}" stroke-width="3.5" stroke-linejoin="round"/><path class="na-fill" d="M33 59h46v21c0 14-10 25-23 25S33 94 33 80z" fill="${A}" opacity="0"/><path class="na-draw" d="M82 64c12 0 14 18 0 18" fill="none" stroke="${F}" stroke-width="3.5" stroke-linecap="round"/>${steam([46, 58, 70], 14, 48)}</g>`,
  },
  bean: {
    choreo: 'drop',
    svg: `${shadow(22)}<g class="na-body"><ellipse cx="60" cy="84" rx="20" ry="26" fill="${A}" transform="rotate(-24 60 84)"/><path d="M50 62c12 10 4 32 18 44" fill="none" stroke="${B}" stroke-width="3.5" stroke-linecap="round" transform="rotate(-24 60 84)" opacity=".75"/></g>${steam([40, 82], 18, 50)}`,
  },
  drip: {
    choreo: 'rise',
    svg: `${shadow(30)}<g class="na-body"><path d="M34 34h52L66 64H54z" fill="${F}"/><rect x="44" y="70" width="32" height="34" rx="6" fill="none" stroke="${F}" stroke-width="3.5"/><rect class="na-fill" x="47" y="86" width="26" height="15" rx="4" fill="${A}"/></g>${[60, 60, 60].map((x, i) => `<circle class="na-bubble" cx="${x}" cy="${66 + i}" r="2.8" fill="${A}" opacity="0"/>`).join('')}`,
  },
  bottle: {
    choreo: 'rise',
    svg: `${shadow(18)}<g class="na-body"><path d="M52 20h16v14c8 4 12 12 12 22v44c0 6-4 10-10 10H50c-6 0-10-4-10-10V56c0-10 4-18 12-22z" fill="${F}"/><rect x="40" y="58" width="40" height="30" fill="${A}"/><path d="M52 66h16M52 74h10" stroke="${B}" stroke-width="3" stroke-linecap="round"/></g>${bubbles([[60, 50, 3], [54, 44, 2], [66, 40, 2.4], [58, 34, 1.8]])}`,
  },
  leaf: {
    choreo: 'flutter',
    svg: `${shadow(26)}<g class="na-body"><path d="M24 92C30 52 62 30 100 30c-2 38-26 70-66 66z" fill="${A}"/><path class="na-draw" d="M28 92C46 74 64 58 92 38" fill="none" stroke="${B}" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>`,
  },
  teapot: {
    choreo: 'steam',
    svg: `${shadow(36)}<g class="na-body"><path class="na-draw" d="M34 62h52v20c0 14-11 24-26 24S34 96 34 82z" fill="none" stroke="${F}" stroke-width="3.5"/><path class="na-fill" d="M37 65h46v17c0 12-10 21-23 21S37 94 37 82z" fill="${A}" opacity="0"/><path class="na-draw" d="M34 70c-10 0-14 6-20 2M86 66c8-2 12 6 10 14" fill="none" stroke="${F}" stroke-width="3.5" stroke-linecap="round"/><path d="M50 62c0-8 20-8 20 0" fill="${F}"/><circle cx="60" cy="52" r="3" fill="${F}"/>${steam([52, 68], 18, 44)}</g>`,
  },
  cake: {
    choreo: 'pop',
    svg: `${shadow(38)}<g class="na-body"><rect x="24" y="70" width="72" height="34" rx="6" fill="${F}"/><path d="M24 78c8 8 14-4 24 4s14-4 24 4 14-4 24 4v-12H24z" fill="${A}"/><rect x="30" y="54" width="60" height="18" rx="5" fill="${A}" opacity=".85"/><rect x="58" y="36" width="5" height="18" rx="2" fill="${F}"/><path class="na-arm" d="M60.5 22c-5 6-5 10 0 14 5-4 5-8 0-14z" fill="#ffb43a"/></g>${twinkles([[24, 40], [98, 44], [84, 24]])}`,
  },
  bowl: {
    choreo: 'steam',
    svg: `${shadow(40)}<g class="na-body"><path class="na-draw" d="M20 66h80c0 22-18 38-40 38S20 88 20 66z" fill="none" stroke="${F}" stroke-width="3.5"/><path class="na-fill" d="M24 69h72c-2 18-17 32-36 32S26 87 24 69z" fill="${A}" opacity="0"/><path d="M70 30 98 58M78 26 104 54" stroke="${F}" stroke-width="3" stroke-linecap="round"/>${steam([40, 54], 22, 58)}</g>`,
  },
  pizza: {
    choreo: 'spin',
    svg: `${shadow(40)}<g class="na-body"><g class="na-spin" style="transform-origin:60px 70px"><circle cx="60" cy="70" r="38" fill="#e9b45a"/><circle cx="60" cy="70" r="31" fill="${A}"/><circle cx="46" cy="60" r="5" fill="#fff4dc"/><circle cx="70" cy="56" r="4" fill="#fff4dc"/><circle cx="66" cy="82" r="5" fill="#fff4dc"/><circle cx="48" cy="82" r="3.5" fill="${F}" opacity=".6"/><path d="M60 70V32M60 70l33 19M60 70 27 89" stroke="#e9b45a" stroke-width="2.4"/></g></g>`,
  },
  flame: {
    choreo: 'rise',
    svg: `<g class="na-body"><path class="na-arm" d="M60 18c18 22 30 36 30 56 0 18-13 32-30 32S30 92 30 74c0-12 6-20 12-26 0 10 4 16 10 18-2-18 2-32 8-48z" fill="${A}"/><path d="M60 62c8 10 12 16 12 24 0 8-5 14-12 14s-12-6-12-14c0-8 6-14 12-24z" fill="#ffd27a"/></g>${sparks(8, 60, 30, '#ffb04a', 2.2)}`,
  },
  apple: {
    choreo: 'bounce',
    svg: `${shadow(24)}<g class="na-body"><path d="M60 62c-14-10-34-2-34 18 0 16 12 30 22 30 6 0 8-3 12-3s6 3 12 3c10 0 22-14 22-30 0-20-20-28-34-18z" fill="#e2483d"/><path d="M60 62c0-8 2-14 8-18" stroke="${F}" stroke-width="3" stroke-linecap="round"/><path d="M64 50c6-10 16-10 20-6-6 6-12 8-20 6z" fill="#5fa34a"/><ellipse cx="46" cy="76" rx="5" ry="8" fill="#fff" opacity=".25"/></g>`,
  },
  can: {
    choreo: 'rise',
    svg: `${shadow(20)}<g class="na-body"><rect x="42" y="30" width="36" height="76" rx="6" fill="${A}"/><rect x="42" y="30" width="36" height="8" rx="3" fill="${F}" opacity=".7"/><path d="M50 58l10-12 4 10 8-6-6 22-4-10-10 6z" fill="${B}"/></g>${bubbles([[54, 22, 3], [66, 16, 2.4], [58, 8, 2]], 'currentColor')}`,
  },
  // --- мебель и дом ---
  chair: {
    choreo: 'draw',
    svg: `${shadow(30)}<g class="na-body"><path class="na-draw" d="M40 24h40v44M40 24v44M36 68h48M40 68l-6 42M80 68l6 42M48 80v30M72 80v30" fill="none" stroke="${F}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect class="na-fill" x="38" y="60" width="44" height="10" rx="3" fill="${A}" opacity="0"/><rect class="na-fill" x="44" y="28" width="32" height="26" rx="4" fill="${A}" opacity="0"/></g>`,
  },
  sofa: {
    choreo: 'draw',
    svg: `${shadow(44)}<g class="na-body"><path class="na-draw" d="M22 72V56c0-8 6-12 12-12h52c6 0 12 4 12 12v16M14 72c0-6 4-10 8-10s8 4 8 10v20h60V72c0-6 4-10 8-10s8 4 8 10v26H14zM24 98v10M96 98v10" fill="none" stroke="${F}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/><rect class="na-fill" x="31" y="66" width="58" height="22" rx="5" fill="${A}" opacity="0"/></g>`,
  },
  lamp: {
    choreo: 'swing',
    svg: `<g class="na-body"><g class="na-arm" style="transform-origin:60px 0px"><path d="M60 0v44" stroke="${F}" stroke-width="2.4"/><path d="M36 64c0-14 10-22 24-22s24 8 24 22z" fill="${A}"/><path class="na-flash" d="M38 66 22 112h76L82 66z" fill="${A}" opacity="0"/><circle cx="60" cy="68" r="6" fill="#fff4cf"/></g></g>`,
  },
  lounger: {
    choreo: 'draw',
    svg: `${shadow(42)}<g class="na-body"><path class="na-draw" d="M20 92h56l26-36M28 92l-6 18M70 92l6 18M96 64l8 46" fill="none" stroke="${F}" stroke-width="3.5" stroke-linecap="round"/><path class="na-fill" d="M22 86h52l24-32 6 6-26 32H22z" fill="${A}" opacity="0"/><circle cx="26" cy="34" r="10" fill="${A}" opacity=".9"/></g>`,
  },
  blocks: {
    choreo: 'stack',
    svg: `${shadow(40)}<g class="na-body"><rect class="na-stack" x="22" y="84" width="34" height="26" rx="4" fill="${A}"/><rect class="na-stack" x="62" y="84" width="34" height="26" rx="4" fill="${F}"/><rect class="na-stack" x="42" y="56" width="34" height="26" rx="4" fill="${A}" opacity=".75"/><path class="na-stack" d="M59 26l17 28H42z" fill="${F}" opacity=".85"/></g>`,
  },
  wardrobe: {
    choreo: 'draw',
    svg: `${shadow(32)}<g class="na-body"><path class="na-draw" d="M30 18h60v92H30zM60 18v92M52 58v10M68 58v10M34 110v4M86 110v4" fill="none" stroke="${F}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect class="na-fill" x="33" y="21" width="24" height="86" fill="${A}" opacity="0"/></g>`,
  },
  // --- металл ---
  hammer: {
    choreo: 'strike',
    svg: `${shadow(40)}<g class="na-body"><path d="M24 96h70l-8 12H32z" fill="${F}"/><rect x="34" y="88" width="50" height="8" rx="2" fill="${F}" opacity=".8"/><rect x="50" y="80" width="22" height="8" rx="2" fill="${A}"/><g class="na-arm" style="transform-origin:104px 82px"><rect x="54" y="74" width="52" height="6" rx="3" fill="${F}" transform="rotate(-8 104 82)"/><rect x="44" y="60" width="18" height="26" rx="3" fill="${F}" transform="rotate(-8 104 82)"/></g></g>${sparks(12, 60, 80, '#ffb03a')}`,
  },
  grill: {
    choreo: 'rise',
    svg: `${shadow(42)}<g class="na-body"><path d="M18 64h84l-8 24H26z" fill="${F}"/><path d="M28 88l-6 22M92 88l6 22" stroke="${F}" stroke-width="4" stroke-linecap="round"/><path class="na-arm" d="M40 62c0-10 8-14 8-24 6 6 8 14 6 24zM58 62c0-12 10-18 8-30 8 8 10 20 6 30zM76 62c0-8 6-12 6-20 5 6 6 12 4 20z" fill="${A}"/><path d="M14 62h92" stroke="${F}" stroke-width="3" stroke-linecap="round"/></g>${sparks(8, 60, 40, '#ffb03a', 2)}`,
  },
  scroll: {
    choreo: 'draw',
    svg: `<g class="na-body"><path class="na-draw" d="M60 112V40c0-14-12-22-22-16s-8 22 4 22 10-14 2-14M60 40c0-14 12-22 22-16s8 22-4 22-10-14-2-14M60 70c-10 0-22 8-22 20s14 14 18 6-4-14-10-8M60 70c10 0 22 8 22 20s-14 14-18 6 4-14 10-8" fill="none" stroke="${A}" stroke-width="4" stroke-linecap="round"/></g>${twinkles([[60, 14]])}`,
  },
  weld: {
    choreo: 'pulse',
    svg: `<g class="na-body"><path d="M14 98h92" stroke="${F}" stroke-width="5" stroke-linecap="round" opacity=".35"/><path class="na-draw" d="M14 98h92" stroke="${A}" stroke-width="5" stroke-linecap="round"/><g class="na-arm"><path d="M74 30 96 8M70 46l10-14" stroke="${F}" stroke-width="7" stroke-linecap="round"/></g><circle cx="66" cy="96" r="6" fill="#fff6d0"/></g>${sparks(12, 66, 92, '#ffcf4a', 2.2)}`,
  },
  beams: {
    choreo: 'stack',
    svg: `${shadow(44)}<g class="na-body"><rect class="na-stack" x="16" y="96" width="88" height="12" rx="2" fill="${F}"/><rect class="na-stack" x="22" y="82" width="78" height="12" rx="2" fill="${A}"/><rect class="na-stack" x="14" y="68" width="84" height="12" rx="2" fill="${F}" opacity=".8"/><rect class="na-stack" x="26" y="54" width="70" height="12" rx="2" fill="${A}" opacity=".8"/></g>`,
  },
  laser: {
    choreo: 'pulse',
    svg: `<g class="na-body"><rect x="44" y="6" width="32" height="22" rx="3" fill="${F}"/><path d="M60 28v42" stroke="${A}" stroke-width="2"/><path d="M16 96c14-24 30-24 44-26s30 2 44 26" fill="none" stroke="${F}" stroke-width="4" opacity=".25" stroke-linecap="round"/><path class="na-draw" d="M16 96c14-24 30-24 44-26s30 2 44 26" fill="none" stroke="${A}" stroke-width="4" stroke-linecap="round"/></g>${sparks(8, 60, 70, '#ffcf4a', 2)}`,
  },
  sun: {
    choreo: 'spin',
    svg: `<g class="na-body"><g class="na-spin" style="transform-origin:60px 60px">${Array.from({ length: 12 }, (_, i) => `<rect x="58" y="6" width="4" height="16" rx="2" fill="${A}" transform="rotate(${i * 30} 60 60)"/>`).join('')}</g><circle cx="60" cy="60" r="24" fill="${A}"/><path d="M40 98h40l6 14H34z" fill="${F}" opacity=".85"/><path d="M48 98l-2 14M60 98v14M72 98l2 14" stroke="${B}" stroke-width="1.6"/></g>`,
  },
  wrench: {
    choreo: 'spin',
    svg: `${shadow(26)}<g class="na-body"><g class="na-spin" style="transform-origin:60px 64px"><path d="M78 30a18 18 0 0 0-22 24L28 82a8 8 0 0 0 11 11l28-28a18 18 0 0 0 24-22l-11 11-9-3-3-9z" fill="${A}"/></g></g>`,
  },
  // --- красота, здоровье ---
  flower: {
    choreo: 'bloom',
    svg: `<g class="na-body" style="transform-origin:60px 60px">${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45} 60 60)"><ellipse class="na-petal" cx="60" cy="34" rx="10" ry="22" fill="${A}" fill-opacity="${i % 2 ? 0.7 : 0.95}" style="transform-origin:60px 60px"/></g>`).join('')}<circle cx="60" cy="60" r="10" fill="${F}"/></g>`,
  },
  drop: {
    choreo: 'drop',
    svg: `<ellipse class="na-shadow" cx="60" cy="108" rx="30" ry="6" fill="none" stroke="${A}" stroke-width="2" opacity=".5"/><g class="na-body"><path d="M60 22C72 42 84 56 84 74a24 24 0 0 1-48 0c0-18 12-32 24-52z" fill="${A}"/><path d="M48 70c0 10 6 16 12 18" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55"/></g>`,
  },
  tooth: {
    choreo: 'pop',
    svg: `${shadow(22)}<g class="na-body"><path d="M40 30c8-6 14 0 20 0s12-6 20 0c10 8 6 26 2 36-3 8-4 28-10 30-6 2-6-18-12-18s-6 20-12 18c-6-2-7-22-10-30-4-10-8-28 2-36z" fill="#fff" stroke="${F}" stroke-width="3"/></g>${twinkles([[92, 30], [26, 46], [86, 70]])}`,
  },
  ecg: {
    choreo: 'pulse',
    svg: `<g class="na-body"><path d="M8 66h30l8-22 12 46 10-36 6 12h38" fill="none" stroke="${F}" stroke-width="3" opacity=".18" stroke-linejoin="round"/><path class="na-draw" d="M8 66h30l8-22 12 46 10-36 6 12h38" fill="none" stroke="${A}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M60 22c-6-8-18-4-18 6 0 10 18 18 18 18s18-8 18-18c0-10-12-14-18-6z" fill="${A}"/></g>`,
  },
  lotus: {
    choreo: 'bloom',
    svg: `<g class="na-body" style="transform-origin:60px 90px">${[-60, -30, 0, 30, 60].map((r) => `<g transform="rotate(${r} 60 92)"><path class="na-petal" d="M60 92c-12-14-12-38 0-54 12 16 12 40 0 54z" fill="${A}" fill-opacity="${r === 0 ? 1 : 0.7}" style="transform-origin:60px 92px"/></g>`).join('')}<path d="M24 100c24 8 48 8 72 0" fill="none" stroke="${F}" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>`,
  },
  scissors: {
    choreo: 'snip',
    svg: `<g class="na-body"><g class="na-arm" style="transform-origin:60px 58px"><path d="M60 58 104 30" stroke="${F}" stroke-width="5" stroke-linecap="round"/><circle cx="36" cy="82" r="12" fill="none" stroke="${A}" stroke-width="5"/><path d="M60 58 44 74" stroke="${A}" stroke-width="5"/></g><g class="na-arm" style="transform-origin:60px 58px" data-dir="-1"><path d="M60 58 104 86" stroke="${F}" stroke-width="5" stroke-linecap="round"/><circle cx="36" cy="34" r="12" fill="none" stroke="${A}" stroke-width="5"/><path d="M60 58 44 42" stroke="${A}" stroke-width="5"/></g></g>`,
  },
  needle: {
    choreo: 'draw',
    svg: `<g class="na-body"><path class="na-draw" d="M100 18C70 30 92 60 60 66S30 96 14 104" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round"/><path d="M98 14 112 4" stroke="${F}" stroke-width="4" stroke-linecap="round"/><ellipse cx="108" cy="7" rx="2" ry="1" fill="${B}" transform="rotate(-35 108 7)"/></g>`,
  },
  inkpen: {
    choreo: 'draw',
    svg: `<g class="na-body"><path class="na-draw" d="M14 96c18-30 34 10 48-18s26-40 44-24" fill="none" stroke="${A}" stroke-width="4" stroke-linecap="round"/><g class="na-arm"><path d="M96 20l14 14-40 40-18 4 4-18z" fill="${F}"/></g></g>`,
  },
  // --- услуги, город ---
  scales: {
    choreo: 'swing',
    svg: `${shadow(30)}<g class="na-body"><path d="M60 22v84M40 108h40" stroke="${F}" stroke-width="4" stroke-linecap="round"/><g class="na-arm" style="transform-origin:60px 30px"><path d="M22 30h76" stroke="${F}" stroke-width="4" stroke-linecap="round"/><path d="M22 30 12 58h20zM98 30 88 58h20z" fill="none" stroke="${F}" stroke-width="2"/><path d="M10 58c2 8 22 8 24 0zM86 58c2 8 22 8 24 0z" fill="${A}"/></g><circle cx="60" cy="22" r="5" fill="${A}"/></g>`,
  },
  coins: {
    choreo: 'stack',
    svg: `${shadow(30)}<g class="na-body">${[0, 1, 2, 3, 4].map((i) => `<g class="na-stack"><ellipse cx="60" cy="${100 - i * 11}" rx="26" ry="8" fill="${i % 2 ? F : A}"/><ellipse cx="60" cy="${96 - i * 11}" rx="26" ry="8" fill="${A}" opacity="${i % 2 ? 0.8 : 1}"/></g>`).join('')}</g>${twinkles([[96, 36]])}`,
  },
  shield: {
    choreo: 'draw',
    svg: `${shadow(26)}<g class="na-body"><path class="na-draw" d="M60 14 94 26v32c0 24-16 40-34 50C42 98 26 82 26 58V26z" fill="none" stroke="${F}" stroke-width="3.5" stroke-linejoin="round"/><path class="na-fill" d="M60 20 88 30v28c0 20-13 34-28 42C45 92 32 78 32 58V30z" fill="${A}" opacity="0"/><path class="na-draw" d="M46 60l10 10 18-22" fill="none" stroke="${B}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  },
  house: {
    choreo: 'draw',
    svg: `${shadow(40)}<g class="na-body"><path class="na-draw" d="M18 60 60 24l42 36M28 52v56h64V52M50 108V80h20v28" fill="none" stroke="${F}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect class="na-flash" x="34" y="62" width="14" height="12" fill="${A}" opacity="0"/><rect class="na-flash" x="72" y="62" width="14" height="12" fill="${A}" opacity="0"/></g>`,
  },
  tower: {
    choreo: 'stack',
    svg: `${shadow(30)}<g class="na-body">${[0, 1, 2, 3, 4].map((i) => `<g class="na-stack"><rect x="36" y="${92 - i * 16}" width="48" height="16" fill="${i % 2 ? F : A}" opacity="${i % 2 ? 0.85 : 1}"/><rect x="42" y="${96 - i * 16}" width="8" height="6" fill="${B}" opacity=".8"/><rect x="56" y="${96 - i * 16}" width="8" height="6" fill="${B}" opacity=".8"/><rect x="70" y="${96 - i * 16}" width="8" height="6" fill="${B}" opacity=".8"/></g>`).join('')}</g>`,
  },
  key: {
    choreo: 'swing',
    svg: `<g class="na-body"><g class="na-arm" style="transform-origin:60px 4px"><path d="M60 4v20" stroke="${F}" stroke-width="2"/><circle cx="60" cy="40" r="16" fill="none" stroke="${A}" stroke-width="6"/><path d="M60 56v50M60 84h12M60 98h10" stroke="${A}" stroke-width="6" stroke-linecap="round"/></g></g>`,
  },
  rings: {
    choreo: 'pop',
    svg: `<g class="na-body"><circle cx="48" cy="68" r="22" fill="none" stroke="${A}" stroke-width="6"/><circle cx="72" cy="68" r="22" fill="none" stroke="${F}" stroke-width="6" opacity=".85"/><path d="M48 46l-6-8h12z" fill="#dff4ff"/></g>${twinkles([[24, 30], [98, 36], [60, 22]])}`,
  },
  diamond: {
    choreo: 'pop',
    svg: `${shadow(26)}<g class="na-body"><path d="M32 46 44 28h32l12 18-28 52z" fill="${A}"/><path d="M32 46h56M44 28l16 70M76 28 60 98M44 28l8 18 8-18 8 18 8-18" fill="none" stroke="${B}" stroke-width="2" opacity=".6"/></g>${twinkles([[92, 24], [24, 30], [96, 72]])}`,
  },
  mountain: {
    choreo: 'draw',
    svg: `<g class="na-body"><circle class="na-fill" cx="78" cy="40" r="12" fill="${A}" opacity="0"/><path class="na-draw" d="M8 104 42 46l18 26 14-18 38 50z" fill="none" stroke="${F}" stroke-width="3.5" stroke-linejoin="round"/><path class="na-draw" d="M36 56l6-10 8 12" fill="none" stroke="${A}" stroke-width="3" stroke-linejoin="round"/></g>`,
  },
  plane: {
    choreo: 'flutter',
    svg: `<g class="na-body"><path d="M14 64 104 28 78 100 60 74z" fill="${A}"/><path d="M60 74 104 28 46 70z" fill="${F}" opacity=".35"/></g>`,
  },
  truck: {
    choreo: 'drive',
    svg: `${shadow(48)}<g class="na-body"><rect x="8" y="46" width="64" height="44" rx="3" fill="${A}"/><path d="M72 58h20l14 16v16H72z" fill="${F}"/><rect x="82" y="62" width="12" height="10" fill="${B}" opacity=".8"/>${[28, 88].map((x) => `<g class="na-wheel" style="transform-origin:${x}px 96px"><circle cx="${x}" cy="96" r="11" fill="${F}"/><circle cx="${x}" cy="96" r="4" fill="${B}"/><path d="M${x} 87v18" stroke="${B}" stroke-width="2"/></g>`).join('')}</g>`,
  },
  car: {
    choreo: 'drive',
    svg: `${shadow(48)}<g class="na-body"><path d="M12 84v-12c0-6 4-10 10-10h10l14-16h32l16 16h10c6 0 8 4 8 10v12z" fill="${A}"/><path d="M50 50h12v12H40zM68 50h8l12 12H68z" fill="${B}" opacity=".7"/>${[34, 88].map((x) => `<g class="na-wheel" style="transform-origin:${x}px 86px"><circle cx="${x}" cy="86" r="11" fill="${F}"/><circle cx="${x}" cy="86" r="4" fill="${B}"/><path d="M${x} 77v18" stroke="${B}" stroke-width="2"/></g>`).join('')}</g>`,
  },
  camera: {
    choreo: 'flash',
    svg: `${shadow(38)}<g class="na-body"><rect x="18" y="40" width="84" height="60" rx="10" fill="${F}"/><path d="M44 40l6-12h20l6 12z" fill="${F}"/><circle cx="60" cy="70" r="18" fill="${B}"/><circle cx="60" cy="70" r="11" fill="${A}"/><circle cx="90" cy="52" r="4" fill="${A}"/></g><circle class="na-flash" cx="60" cy="70" r="56" fill="#fff" opacity="0"/>`,
  },
  film: {
    choreo: 'spin',
    svg: `<g class="na-body"><g class="na-spin" style="transform-origin:60px 60px"><circle cx="60" cy="60" r="44" fill="${F}"/>${[0, 72, 144, 216, 288].map((r) => `<circle cx="60" cy="32" r="9" fill="${B}" transform="rotate(${r} 60 60)"/>`).join('')}<circle cx="60" cy="60" r="6" fill="${A}"/></g></g>`,
  },
  vinyl: {
    choreo: 'spin',
    svg: `<g class="na-body"><g class="na-spin" style="transform-origin:60px 64px"><circle cx="60" cy="64" r="44" fill="${F}"/><circle cx="60" cy="64" r="34" fill="none" stroke="${B}" stroke-width="1" opacity=".3"/><circle cx="60" cy="64" r="26" fill="none" stroke="${B}" stroke-width="1" opacity=".3"/><circle cx="60" cy="64" r="14" fill="${A}"/><circle cx="60" cy="64" r="3" fill="${B}"/></g><path class="na-bubble" d="M98 30v-16l10-3v14" fill="none" stroke="${A}" stroke-width="3"/><circle class="na-bubble" cx="95" cy="30" r="4" fill="${A}"/></g>`,
  },
  eq: {
    choreo: 'rise',
    svg: `<g class="na-body">${[0, 1, 2, 3, 4, 5].map((i) => `<rect class="na-bar" x="${14 + i * 16}" y="40" width="10" height="70" rx="3" fill="${i % 2 ? F : A}" style="transform-origin:${19 + i * 16}px 110px"/>`).join('')}</g>`,
  },
  book: {
    choreo: 'draw',
    svg: `${shadow(42)}<g class="na-body"><path class="na-draw" d="M60 40C48 32 30 30 16 34v66c14-4 32-2 44 6M60 40c12-8 30-10 44-6v66c-14-4-32-2-44 6M60 40v66" fill="none" stroke="${F}" stroke-width="3.5" stroke-linejoin="round"/><path class="na-fill" d="M60 42c12-7 28-9 41-5v60c-13-3-29-1-41 5z" fill="${A}" opacity="0"/></g>`,
  },
  code: {
    choreo: 'draw',
    svg: `<g class="na-body"><path class="na-draw" d="M38 34 14 60l24 26M82 34l24 26-24 26M68 24 52 96" fill="none" stroke="${A}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  },
  chat: {
    choreo: 'stack',
    svg: `<g class="na-body"><path class="na-stack" d="M14 22h56c6 0 10 4 10 10v20c0 6-4 10-10 10H34l-14 12V62h-6c-6 0-10-4-10-10V32c0-6 4-10 10-10z" fill="${A}"/><path class="na-stack" d="M54 66h46c6 0 10 4 10 10v16c0 6-4 10-10 10h-2v10l-12-10H54c-6 0-10-4-10-10V76c0-6 4-10 10-10z" fill="${F}"/></g>`,
  },
  laptop: {
    choreo: 'draw',
    svg: `${shadow(46)}<g class="na-body"><path class="na-draw" d="M26 34h68v52H26zM12 96h96l-8 8H20z" fill="none" stroke="${F}" stroke-width="3.5" stroke-linejoin="round"/><rect class="na-fill" x="30" y="38" width="60" height="44" fill="${A}" opacity="0"/><path class="na-draw" d="M40 52h24M40 62h36M40 72h16" stroke="${B}" stroke-width="3" stroke-linecap="round"/></g>`,
  },
  phone: {
    choreo: 'pop',
    svg: `${shadow(22)}<g class="na-body"><rect x="38" y="16" width="44" height="88" rx="9" fill="${F}"/><rect x="42" y="24" width="36" height="70" rx="4" fill="${A}"/><circle cx="60" cy="98" r="2.4" fill="${B}"/><circle cx="84" cy="22" r="7" fill="#ff4b4b"/></g>${twinkles([[24, 34], [100, 54]])}`,
  },
  glasses: {
    choreo: 'pop',
    svg: `<g class="na-body"><circle cx="38" cy="64" r="18" fill="${A}" opacity=".25" stroke="${F}" stroke-width="4"/><circle cx="82" cy="64" r="18" fill="${A}" opacity=".25" stroke="${F}" stroke-width="4"/><path d="M56 62c2-4 6-4 8 0M20 60 8 50M100 60l12-10" stroke="${F}" stroke-width="4" stroke-linecap="round" fill="none"/></g>${twinkles([[32, 56], [76, 56]])}`,
  },
  hanger: {
    choreo: 'swing',
    svg: `<g class="na-body"><g class="na-arm" style="transform-origin:60px 10px"><path d="M60 10c-8 0-8 12 0 12v10L14 62h92L60 32" fill="none" stroke="${F}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M22 62h76l-6 48H28z" fill="${A}"/><path d="M50 62l10 14 10-14" fill="${B}" opacity=".6"/></g></g>`,
  },
  sneaker: {
    choreo: 'bounce',
    svg: `${shadow(42)}<g class="na-body"><path d="M14 92V62c0-6 6-8 10-4 10 10 22 10 30 0l10-6c14 14 30 22 44 26 4 2 6 6 6 10v4z" fill="${A}"/><path d="M14 92h100v8c0 4-4 8-8 8H22c-4 0-8-4-8-8z" fill="${F}"/><path d="M58 60l8 6M66 56l8 6M74 52l8 6" stroke="${B}" stroke-width="3" stroke-linecap="round"/></g>`,
  },
  paw: {
    choreo: 'steps',
    svg: `<g class="na-body">${[
      [24, 96, -20],
      [52, 70, 10],
      [78, 46, -10],
      [100, 20, 20],
    ]
      .map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><g class="na-step"><ellipse cx="${x}" cy="${y + 4}" rx="8" ry="7" fill="${A}"/><circle cx="${x - 8}" cy="${y - 6}" r="3.4" fill="${A}"/><circle cx="${x - 2}" cy="${y - 10}" r="3.4" fill="${A}"/><circle cx="${x + 4}" cy="${y - 10}" r="3.4" fill="${A}"/><circle cx="${x + 10}" cy="${y - 6}" r="3.4" fill="${A}"/></g></g>`)
      .join('')}</g>`,
  },
  bubbles: {
    choreo: 'rise',
    svg: `<g class="na-body"><path d="M24 104c0-10 8-16 18-16h36c10 0 18 6 18 16z" fill="${A}"/><rect x="40" y="70" width="40" height="18" rx="4" fill="${F}"/></g>${bubbles([[40, 60, 9], [66, 48, 12], [88, 66, 7], [56, 24, 6], [84, 30, 5]], 'currentColor')}`,
  },
  brush: {
    choreo: 'draw',
    svg: `<g class="na-body"><rect class="na-fill" x="14" y="20" width="92" height="78" fill="none" stroke="${F}" stroke-width="3" opacity="0"/><path class="na-draw" d="M24 80c14-30 24-38 34-26s20 8 26-6 14-14 18-10" fill="none" stroke="${A}" stroke-width="8" stroke-linecap="round"/></g>`,
  },
  star: {
    choreo: 'draw',
    svg: `<g class="na-body"><path class="na-draw" d="M60 12l14 30 32 4-24 22 6 32-28-16-28 16 6-32-24-22 32-4z" fill="none" stroke="${A}" stroke-width="4" stroke-linejoin="round"/><path class="na-fill" d="M60 22l11 24 26 3-19 18 5 26-23-13-23 13 5-26-19-18 26-3z" fill="${A}" opacity="0"/></g>`,
  },
  orb: {
    choreo: 'bounce',
    svg: `${shadow(22)}<g class="na-body"><circle cx="60" cy="86" r="22" fill="${A}"/><circle cx="52" cy="78" r="7" fill="#fff" opacity=".3"/></g>`,
  },
}

/** Предмет каждого сайта: по нише, не по названию. Неизвестный сайт — по типу бизнеса. */
const BY_SLUG: Record<string, string> = {
  padel: 'ball', jang: 'glove', pulse: 'dumbbell', suv: 'wave', respawn: 'gamepad',
  arabica: 'cup', bodrost: 'bean', brewlab: 'drip', coldbrew: 'bottle', crema: 'cup', dripbar: 'drip', grain: 'bean', kitobkofe: 'book',
  kofego: 'cup', kofemania: 'cup', kofeofis: 'laptop', matcha: 'leaf', noir: 'bean', nurkofe: 'cup', origin: 'bean', plastinka: 'vinyl',
  qahvauy: 'teapot', reserve: 'drip', tong: 'cup', tunkofe: 'cup', karamel: 'cake', lumiere: 'cake', shirin: 'cake', choy: 'teapot',
  bahor: 'teapot', ramendo: 'bowl', forno: 'pizza', olov: 'flame', dala: 'apple', zing: 'can',
  atelye: 'chair', bogmebel: 'lounger', bolalar: 'blocks', daraxt: 'chair', dizayn: 'chair', duradgor: 'chair', elit: 'sofa', forma: 'chair',
  loftmebel: 'chair', mebeluy: 'wardrobe', modul: 'wardrobe', monomebel: 'chair', royalmebel: 'sofa', scandi: 'chair', smartmebel: 'wardrobe',
  sofa: 'sofa', uyut: 'sofa', velvet: 'sofa', yorug: 'lamp', obivka: 'needle',
  kuznitsa: 'hammer', kovkaart: 'scroll', ornament: 'scroll', panjara: 'scroll', vorota: 'scroll', zarhal: 'diamond', temirchi: 'hammer',
  temirsanat: 'hammer', sandon: 'grill', olovtemir: 'grill', qora: 'hammer', svarka: 'weld', uchqun: 'weld', karkas: 'weld',
  konstruktsiya: 'weld', metallform: 'weld', xrom: 'weld', darvoza: 'weld', prokat: 'beams', laser: 'laser', quyosh: 'sun', usta24: 'wrench',
  bloom: 'flower', gulskin: 'drop', teri: 'drop', smilelab: 'tooth', shifo: 'ecg', tayanch: 'ecg', nafas: 'lotus', ustara: 'scissors',
  siyoh: 'inkpen', tikuv: 'needle', murgav: 'paw', kozgu: 'glasses', oltin: 'diamond',
  adliya: 'scales', hisob: 'coins', sompay: 'coins', kafolat: 'shield', heights: 'tower', yangishahar: 'tower', uy: 'house', naqsh: 'house',
  saroy: 'key', chimgan: 'mountain', togtours: 'mountain', oqsaroy: 'rings', karvon: 'truck', yolrent: 'car', torque: 'car',
  kadr: 'camera', kino: 'film', sahna: 'star', nota: 'vinyl', basement: 'eq', arthouse: 'brush', nord: 'star', kvant: 'code',
  kodakademiya: 'code', polyglot: 'chat', bolajon: 'blocks', hub: 'laptop', gadget: 'phone', kitob: 'book', kiyim: 'hanger', krossovka: 'sneaker', toza: 'bubbles',
}

const BY_TYPE: Record<string, string> = {
  CafeOrCoffeeShop: 'cup', Bakery: 'cake', Restaurant: 'bowl', FurnitureStore: 'chair', HomeAndConstructionBusiness: 'hammer',
  BeautySalon: 'flower', HairSalon: 'scissors', Dentist: 'tooth', MedicalClinic: 'ecg', ExerciseGym: 'dumbbell', Hotel: 'key',
  RealEstateAgent: 'house', JewelryStore: 'diamond', ClothingStore: 'hanger', ShoeStore: 'sneaker', BookStore: 'book', AutoRental: 'car',
  AutoRepair: 'car', TravelAgency: 'plane', EducationalOrganization: 'book', LegalService: 'scales', AccountingService: 'coins',
}

export function actorFor(slug: string, type: string, override?: string): string {
  if (override && ACTORS[override]) return override
  return BY_SLUG[slug] ?? BY_TYPE[type] ?? 'orb'
}
