import { describe, expect, it } from 'vitest'

import {
  BODIES,
  COLOURS,
  DEFAULT_CONFIG,
  FALLBACK_WHEEL,
  PACKAGES,
  POWERTRAINS,
  STEPS,
  WHEELS,
} from '@/catalog'
import type { Body, Config, Package, Powertrain, Wheel } from '@/catalog/types'

import { addPackage, availability, reconcile } from './constraints'

function configFor(fields: Partial<Config>): Config {
  return { ...DEFAULT_CONFIG, ...fields }
}

function subsets<T>(items: readonly T[]): T[][] {
  return items.reduce<T[][]>(
    (sets, item) => [...sets, ...sets.map((set) => [...set, item])],
    [[]],
  )
}

const PACKAGE_SETS = subsets(PACKAGES.map((pkg) => pkg.id))

/**
 * Every combination that can break a rule: 4 bodies × 3 powertrains × 3 wheels
 * × 16 package sets = 576. Colour and step take part in no rule, so putting
 * them in the product would multiply the running time by 24 to test nothing —
 * a separate test asserts they come out untouched.
 */
const ALL_CONFIGS: Config[] = BODIES.flatMap((body) =>
  POWERTRAINS.flatMap((powertrain) =>
    WHEELS.flatMap((wheels) =>
      PACKAGE_SETS.map((packages) =>
        configFor({
          body: body.id,
          powertrain: powertrain.id,
          wheels: wheels.id,
          packages,
        }),
      ),
    ),
  ),
)

const label = (config: Config) =>
  [
    config.body,
    config.powertrain,
    config.wheels,
    config.packages.join(',') || '-',
  ].join('/')


function brokenRules(config: Config): string[] {
  const body: Body = BODIES.find((item) => item.id === config.body)!
  const powertrain: Powertrain = POWERTRAINS.find(
    (item) => item.id === config.powertrain,
  )!
  const wheels: Wheel = WHEELS.find((item) => item.id === config.wheels)!
  const broken: string[] = []

  if (wheels.requiresElectrified && !powertrain.electrified) broken.push('1')
  if (wheels.needsBigBody && !body.takesBigWheels) broken.push('2')
  for (const id of config.packages) {
    const pkg: Package = PACKAGES.find((item) => item.id === id)!
    if (wheels.blocksPackages.includes(id)) broken.push(`3 (${id})`)
    if (pkg.needsTowCapableBody && !body.canTow) broken.push(`4 (${id})`)
  }
  return broken
}

/** Every id in the config exists, and no package is listed twice. */
function isCatalogued(config: Config): boolean {
  return (
    BODIES.some((item) => item.id === config.body) &&
    POWERTRAINS.some((item) => item.id === config.powertrain) &&
    COLOURS.some((item) => item.id === config.colour) &&
    WHEELS.some((item) => item.id === config.wheels) &&
    STEPS.includes(config.step) &&
    Array.isArray(config.packages) &&
    config.packages.every(
      (id, index) =>
        PACKAGES.some((item) => item.id === id) &&
        config.packages.indexOf(id) === index,
    )
  )
}

/* ---------- the four rules ---------- */

describe('reconcile — each rule', () => {
  it('1. drops wheels that need electrification from a combustion car', () => {
    const { config, notes } = reconcile(
      configFor({ powertrain: 'ice', wheels: 'aero19' }),
    )

    expect(config.wheels).toBe(FALLBACK_WHEEL)
    expect(notes).toEqual([
      {
        code: 'wheelsNeedElectrified',
        wheels: 'aero19',
        powertrain: 'ice',
        to: FALLBACK_WHEEL,
      },
    ])
  })

  it('2. drops big wheels from a body that cannot take them', () => {
    const { config, notes } = reconcile(
      configFor({ body: 'bairro', wheels: 'multi21' }),
    )

    expect(config.wheels).toBe(FALLBACK_WHEEL)
    expect(notes).toEqual([
      {
        code: 'wheelsNeedBigBody',
        wheels: 'multi21',
        body: 'bairro',
        to: FALLBACK_WHEEL,
      },
    ])
  })

  it('3. removes a package the chosen wheels block', () => {
    const { config, notes } = reconcile(
      configFor({ body: 'serra', wheels: 'multi21', packages: ['tow'] }),
    )

    expect(config.wheels).toBe('multi21')
    expect(config.packages).toEqual([])
    expect(notes).toEqual([
      { code: 'packageBlockedByWheels', pkg: 'tow', wheels: 'multi21' },
    ])
  })

  it('4. removes a towing package from a body that cannot tow', () => {
    const { config, notes } = reconcile(
      configFor({ body: 'solar', packages: ['winter', 'tow'] }),
    )

    expect(config.packages).toEqual(['winter'])
    expect(notes).toEqual([
      { code: 'packageNeedsTowBody', pkg: 'tow', body: 'solar' },
    ])
  })
})

