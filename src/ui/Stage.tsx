import { useState } from 'react'
import type { ReactNode } from 'react'

import { VIEWS } from '@/catalog'
import type { ViewId } from '@/catalog/types'
import { useLang, useT } from '@/i18n/useT'
import { CarViewProvider } from '@/scene/CarViewContext'
import { useCarView } from '@/scene/useCarView'
import { resolve } from '@/state/constraints'
import { formatNumber } from '@/state/pricing'
import { useConfig } from '@/state/useStore'

import './Stage.css'

interface StageProps {
  /** The 3D scene. Renders beneath the overlay chrome below. */
  children?: ReactNode
}

export function Stage({ children }: StageProps) {
  // The view buttons and CarScene (arriving as children) both have to sit
  // under the provider, and a component can't consume a context it provides.
  return (
    <CarViewProvider>
      <StageContent>{children}</StageContent>
    </CarViewProvider>
  )
}

function StageContent({ children }: StageProps) {
  const config = useConfig()
  const t = useT()
  const { intl } = useLang()
  const { setView } = useCarView()
  // The camera opens beside the first preset, so that button starts lit.
  const [activeView, setActiveView] = useState<ViewId>(VIEWS[0].id)

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
        {VIEWS.map(({ id }) => (
          <button
            key={id}
            type="button"
            className={`view-btn${id === activeView ? ' is-active' : ''}`}
            onClick={() => {
              setView(id)
              setActiveView(id)
            }}
          >
            {t.views[id]}
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
