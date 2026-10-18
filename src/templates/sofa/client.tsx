'use client'

import { useState } from 'react'
import { Couch } from './couch'

export type Fabric = { name: string; color: string; note: string }

/**
 * Примерка обивки: нажатие на образец перекрашивает диван (переменная --sofa-fabric) и меняет
 * подпись. Без скрипта виден диван в первой ткани и все образцы — как в каталоге.
 */
export function Configurator({ fabrics, label }: { fabrics: Fabric[]; label: string }) {
  const [i, setI] = useState(0)
  const cur = fabrics[i]
  return (
    <div className="sofa-conf" style={{ ['--sofa-fabric' as string]: cur.color }}>
      <div className="sofa-conf__stage">
        <span className="sofa-conf__halo" aria-hidden="true" />
        <Couch kind="three" className="sofa-conf__couch" />
      </div>
      <div className="sofa-conf__bar" role="radiogroup" aria-label={label}>
        <p className="sofa-conf__name" aria-live="polite">
          <b>{cur.name}</b> · {cur.note}
        </p>
        <div className="sofa-conf__swatches">
          {fabrics.map((f, j) => (
            <button
              key={f.name}
              type="button"
              role="radio"
              aria-checked={i === j}
              aria-label={f.name}
              title={f.name}
              className={`sofa-swatch${i === j ? ' is-on' : ''}`}
              style={{ ['--sw' as string]: f.color }}
              onClick={() => setI(j)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
