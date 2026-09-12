import type {
  BodyId,
  ColourId,
  Config,
  PackageId,
  PowertrainId,
  WheelId,
} from '@/catalog/types'

import { resolve } from './constraints'

// A union rather than `id: string`, so the summary can look a row up in the
// locale by its id without a cast: checking `source` narrows `id`.
export type PriceLine =
  | { source: 'body'; id: BodyId; price: number }
  | { source: 'powertrain'; id: PowertrainId; price: number }
  | { source: 'colour'; id: ColourId; price: number }
  | { source: 'wheels'; id: WheelId; price: number }
  | { source: 'package'; id: PackageId; price: number }

export type PriceSource = PriceLine['source']

export function lines(config: Config): readonly PriceLine[] {
  const { body, powertrain, colour, wheels, packages } = resolve(config)

  return [
    { source: 'body', id: body.id, price: body.basePrice },
    { source: 'powertrain', id: powertrain.id, price: powertrain.price },
    { source: 'colour', id: colour.id, price: colour.price },
    { source: 'wheels', id: wheels.id, price: wheels.price },
    ...packages.map((pkg): PriceLine => ({
      source: 'package',
      id: pkg.id,
      price: pkg.price,
    })),
  ]
}

export function total(config: Config): number {
  return lines(config).reduce((sum, line) => sum + line.price, 0)
}

const currencyByLocale = new Map<string, Intl.NumberFormat>()
const numberByKey = new Map<string, Intl.NumberFormat>()

export function formatEUR(n: number, locale: string): string {
  let format = currencyByLocale.get(locale)
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    })
    currencyByLocale.set(locale, format)
  }
  return format.format(n)
}

export function formatNumber(
  v: number,
  digits: number,
  locale: string,
): string {
  const key = `${locale}:${digits}`
  let format = numberByKey.get(key)
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
    numberByKey.set(key, format)
  }
  return format.format(v)
}
