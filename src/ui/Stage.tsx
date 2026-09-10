import type { ReactNode } from 'react'

import { useLang, useT } from '@/i18n/useT'
import { resolve } from '@/state/constraints'
import { formatNumber } from '@/state/pricing'
import { useConfig } from '@/state/useStore'

import './Stage.css'

// These are camera presets and belong in src/catalog/ with their azimuths — but
// M10 documents three (flank / front / rear) against the four keys the locale
// carries (front / side / rear / top). Reconciling that is M10's call, not
// something to invent here, so they stay local and inert for now.
const VIEWS = ['front', 'side', 'rear', 'top'] as const

interface StageProps {
  /** The 3D scene (M10). Renders beneath the overlay chrome below. */
  children?: ReactNode
}

export function Stage({ children }: StageProps) {
  const config = useConfig()
  const t = useT()
  const { intl } = useLang()

  const { body, powertrain, colour, wheels } = resolve(config)

  // Prototype quirk: consumption in kWh is shown without decimals.
  const consumptionDigits = powertrain.consumptionUnit === 'l' ? 1 : 0

  return (
    <section className="stage">
      <div className="stage-tag">
        <div className="t1">
          {t.bodies[body.id].name} {t.powertrains[powertrain.id].label}
        </div>
        <div className="t2">
          {t.colours[colour.id].label} · {t.wheels[wheels.id].label}
        </div>
      </div>

      <div className="views">
        {VIEWS.map((view) => (
          <button key={view} type="button" className="view-btn" disabled>
            {t.views[view]}
          </button>
        ))}
      </div>

      {children}

      <div className="stage-specs">
        <div>
          <b>
            {formatNumber(powertrain.hp, 0, intl)} {t.units.power}
          </b>
          <span>{t.specs.power}</span>
        </div>
        <div>
          <b>
            {formatNumber(powertrain.consumption, consumptionDigits, intl)}{' '}
            {powertrain.consumptionUnit}
          </b>
          <span>{t.powertrains[powertrain.id].rangeLabel}</span>
        </div>
        <div>
          <b>{wheels.sizeInches}&quot;</b>
          <span>{t.specs.wheels}</span>
        </div>
      </div>
    </section>
  )
}
