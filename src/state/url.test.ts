import { describe, expect, it } from 'vitest'

import { BODIES, DEFAULT_CONFIG, POWERTRAINS, STEPS, WHEELS } from '@/catalog'
import type { Config, PackageId } from '@/catalog/types'

import { reconcile } from './constraints'
import { hashFor, parseHash } from './url'

function configFor(fields: Partial<Config>): Config {
  return { ...DEFAULT_CONFIG, ...fields }
}

/** Canonical form: what `hashFor` can round-trip without reordering anything. */
const PACKAGE_SETS: PackageId[][] = [
  [],
  ['assist'],
  ['assist', 'winter'],
  ['assist', 'sound', 'tow', 'winter'],
]

describe('hashFor', () => {
  it('writes the six fields in funnel order', () => {
    expect(hashFor(DEFAULT_CONFIG)).toBe('#/serra/ice/porcelain/sport20/-/body')
  })

  it('carries the step by id, not by its index in STEPS', () => {
    expect(hashFor(configFor({ step: 'wheels' }))).toContain('/wheels')
    expect(hashFor(configFor({ step: 'wheels' }))).not.toContain('/3')
  })

  it('sorts the packages, so choice order cannot change the link', () => {
    const one = configFor({ packages: ['sound', 'assist', 'winter'] })
    const other = configFor({ packages: ['winter', 'sound', 'assist'] })

    expect(hashFor(one)).toContain('/assist,sound,winter/')
    expect(hashFor(other)).toBe(hashFor(one))
  })

  it('collapses a package listed twice', () => {
    const config = configFor({ packages: ['tow', 'tow'] as PackageId[] })

    expect(hashFor(config)).toContain('/tow/')
  })

  it('writes a dash when nothing is fitted, never an empty segment', () => {
    expect(hashFor(DEFAULT_CONFIG)).toContain('/-/')
    expect(hashFor(DEFAULT_CONFIG)).not.toContain('//')
  })
})

