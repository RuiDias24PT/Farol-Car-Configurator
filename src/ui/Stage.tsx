import { useState } from 'react'
import type { ReactNode } from 'react'

import { useLang, useT } from '@/i18n/useT'
import { resolve } from '@/state/constraints'
import { formatNumber } from '@/state/pricing'
import { useConfig } from '@/state/useStore'

import { CarViewProvider } from '@/scene/CarViewContext'
import type { CarView } from '@/scene/useCarView'
import { useCarView } from '@/scene/useCarView'

import './Stage.css'

// M10 documents three camera presets (flank / front / rear) against the
// four keys the locale carries (front / side / rear / top) — 'flank' and
// 'side' are the same idea under different names. 'top' has no preset:
// M10 never defined one, so it stays disabled rather than guessing azimuth
// and elevation for a view nothing asked for.
const VIEWS = ['front', 'side', 'rear', 'top'] as const
const PRESET_VIEWS: readonly CarView[] = ['front', 'side', 'rear']

function isPresetView(view: (typeof VIEWS)[number]): view is CarView {
  return (PRESET_VIEWS as readonly string[]).includes(view)
}

interface StageProps {
  /** The 3D scene (M10). Renders beneath the overlay chrome below. */
  children?: ReactNode
}

export function Stage({ children }: StageProps) {
  // CarViewProvider has to be an ancestor of the buttons that call
  // setView() *and* of CarScene (arriving via children), which is exactly
  // why this outer component exists separately from StageContent below —
  // a component can't consume a context it provides itself.
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
  const [activeView, setActiveView] = useState<CarView | null>(null)

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
          <button
            key={view}
            type="button"
            className={`view-btn${view === activeView ? ' is-active' : ''}`}
            disabled={!isPresetView(view)}
            onClick={() => {
              if (!isPresetView(view)) return
              setView(view)
              setActiveView(view)
            }}
          >
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
