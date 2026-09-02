export type BodyId = 'serra' | 'solar' | 'bairro' | 'vela'
export type PowertrainId = 'ice' | 'hybrid' | 'ev'
export type ColourId = 'porcelain' | 'graphite' | 'petrol' | 'carmine'
export type WheelId = 'aero19' | 'sport20' | 'multi21'
export type PackageId = 'winter' | 'assist' | 'sound' | 'tow'
export type StepId =
  'body' | 'powertrain' | 'colour' | 'wheels' | 'packages' | 'summary'

export interface BodyGeo {
  wr: number
  fa: number
  ra: number
  nose: number
  tail: number
  rocker: number
  belt: number
  roof: number
  aBase: number
  roofStart: number
  roofEnd: number
  cBase: number
  hoodDrop: number
  rails: boolean
  clad: boolean
}

export interface Body {
  id: BodyId
  basePrice: number
  canTow: boolean
  takesBigWheels: boolean
  geo: BodyGeo
}

// Always kilometres, so the unit is not stored.
export interface PowertrainRange {
  km: number
  kind: 'total' | 'electric'
}

export interface Powertrain {
  id: PowertrainId
  price: number
  hp: number
  zeroTo100Seconds: number
  consumption: number
  consumptionUnit: 'l' | 'kWh'
  co2PerKm: number
  range: PowertrainRange
  electrified: boolean
}

export interface Colour {
  id: ColourId
  hex: string
  price: number
  metallic: boolean
}

export interface Wheel {
  id: WheelId
  price: number
  sizeInches: number
  requiresElectrified: boolean
  needsBigBody: boolean
  blocksPackages: readonly PackageId[]
}

export interface Package {
  id: PackageId
  price: number
  needsTowCapableBody: boolean
}

// The six fields that make up the URL hash.
export interface Config {
  body: BodyId
  powertrain: PowertrainId
  colour: ColourId
  wheels: WheelId
  packages: readonly PackageId[]
  step: StepId
}
