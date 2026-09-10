import type { BodyId, PackageId, WheelId } from '@/catalog/types'

import type { Note } from '@/state/constraints'

import type { BodyRef, Locale } from './pt'

function bodyRef(locale: Locale, id: BodyId): BodyRef {
  const body = locale.bodies[id]
  return { name: body.name, def: body.def, em: body.em }
}

const wheelLabel = (locale: Locale, id: WheelId): string =>
  locale.wheels[id].label

const packageLabel = (locale: Locale, id: PackageId): string =>
  locale.packages[id].label

export function formatNote(locale: Locale, note: Note): string {
  const c = locale.constraints
  switch (note.code) {
    case 'wheelsNeedElectrified':
      return c.wheelsNeedElectrified({
        wheel: wheelLabel(locale, note.wheels),
        to: wheelLabel(locale, note.to),
      })
    case 'wheelsNeedBigBody':
      return c.wheelsNeedBigBody({
        wheel: wheelLabel(locale, note.wheels),
        body: bodyRef(locale, note.body),
        to: wheelLabel(locale, note.to),
      })
    case 'packageBlockedByWheels':
      return c.packageBlockedByWheels({
        pkg: packageLabel(locale, note.pkg),
        wheel: wheelLabel(locale, note.wheels),
      })
    case 'packageNeedsTowBody':
      return c.packageNeedsTowBody({
        pkg: packageLabel(locale, note.pkg),
        body: bodyRef(locale, note.body),
      })
    case 'bodySwappedForPackage':
      return c.bodySwappedForPackage({
        from: bodyRef(locale, note.from),
        to: bodyRef(locale, note.to),
      })
    case 'wheelsSwappedForPackage':
      return c.wheelsSwappedForPackage({
        wheel: wheelLabel(locale, note.from),
        to: wheelLabel(locale, note.to),
      })
    default: {
      const exhaustive: never = note
      return exhaustive
    }
  }
}

export function formatBlocked(locale: Locale, note: Note): string {
  const b = locale.blocked
  switch (note.code) {
    case 'wheelsNeedElectrified':
      return b.wheelsNeedElectrified()
    case 'wheelsNeedBigBody':
      return b.wheelsNeedBigBody(bodyRef(locale, note.body))
    case 'packageBlockedByWheels':
      return b.packageBlockedByWheels({ wheel: wheelLabel(locale, note.wheels) })
    case 'packageNeedsTowBody':
      return b.packageNeedsTowBody(bodyRef(locale, note.body))
    default:
      return formatNote(locale, note)
  }
}
