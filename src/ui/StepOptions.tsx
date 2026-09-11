import { BODIES, COLOURS, PACKAGES, POWERTRAINS, WHEELS } from '@/catalog'
import { formatBlocked } from '@/i18n'
import { useLang, useT } from '@/i18n/useT'
import { availability } from '@/state/constraints'
import { formatEUR, formatNumber } from '@/state/pricing'
import { useSteps } from '@/state/useSteps'
import { useConfig, useDispatch } from '@/state/useStore'

import { CardContents, CardSpecs, CardTags, OptionCard } from './OptionCard'
import { Silhouette } from './Silhouette'
import { Summary } from './Summary'

/** The body of the step panel: one card per catalogue entry for the current
 *  step, or the summary on the last one. */
export function StepOptions() {
  const config = useConfig()
  const dispatch = useDispatch()
  const { current } = useSteps()
  const t = useT()
  const { intl } = useLang()

  const surcharge = (price: number) =>
    price === 0 ? t.ui.included : `+${formatEUR(price, intl)}`

  switch (current) {
    case 'body':
      return BODIES.map((body) => {
        const copy = t.bodies[body.id]
        return (
          <OptionCard
            key={body.id}
            title={copy.name}
            kicker={copy.kind}
            line={copy.line}
            price={`${t.ui.from} ${formatEUR(body.basePrice, intl)}`}
            media={
              <span className="card-media">
                <Silhouette geo={body.geo} />
              </span>
            }
            selected={config.body === body.id}
            onSelect={() => dispatch({ type: 'setBody', id: body.id })}
          >
            <CardTags items={copy.specs} />
          </OptionCard>
        )
      })

    case 'powertrain':
      return POWERTRAINS.map((powertrain) => {
        const copy = t.powertrains[powertrain.id]
        const litres = powertrain.consumptionUnit === 'l'
        return (
          <OptionCard
            key={powertrain.id}
            title={copy.label}
            line={copy.note}
            price={surcharge(powertrain.price)}
            selected={config.powertrain === powertrain.id}
            onSelect={() =>
              dispatch({ type: 'setPowertrain', id: powertrain.id })
            }
          >
            <CardSpecs
              items={[
                {
                  value: `${formatNumber(powertrain.hp, 0, intl)} ${t.units.power}`,
                  label: t.specs.powerShort,
                },
                {
                  value: `${formatNumber(powertrain.zeroTo100Seconds, 1, intl)} s`,
                  label: t.specs.accel,
                },
                {
                  value: formatNumber(powertrain.consumption, 1, intl),
                  label: litres ? t.specs.consumption : 'kWh/100',
                },
                {
                  value: formatNumber(powertrain.co2PerKm, 0, intl),
                  label: t.specs.co2,
                },
              ]}
            />
          </OptionCard>
        )
      })

    case 'colour':
      return COLOURS.map((colour) => {
        const copy = t.colours[colour.id]
        return (
          <OptionCard
            key={colour.id}
            title={copy.label}
            kicker={copy.finish}
            price={surcharge(colour.price)}
            media={
              <span
                className="swatch"
                style={{ background: colour.hex }}
                aria-hidden="true"
              />
            }
            selected={config.colour === colour.id}
            onSelect={() => dispatch({ type: 'setColour', id: colour.id })}
          />
        )
      })

    case 'wheels': {
      const blocked = availability(config).wheels
      return WHEELS.map((wheel) => {
        const copy = t.wheels[wheel.id]
        const note = blocked[wheel.id]
        return (
          <OptionCard
            key={wheel.id}
            title={copy.label}
            line={copy.effect}
            price={surcharge(wheel.price)}
            selected={config.wheels === wheel.id}
            blockedReason={note && formatBlocked(t, note)}
            onSelect={() => dispatch({ type: 'setWheels', id: wheel.id })}
          >
            <CardTags items={copy.specs} />
          </OptionCard>
        )
      })
    }

    case 'packages': {
      const blocked = availability(config).packages
      return PACKAGES.map((pkg) => {
        const copy = t.packages[pkg.id]
        const note = blocked[pkg.id]
        const fitted = config.packages.includes(pkg.id)
        return (
          <OptionCard
            key={pkg.id}
            multi
            title={copy.label}
            price={surcharge(pkg.price)}
            selected={fitted}
            blockedReason={note && formatBlocked(t, note)}
            onSelect={() =>
              dispatch({
                type: fitted ? 'removePackage' : 'addPackage',
                id: pkg.id,
              })
            }
          >
            <CardContents items={copy.contents} />
          </OptionCard>
        )
      })
    }

    case 'summary':
      return <Summary />
  }
}