describe('parseHash', () => {
  it('parses a complete six-field hash into a config', () => {
    expect(parseHash('#/vela/ev/carmine/multi21/assist,tow/summary')).toEqual({
      body: 'vela',
      powertrain: 'ev',
      colour: 'carmine',
      wheels: 'multi21',
      packages: ['assist', 'tow'],
      step: 'summary',
    })
  })

  it('does not reconcile — that is the reducer’s job, and its notes', () => {
    // multi21 blocks tow. A parser that settled this would produce the note
    // explaining it and then have nowhere to put it.
    const parsed = parseHash('#/serra/ice/porcelain/multi21/tow/wheels')

    expect(parsed.wheels).toBe('multi21')
    expect(parsed.packages).toEqual(['tow'])
    expect(reconcile(parsed).notes).toHaveLength(1)
  })

  it('falls back field by field to the seed, not the whole link', () => {
    const seed = configFor({ body: 'vela', powertrain: 'ev', colour: 'petrol' })
    const parsed = parseHash('#/batmobile/ev/carmine/sport20/-/colour', seed)

    expect(parsed.body).toBe('vela')
    expect(parsed.colour).toBe('carmine')
  })

  it('falls back to the default car when there is no seed', () => {
    expect(parseHash('#/batmobile/steam/octarine/cartwheel/-/nope')).toEqual(
      DEFAULT_CONFIG,
    )
  })

  it('treats an absent hash as the seed, which is not an error', () => {
    expect(parseHash('')).toEqual(DEFAULT_CONFIG)
    expect(parseHash('#')).toEqual(DEFAULT_CONFIG)
    expect(parseHash('#/')).toEqual(DEFAULT_CONFIG)

    const seed = configFor({ body: 'bairro', step: 'wheels' })
    expect(parseHash('', seed)).toEqual(seed)
  })

  it('takes what it can from a truncated hash', () => {
    const parsed = parseHash('#/bairro/hybrid')

    expect(parsed.body).toBe('bairro')
    expect(parsed.powertrain).toBe('hybrid')
    expect(parsed.colour).toBe(DEFAULT_CONFIG.colour)
    expect(parsed.step).toBe(DEFAULT_CONFIG.step)
  })

  it('ignores segments past the sixth', () => {
    const long = '#/vela/ev/carmine/sport20/-/summary/junk/more/still-more'

    expect(parseHash(long)).toEqual(
      parseHash('#/vela/ev/carmine/sport20/-/summary'),
    )
  })

  it('drops unknown packages and keeps the known ones', () => {
    const parsed = parseHash(
      '#/serra/ice/porcelain/sport20/jetpack,winter/body',
    )

    expect(parsed.packages).toEqual(['winter'])
  })

  it('reads an empty or dashed package slot as no packages', () => {
    const seed = configFor({ packages: ['assist'] })

    expect(
      parseHash('#/serra/ice/porcelain/sport20/-/body', seed).packages,
    ).toEqual([])
    expect(
      parseHash('#/serra/ice/porcelain/sport20//body', seed).packages,
    ).toEqual([])
  })

  it('sorts and deduplicates a hand-written package list', () => {
    const parsed = parseHash(
      '#/serra/ice/porcelain/sport20/winter,assist,winter/body',
    )

    expect(parsed.packages).toEqual(['assist', 'winter'])
  })

  it('never throws on a hand-edited hash, and always returns a valid config', () => {
    const garbage = [
      '#/%',
      '#/%zz/%/%/%/%/%',
      '#/SERRA/ICE/PORCELAIN/SPORT20/-/BODY',
      '#////////',
      '#/serra/ice/porcelain/sport20/,,,/body',
      '#/' + 'a/'.repeat(200),
      'not-a-hash-at-all',
      '#/serra/ice/porcelain/sport20/-/body?utm_source=x',
    ]

    for (const hash of garbage) {
      expect(() => parseHash(hash), hash).not.toThrow()

      const parsed = parseHash(hash)
      expect(
        BODIES.some((b) => b.id === parsed.body),
        hash,
      ).toBe(true)
      expect(
        POWERTRAINS.some((p) => p.id === parsed.powertrain),
        hash,
      ).toBe(true)
      expect(
        WHEELS.some((w) => w.id === parsed.wheels),
        hash,
      ).toBe(true)
      expect(STEPS.includes(parsed.step), hash).toBe(true)
    }
  })
})

describe('round trip', () => {
  const SETTLED: Config[] = BODIES.flatMap((body) =>
    POWERTRAINS.flatMap((powertrain) =>
      WHEELS.flatMap((wheel) =>
        PACKAGE_SETS.map(
          (packages): Config =>
            reconcile(
              configFor({
                body: body.id,
                powertrain: powertrain.id,
                wheels: wheel.id,
                packages,
              }),
            ).config,
        ),
      ),
    ),
  )

  // toEqual, not toBe: parsing builds a fresh object, so identity can never
  // survive a serialise/parse round trip however correct the code is.
  it('parses back to the same car, for every settled config', () => {
    for (const config of SETTLED) {
      expect(parseHash(hashFor(config)), hashFor(config)).toEqual(config)
    }
  })

  it('is stable for every step', () => {
    for (const step of STEPS) {
      const config = configFor({ step })
      expect(parseHash(hashFor(config))).toEqual(config)
    }
  })

  /**
   * The property that survives garbage: normalising is idempotent. A link that
   * has been through the app once is a fixed point — sharing it back produces
   * the identical string. `toBe`, because this one compares strings.
   */
  it('normalises garbage to a fixed point', () => {
    const canonical = (hash: string) =>
      hashFor(reconcile(parseHash(hash)).config)

    const hashes = [
      '',
      '#/',
      '#/%',
      '#/serra/ice/porcelain/multi21/tow/wheels',
      '#/bairro/ice/carmine/multi21/winter,winter,jetpack/packages',
      '#/vela/steam/carmine/aero19/tow,assist/summary',
      '#/solar/ice/petrol/sport20/tow/colour',
    ]

    for (const hash of hashes) {
      expect(canonical(canonical(hash)), hash).toBe(canonical(hash))
    }
  })
})