/* ---------- invariants over every configuration ---------- */

describe('reconcile — invariants across all 576 configurations', () => {
  it('covers the whole product', () => {
    expect(ALL_CONFIGS).toHaveLength(576)
  })

  it('always returns a configuration that satisfies every rule', () => {
    for (const config of ALL_CONFIGS) {
      const result = reconcile(config)
      expect(brokenRules(result.config), label(config)).toEqual([])
    }
  })

  it('is idempotent, and settles in a single pass', () => {
    for (const config of ALL_CONFIGS) {
      const once = reconcile(config)
      const twice = reconcile(once.config)

      expect(twice.notes, label(config)).toEqual([])
      expect(twice.config, label(config)).toBe(once.config)
    }
  })

  it('reports a note exactly when it changed something', () => {
    for (const config of ALL_CONFIGS) {
      const { config: result, notes } = reconcile(config)

      if (notes.length === 0) expect(result, label(config)).toBe(config)
      else expect(result, label(config)).not.toEqual(config)
    }
  })

  // Guards against someone later teaching `reconcile` to resolve upward the
  // way `addPackage` does. Corrections only ever take away.
  it('never adds anything the input did not have', () => {
    for (const config of ALL_CONFIGS) {
      const { config: result } = reconcile(config)

      expect(result.body, label(config)).toBe(config.body)
      expect(result.powertrain, label(config)).toBe(config.powertrain)
      expect(result.colour, label(config)).toBe(config.colour)
      expect(result.step, label(config)).toBe(config.step)
      expect(
        result.wheels === config.wheels || result.wheels === FALLBACK_WHEEL,
        label(config),
      ).toBe(true)
      for (const id of result.packages) {
        expect(config.packages, label(config)).toContain(id)
      }
    }
  })

  it('leaves colour and step alone even while correcting', () => {
    for (const colour of COLOURS) {
      for (const step of STEPS) {
        const config = configFor({
          body: 'bairro',
          wheels: 'multi21',
          colour: colour.id,
          step,
        })
        const result = reconcile(config)

        expect(result.notes).toHaveLength(1)
        expect(result.config.colour).toBe(colour.id)
        expect(result.config.step).toBe(step)
      }
    }
  })
})

/* ---------- the default configuration ---------- */

describe('the default configuration', () => {
  // A visitor who picked nothing must not be told something was corrected.
  it('is a fixed point — unchanged, no notes', () => {
    const { config, notes } = reconcile(DEFAULT_CONFIG)

    expect(notes).toEqual([])
    expect(config).toBe(DEFAULT_CONFIG)
  })

  it('names ids that exist in the catalogue', () => {
    expect(isCatalogued(DEFAULT_CONFIG)).toBe(true)
  })
})

/* ---------- the fallback wheel ---------- */

// Not a test of today's data: it guards the engine against a later edit to the
// catalogue that would give the fallback a price or a requirement, at which
// point corrections would either cost money or loop.
describe('the fallback wheel', () => {
  it('is legal on every body and powertrain pair', () => {
    for (const body of BODIES) {
      for (const powertrain of POWERTRAINS) {
        const config = configFor({
          body: body.id,
          powertrain: powertrain.id,
          wheels: FALLBACK_WHEEL,
        })

        expect(
          availability(config).wheels[FALLBACK_WHEEL],
          `${body.id}/${powertrain.id}`,
        ).toBeNull()
      }
    }
  })

  it('is free and blocks no package', () => {
    const fallback: Wheel = WHEELS.find((item) => item.id === FALLBACK_WHEEL)!

    expect(fallback.price).toBe(0)
    expect(fallback.blocksPackages).toEqual([])
    expect(fallback.requiresElectrified).toBe(false)
    expect(fallback.needsBigBody).toBe(false)
  })
})

/* ---------- adding a package resolves upward ---------- */

