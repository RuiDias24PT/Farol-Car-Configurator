import {
  BODIES,
  COLOURS,
  DEFAULT_CONFIG,
  PACKAGES,
  POWERTRAINS,
  STEPS,
  WHEELS,
} from '@/catalog'
import type { Config, PackageId } from '@/catalog/types'

/** The packages slot when nothing is fitted: a hash never carries an empty segment. */
const NO_PACKAGES = '-'

const BODY_IDS = BODIES.map((body) => body.id)
const POWERTRAIN_IDS = POWERTRAINS.map((powertrain) => powertrain.id)
const COLOUR_IDS = COLOURS.map((colour) => colour.id)
const WHEEL_IDS = WHEELS.map((wheel) => wheel.id)
const PACKAGE_IDS = PACKAGES.map((pkg) => pkg.id)

function canonicalPackages(packages: readonly PackageId[]): PackageId[] {
  return [...new Set(packages)].sort()
}

export function hashFor(config: Config): string {
  const packages = canonicalPackages(config.packages)

  return `#/${[
    config.body,
    config.powertrain,
    config.colour,
    config.wheels,
    packages.length > 0 ? packages.join(',') : NO_PACKAGES,
    config.step,
  ].join('/')}`
}

function pickId<T extends string>(
  ids: readonly T[],
  raw: string | undefined,
  fallback: T,
): T {
  return ids.find((id) => id === raw) ?? fallback
}

function parsePackages(
  raw: string | undefined,
  fallback: readonly PackageId[],
): readonly PackageId[] {
  // No segment at all is an unreadable field, so it falls back like the others.
  // An explicit `-` or an empty slot is a car that was shared with no packages.
  if (raw === undefined) return canonicalPackages(fallback)
  if (raw === NO_PACKAGES || raw === '') return []

  const fitted = raw
    .split(',')
    .map((id) => PACKAGE_IDS.find((known) => known === id))
    .filter((id): id is PackageId => id !== undefined)

  return canonicalPackages(fitted)
}

export function parseHash(hash: string, seed: Config = DEFAULT_CONFIG): Config {
  const raw = typeof hash === 'string' ? hash.replace(/^#\/?/, '') : ''
  const parts = raw.split('/')

  return {
    body: pickId(BODY_IDS, parts[0], seed.body),
    powertrain: pickId(POWERTRAIN_IDS, parts[1], seed.powertrain),
    colour: pickId(COLOUR_IDS, parts[2], seed.colour),
    wheels: pickId(WHEEL_IDS, parts[3], seed.wheels),
    packages: parsePackages(parts[4], seed.packages),
    step: pickId(STEPS, parts[5], seed.step),
  }
}
