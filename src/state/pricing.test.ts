import { describe, expect, it } from 'vitest'

import { BODIES, COLOURS, DEFAULT_CONFIG, PACKAGES, POWERTRAINS, WHEELS } from '@/catalog'
import type { Config, PackageId } from '@/catalog/types'

import { formatEUR, formatNumber, lines, total } from './pricing'

function configFor(fields: Partial<Config>): Config {
  return { ...DEFAULT_CONFIG, ...fields }
}

/** Intl uses a non-breaking space as the group and currency separator. */
const plain = (s: string) => s.replace(/\u00A0/g, ' ')

const priceOf = {
  body: (id: string) => BODIES.find((b) => b.id === id)!.basePrice,
  powertrain: (id: string) => POWERTRAINS.find((p) => p.id === id)!.price,
  colour: (id: string) => COLOURS.find((c) => c.id === id)!.price,
  wheels: (id: string) => WHEELS.find((w) => w.id === id)!.price,
  package: (id: string) => PACKAGES.find((p) => p.id === id)!.price,
}

/* ---------- total ---------- */

describe('total', () => {
  it('is the base price alone for the default configuration', () => {
    expect(total(DEFAULT_CONFIG)).toBe(46_900)
  })

  it('adds every chosen option', () => {
    const config = configFor({
      powertrain: 'ev',
      colour: 'carmine',
      wheels: 'multi21',
      packages: ['winter'],
    })

    expect(total(config)).toBe(63_950)
  })

  it('counts a package listed twice only once', () => {
    const once = configFor({ packages: ['assist'] })
    const twice = configFor({ packages: ['assist', 'assist'] as PackageId[] })

    expect(total(twice)).toBe(total(once))
  })

  it('prices the config on its face — it does not reconcile first', () => {
    // aero19 on a combustion car is an illegal pair reconcile would drop, but
    const illegal = configFor({ powertrain: 'ice', wheels: 'aero19' })

    expect(total(illegal)).toBe(46_900 + priceOf.wheels('aero19'))
  })

  it('never throws on a hand-edited hash, and returns a number', () => {
    const garbage: unknown[] = [
      undefined,
      null,
      {},
      42,
      { body: 'lisboa', powertrain: 'steam', colour: 'chrome', wheels: 'cart' },
      { ...DEFAULT_CONFIG, packages: 'tow' },
      { ...DEFAULT_CONFIG, packages: ['tow', 'tow', 'nope', 42] },
    ]

    for (const input of garbage) {
      const where = JSON.stringify(input) ?? 'undefined'
      expect(() => total(input as Config), where).not.toThrow()
      expect(Number.isFinite(total(input as Config)), where).toBe(true)
    }
  })
})

/* ---------- lines ---------- */

describe('lines', () => {
  it('lists body, powertrain, colour, wheels, then the packages in order', () => {
    const config = configFor({
      powertrain: 'ev',
      colour: 'petrol',
      wheels: 'multi21',
      packages: ['sound', 'winter'],
    })

    expect(lines(config)).toEqual([
      { source: 'body', id: 'serra', price: priceOf.body('serra') },
      { source: 'powertrain', id: 'ev', price: priceOf.powertrain('ev') },
      { source: 'colour', id: 'petrol', price: priceOf.colour('petrol') },
      { source: 'wheels', id: 'multi21', price: priceOf.wheels('multi21') },
      { source: 'package', id: 'sound', price: priceOf.package('sound') },
      { source: 'package', id: 'winter', price: priceOf.package('winter') },
    ])
  })

  it('keeps the zero-price slots — the summary decides what to hide', () => {
    const rows = lines(DEFAULT_CONFIG)

    expect(rows).toHaveLength(4)
    expect(rows.map((r) => r.source)).toEqual([
      'body',
      'powertrain',
      'colour',
      'wheels',
    ])
    expect(rows.find((r) => r.source === 'colour')).toEqual({
      source: 'colour',
      id: 'porcelain',
      price: 0,
    })
  })

  it('drops a package listed twice, like resolve does', () => {
    const rows = lines(configFor({ packages: ['assist', 'assist'] as PackageId[] }))
    const packageRows = rows.filter((r) => r.source === 'package')

    expect(packageRows).toEqual([
      { source: 'package', id: 'assist', price: priceOf.package('assist') },
    ])
  })

  it('sums to exactly total, for every body/powertrain/colour/wheels combo', () => {
    for (const body of BODIES) {
      for (const powertrain of POWERTRAINS) {
        for (const colour of COLOURS) {
          for (const wheels of WHEELS) {
            const config = configFor({
              body: body.id,
              powertrain: powertrain.id,
              colour: colour.id,
              wheels: wheels.id,
              packages: ['winter', 'sound'],
            })
            const sum = lines(config).reduce((n, l) => n + l.price, 0)

            expect(sum).toBe(total(config))
          }
        }
      }
    }
  })
})

/* ---------- formatEUR ---------- */

describe('formatEUR', () => {
  it('groups a five-digit price in every locale', () => {
    expect(plain(formatEUR(46_900, 'pt-PT'))).toBe('46 900 €')
    expect(plain(formatEUR(46_900, 'de-DE'))).toBe('46.900 €')
    expect(plain(formatEUR(46_900, 'en-GB'))).toBe('€46,900')
  })

  it('shows no fraction digits', () => {
    expect(plain(formatEUR(1_250, 'de-DE'))).toBe('1.250 €')
    expect(plain(formatEUR(0, 'en-GB'))).toBe('€0')
  })

  it('groups four-digit prices too, not just five', () => {
    expect(plain(formatEUR(1_850, 'pt-PT'))).toBe('1 850 €')
    expect(plain(formatEUR(1_850, 'de-DE'))).toBe('1.850 €')
    expect(plain(formatEUR(1_850, 'en-GB'))).toBe('€1,850')
  })
})

/* ---------- formatNumber ---------- */

describe('formatNumber', () => {
  it('holds the fraction digits exactly at the requested count', () => {
    expect(formatNumber(6.9, 1, 'pt-PT')).toBe('6,9')
    expect(formatNumber(5.6, 1, 'de-DE')).toBe('5,6')
    expect(formatNumber(190, 0, 'pt-PT')).toBe('190')
    expect(formatNumber(340, 0, 'en-GB')).toBe('340')
  })

  it('rounds to the requested precision', () => {
    expect(formatNumber(17.84, 1, 'en-GB')).toBe('17.8')
  })

  it('follows the locale decimal separator', () => {
    expect(formatNumber(1.4, 1, 'de-DE')).toBe('1,4')
    expect(formatNumber(1.4, 1, 'en-GB')).toBe('1.4')
  })
})