describe('addPackage', () => {
  it('swaps the body and the wheels to fit tow on a solar with 21" wheels', () => {
    const { config, notes } = addPackage(
      configFor({ body: 'solar', wheels: 'multi21' }),
      'tow',
    )

    expect(config.body).toBe('serra')
    expect(config.wheels).toBe(FALLBACK_WHEEL)
    expect(config.packages).toEqual(['tow'])
    expect(notes).toEqual([
      { code: 'bodySwappedForPackage', pkg: 'tow', from: 'solar', to: 'serra' },
      {
        code: 'wheelsSwappedForPackage',
        pkg: 'tow',
        from: 'multi21',
        to: FALLBACK_WHEEL,
      },
    ])
  })

  it('swaps only the body when the wheels are already compatible', () => {
    const { config, notes } = addPackage(configFor({ body: 'solar' }), 'tow')

    expect(config.body).toBe('serra')
    expect(notes).toHaveLength(1)
  })

  it('adds a package that conflicts with nothing without a word', () => {
    const config = configFor({ packages: ['winter'] })
    const result = addPackage(config, 'sound')

    expect(result.config.packages).toEqual(['winter', 'sound'])
    expect(result.notes).toEqual([])
  })

  it('is a no-op for a package that is already fitted', () => {
    const config = configFor({ packages: ['winter'] })
    const result = addPackage(config, 'winter')

    expect(result.config).toBe(config)
    expect(result.notes).toEqual([])
  })

  // The regression that matters: resolve the conflicts and *then* reconcile,
  // or rule 3 silently deletes the package the user just asked for.
  it('always ends with the package fitted, from any starting point', () => {
    for (const config of ALL_CONFIGS) {
      for (const pkg of PACKAGES) {
        const result = addPackage(config, pkg.id)

        expect(
          result.config.packages,
          `${label(config)} + ${pkg.id}`,
        ).toContain(pkg.id)
        expect(
          brokenRules(result.config),
          `${label(config)} + ${pkg.id}`,
        ).toEqual([])
      }
    }
  })

  it('leaves an already-valid configuration reconciled', () => {
    for (const config of ALL_CONFIGS) {
      for (const pkg of PACKAGES) {
        const { config: result } = addPackage(config, pkg.id)
        expect(reconcile(result).notes, `${label(config)} + ${pkg.id}`).toEqual(
          [],
        )
      }
    }
  })
})

/* ---------- availability agrees with reconcile ---------- */

describe('availability', () => {
  it('clears a wheel exactly when reconcile would let it stand', () => {
    for (const config of ALL_CONFIGS) {
      const limits = availability(config)

      for (const wheel of WHEELS) {
        const survives =
          reconcile({ ...config, wheels: wheel.id }).config.wheels === wheel.id

        expect(
          limits.wheels[wheel.id] === null,
          `${label(config)} → ${wheel.id}`,
        ).toBe(survives)
      }
    }
  })

  it('clears a package exactly when reconcile would let it stand', () => {
    for (const config of ALL_CONFIGS) {
      const limits = availability(config)

      for (const pkg of PACKAGES) {
        const survives = reconcile({
          ...config,
          packages: [...config.packages, pkg.id],
        }).config.packages.includes(pkg.id)

        expect(
          limits.packages[pkg.id] === null,
          `${label(config)} → ${pkg.id}`,
        ).toBe(survives)
      }
    }
  })

  it('answers for every wheel and every package', () => {
    const limits = availability(DEFAULT_CONFIG)

    expect(Object.keys(limits.wheels).sort()).toEqual(
      WHEELS.map((wheel) => wheel.id).sort(),
    )
    expect(Object.keys(limits.packages).sort()).toEqual(
      PACKAGES.map((pkg) => pkg.id).sort(),
    )
  })
})

/* ---------- totality ---------- */

// A hand-edited hash reaches the engine as whatever the user typed. It must
// come out as a car, never as an exception.
describe('totality', () => {
  const GARBAGE: unknown[] = [
    undefined,
    null,
    {},
    42,
    'serra',
    [],
    { body: 'lisboa', powertrain: 'steam', colour: 'chrome', wheels: 'cart' },
    { ...DEFAULT_CONFIG, packages: 'tow' },
    { ...DEFAULT_CONFIG, packages: null },
    { ...DEFAULT_CONFIG, packages: ['tow', 'tow', 'nope', 42] },
    { ...DEFAULT_CONFIG, step: 'checkout' },
    { ...DEFAULT_CONFIG, step: 3 },
    { body: 'bairro', wheels: 'multi21', packages: ['tow'] },
  ]

  it('never throws, and always yields a catalogued configuration', () => {
    for (const input of GARBAGE) {
      const where = JSON.stringify(input) ?? 'undefined'
      const config = input as Config

      expect(() => reconcile(config), where).not.toThrow()
      expect(() => addPackage(config, 'tow'), where).not.toThrow()
      expect(() => availability(config), where).not.toThrow()

      expect(isCatalogued(reconcile(config).config), where).toBe(true)
      expect(isCatalogued(addPackage(config, 'tow').config), where).toBe(true)
      expect(brokenRules(reconcile(config).config), where).toEqual([])
    }
  })

  it('stays idempotent on garbage', () => {
    for (const input of GARBAGE) {
      const where = JSON.stringify(input) ?? 'undefined'
      const once = reconcile(input as Config)

      expect(reconcile(once.config).notes, where).toEqual([])
      expect(reconcile(once.config).config, where).toBe(once.config)
    }
  })
})