/* Комната для «до/после»: одна и та же сцена, в «до» — пыль, пятна, паутина и мутное окно,
   в «после» — чистое стекло и искры. Рисунок свой, без фото, поэтому сравнение читается сразу. */
export function Room({ dirty }: { dirty?: boolean }) {
  return (
    <svg className={`clean-room-svg${dirty ? ' is-dirty' : ''}`} viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <rect width="400" height="300" fill={dirty ? '#d9d2bf' : '#f4fbf9'} />
      <rect y="300" width="400" height="140" fill={dirty ? '#b9a98a' : '#e3d5bf'} />
      <path d="M0 300h400" stroke={dirty ? '#9b8a6a' : '#cdbda4'} strokeWidth="3" />
      {/* окно */}
      <rect x="230" y="50" width="130" height="150" rx="6" fill={dirty ? '#a9b4ad' : '#bfeaf3'} stroke={dirty ? '#8d8470' : '#fff'} strokeWidth="8" />
      <path d="M295 54v142M234 125h122" stroke={dirty ? '#8d8470' : '#fff'} strokeWidth="6" />
      {!dirty ? <path d="M248 70l30 30M260 64l40 40" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".7" /> : null}
      {/* картина */}
      <rect x="60" y="80" width="90" height="70" rx="4" fill={dirty ? '#a39778' : '#18c1a5'} opacity={dirty ? 0.8 : 0.9} />
      <circle cx="90" cy="108" r="12" fill={dirty ? '#c9bd9a' : '#ffd166'} />
      <path d="M60 150l35-30 25 20 30-25v35z" fill={dirty ? '#8a7f62' : '#0e9c86'} />
      {/* диван */}
      <rect x="40" y="230" width="190" height="70" rx="18" fill={dirty ? '#8e8a73' : '#0e2a28'} />
      <rect x="55" y="205" width="160" height="50" rx="16" fill={dirty ? '#9c977f' : '#174542'} />
      <rect x="62" y="300" width="10" height="16" fill="#3b3428" />
      <rect x="198" y="300" width="10" height="16" fill="#3b3428" />
      {/* растение */}
      <rect x="300" y="250" width="44" height="50" rx="6" fill={dirty ? '#9d8c6c' : '#f1f1f1'} />
      <path d="M322 250c-30-30-20-70 0-80 20 10 30 50 0 80Z" fill={dirty ? '#7d8a5a' : '#2fbf71'} />
      <path d="M322 250c-40-10-50-40-40-55 15 2 35 25 40 55ZM322 250c40-10 50-40 40-55-15 2-35 25-40 55Z" fill={dirty ? '#6f7c4e' : '#22a35f'} />
      {/* ковёр */}
      <ellipse cx="150" cy="370" rx="130" ry="36" fill={dirty ? '#a08e6d' : '#ffe1ea'} />
      {dirty ? (
        <g>
          {/* пыль и пятна */}
          <g fill="#6d5c3e" opacity=".5">
            <ellipse cx="110" cy="365" rx="26" ry="9" />
            <ellipse cx="210" cy="380" rx="16" ry="6" />
            <circle cx="320" cy="350" r="7" />
            <circle cx="60" cy="410" r="10" />
            <ellipse cx="270" cy="420" rx="22" ry="7" />
          </g>
          <g fill="#7a6a4c" opacity=".35">
            <circle cx="250" cy="100" r="18" />
            <circle cx="320" cy="160" r="22" />
            <circle cx="275" cy="175" r="10" />
          </g>
          {/* паутина в углу */}
          <g stroke="#6b6250" strokeWidth="1.2" fill="none" opacity=".7">
            <path d="M0 0l60 50M0 0l30 60M0 0l66 18" />
            <path d="M14 12q8 6 10 14M28 24q14 2 20 10M8 26q8 2 12 12" />
          </g>
          {/* крошки */}
          <g fill="#5b4b30">
            <circle cx="150" cy="330" r="2.5" />
            <circle cx="170" cy="340" r="2" />
            <circle cx="132" cy="345" r="2" />
            <circle cx="190" cy="326" r="1.8" />
          </g>
        </g>
      ) : (
        <g fill="#fff">
          <path d="M120 200l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
          <path d="M340 110l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
          <path d="M200 350l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" />
        </g>
      )}
    </svg>
  )
}
