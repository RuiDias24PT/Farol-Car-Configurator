import type { Powertrain } from '@/catalog/types'

export interface RangeSpec {
  value: number
  digits: number
  /** A key of `t.units`, so the unit is translated like every other string. */
  unit: 'km' | 'litres'
}

// The stage has one cell for "how far it goes". Electrified cars quote their
// range; petrol quotes consumption, which is why its label reads "/100 km".
// `range.kind` can't pick the branch: ice and ev are both 'total'.
export function rangeSpec(powertrain: Powertrain): RangeSpec {
  if (powertrain.electrified) {
    return { value: powertrain.range.km, digits: 0, unit: 'km' }
  }
  return { value: powertrain.consumption, digits: 1, unit: 'litres' }
}
