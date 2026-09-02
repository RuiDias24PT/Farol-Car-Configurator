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

import type {
  Body,
  BodyId,
  Config,
  Package,
  PackageId,
  Powertrain,
  PowertrainId,
  Wheel,
  WheelId,
} from '@/catalog/types'

export type Note =
  | {
      code: 'wheelsNeedElectrified'
      wheels: WheelId
      powertrain: PowertrainId
      to: WheelId
    }
  | { code: 'wheelsNeedBigBody'; wheels: WheelId; body: BodyId; to: WheelId }
  | { code: 'packageBlockedByWheels'; pkg: PackageId; wheels: WheelId }
  | { code: 'packageNeedsTowBody'; pkg: PackageId; body: BodyId }
  | { code: 'bodySwappedForPackage'; pkg: PackageId; from: BodyId; to: BodyId }
  | {
      code: 'wheelsSwappedForPackage'
      pkg: PackageId
      from: WheelId
      to: WheelId
    }

export interface Reconciled {
  config: Config
  notes: readonly Note[]
}

export interface Availability {
  wheels: Record<WheelId, Note | null>
  packages: Record<PackageId, Note | null>
}

const NO_NOTES: readonly Note[] = Object.freeze([])

function byId<T extends { id: string }>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id)
}

function pick<T extends { id: string }>(items: readonly T[], id: string): T {
  return byId(items, id) ?? items[0]
}

const DEFAULT_BODY: Body = pick(BODIES, DEFAULT_CONFIG.body)
const DEFAULT_POWERTRAIN: Powertrain = pick(
  POWERTRAINS,
  DEFAULT_CONFIG.powertrain,
)
const FALLBACK: Wheel = pick(WHEELS, FALLBACK_WHEEL)

interface Resolved {
  config: Config
  body: Body
  powertrain: Powertrain
  wheels: Wheel
  packages: readonly Package[]
}

function resolve(config: Config | null | undefined): Resolved {
  const raw = config ?? DEFAULT_CONFIG

  const body = byId(BODIES, raw.body) ?? DEFAULT_BODY
  const powertrain = byId(POWERTRAINS, raw.powertrain) ?? DEFAULT_POWERTRAIN
  const wheels = byId(WHEELS, raw.wheels) ?? FALLBACK
  const colour = byId(COLOURS, raw.colour)?.id ?? DEFAULT_CONFIG.colour
  const step = STEPS.includes(raw.step) ? raw.step : DEFAULT_CONFIG.step

  const listed = Array.isArray(raw.packages) ? raw.packages : []
  const packages: Package[] = []
  for (const id of listed) {
    const pkg = byId(PACKAGES, id)
    if (pkg && !packages.includes(pkg)) packages.push(pkg)
  }

  const clean =
    body.id === raw.body &&
    powertrain.id === raw.powertrain &&
    wheels.id === raw.wheels &&
    colour === raw.colour &&
    step === raw.step &&
    Array.isArray(raw.packages) &&
    packages.length === listed.length

  return {
    config: clean
      ? raw
      : {
          body: body.id,
          powertrain: powertrain.id,
          colour,
          wheels: wheels.id,
          packages: packages.map((pkg) => pkg.id),
          step,
        },
    body,
    powertrain,
    wheels,
    packages,
  }
}

function wheelIssue(
  wheels: Wheel,
  body: Body,
  powertrain: Powertrain,
): Note | null {
  if (wheels.requiresElectrified && !powertrain.electrified) {
    return {
      code: 'wheelsNeedElectrified',
      wheels: wheels.id,
      powertrain: powertrain.id,
      to: FALLBACK.id,
    }
  }
  if (wheels.needsBigBody && !body.takesBigWheels) {
    return {
      code: 'wheelsNeedBigBody',
      wheels: wheels.id,
      body: body.id,
      to: FALLBACK.id,
    }
  }
  return null
}

function packageIssue(pkg: Package, body: Body, wheels: Wheel): Note | null {
  if (wheels.blocksPackages.includes(pkg.id)) {
    return { code: 'packageBlockedByWheels', pkg: pkg.id, wheels: wheels.id }
  }
  if (pkg.needsTowCapableBody && !body.canTow) {
    return { code: 'packageNeedsTowBody', pkg: pkg.id, body: body.id }
  }
  return null
}

export function reconcile(config: Config): Reconciled {
  const resolved = resolve(config)
  const notes: Note[] = []

  let wheels = resolved.wheels
  const wheelNote = wheelIssue(wheels, resolved.body, resolved.powertrain)
  if (wheelNote) {
    notes.push(wheelNote)
    wheels = FALLBACK
  }

  const packages: PackageId[] = []
  for (const pkg of resolved.packages) {
    const note = packageIssue(pkg, resolved.body, wheels)
    if (note) notes.push(note)
    else packages.push(pkg.id)
  }

  if (notes.length === 0) return { config: resolved.config, notes: NO_NOTES }
  return { config: { ...resolved.config, wheels: wheels.id, packages }, notes }
}

export function addPackage(config: Config, id: PackageId): Reconciled {
  const resolved = resolve(config)
  const pkg = byId(PACKAGES, id)

  if (!pkg) return reconcile(resolved.config)

  const notes: Note[] = []
  let body = resolved.body
  let wheels = resolved.wheels

  if (pkg.needsTowCapableBody && !body.canTow) {
    const towing = BODIES.find((candidate) => candidate.canTow)
    if (towing) {
      notes.push({
        code: 'bodySwappedForPackage',
        pkg: pkg.id,
        from: body.id,
        to: towing.id,
      })
      body = towing
    }
  }

  if (wheels.blocksPackages.includes(pkg.id)) {
    notes.push({
      code: 'wheelsSwappedForPackage',
      pkg: pkg.id,
      from: wheels.id,
      to: FALLBACK.id,
    })
    wheels = FALLBACK
  }

  if (notes.length === 0 && resolved.packages.includes(pkg)) {
    return reconcile(resolved.config)
  }

  const packages = resolved.packages.map((fitted) => fitted.id)
  if (!packages.includes(pkg.id)) packages.push(pkg.id)

  const candidate: Config = {
    ...resolved.config,
    body: body.id,
    wheels: wheels.id,
    packages,
  }
  const settled = reconcile(candidate)
  return { config: settled.config, notes: [...notes, ...settled.notes] }
}

export function availability(config: Config): Availability {
  const resolved = resolve(reconcile(config).config)

  const wheels = {} as Record<WheelId, Note | null>
  for (const wheel of WHEELS) {
    wheels[wheel.id] = wheelIssue(wheel, resolved.body, resolved.powertrain)
  }

  const packages = {} as Record<PackageId, Note | null>
  for (const pkg of PACKAGES) {
    packages[pkg.id] = packageIssue(pkg, resolved.body, resolved.wheels)
  }

  return { wheels, packages }
}
