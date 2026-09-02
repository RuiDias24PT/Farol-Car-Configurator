import { describe, expect, it } from 'vitest'

import { BODIES, COLOURS, PACKAGES, POWERTRAINS, WHEELS } from './index'

const CATALOGUES = [
  ['bodies', BODIES],
  ['powertrains', POWERTRAINS],
  ['colours', COLOURS],
  ['wheels', WHEELS],
  ['packages', PACKAGES],
] as const

describe('catalog', () => {
  it.each(CATALOGUES)('%s have unique ids', (_name, items) => {
    const ids = items.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // Adding `tow` to a body that cannot tow swaps to the first body
  // that can. With no such body that search yields undefined and the engine
  // throws in the one place it is supposed to be helpful.
  it('at least one body can tow', () => {
    expect(BODIES.some((body) => body.canTow)).toBe(true)
  })

  // Without one, multi21 is selectable but rule 2 undoes it on every body —
  // an option the user can never keep.
  it('at least one body takes big wheels', () => {
    expect(BODIES.some((body) => body.takesBigWheels)).toBe(true)
  })
})
