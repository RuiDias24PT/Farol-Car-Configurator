import { describe, expect, it } from 'vitest'

import { POWERTRAINS } from '@/catalog'

import { rangeSpec } from './specs'

const powertrain = (id: string) => POWERTRAINS.find((p) => p.id === id)!

describe('rangeSpec', () => {
  it('quotes petrol by consumption, to one decimal', () => {
    expect(rangeSpec(powertrain('ice'))).toEqual({
      value: 6.9,
      digits: 1,
      unit: 'litres',
    })
  })

  it('quotes the hybrid by its electric range, not its 1.4 l', () => {
    expect(rangeSpec(powertrain('hybrid'))).toEqual({
      value: 62,
      digits: 0,
      unit: 'km',
    })
  })

  it('quotes the EV by its range, not its kWh', () => {
    expect(rangeSpec(powertrain('ev'))).toEqual({
      value: 512,
      digits: 0,
      unit: 'km',
    })
  })
})
