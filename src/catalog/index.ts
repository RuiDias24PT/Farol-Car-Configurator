import type {
  Body,
  Colour,
  Config,
  Package,
  Powertrain,
  StepId,
  Wheel,
  WheelId,
} from './types'

export const BODIES = [
  {
    id: 'serra',
    basePrice: 46_900,
    canTow: true,
    takesBigWheels: true,
    geo: {
      wr: 66,
      fa: 218,
      ra: 672,
      nose: 112,
      tail: 792,
      rocker: 294,
      belt: 178,
      roof: 96,
      aBase: 294,
      roofStart: 382,
      roofEnd: 640,
      cBase: 732,
      hoodDrop: 14,
      rails: true,
      clad: true,
    },
  },
  {
    id: 'solar',
    basePrice: 52_400,
    canTow: false,
    takesBigWheels: true,
    geo: {
      wr: 60,
      fa: 216,
      ra: 678,
      nose: 100,
      tail: 826,
      rocker: 300,
      belt: 196,
      roof: 122,
      aBase: 308,
      roofStart: 392,
      roofEnd: 584,
      cBase: 684,
      hoodDrop: 30,
      rails: false,
      clad: false,
    },
  },
  {
    id: 'bairro',
    basePrice: 29_900,
    canTow: false,
    takesBigWheels: false,
    geo: {
      wr: 56,
      fa: 292,
      ra: 640,
      nose: 214,
      tail: 700,
      rocker: 300,
      belt: 192,
      roof: 118,
      aBase: 356,
      roofStart: 414,
      roofEnd: 592,
      cBase: 654,
      hoodDrop: 18,
      rails: false,
      clad: false,
    },
  },
  {
    id: 'vela',
    basePrice: 49_600,
    canTow: true,
    takesBigWheels: true,
    geo: {
      wr: 60,
      fa: 216,
      ra: 678,
      nose: 100,
      tail: 826,
      rocker: 300,
      belt: 196,
      roof: 116,
      aBase: 308,
      roofStart: 392,
      roofEnd: 748,
      cBase: 796,
      hoodDrop: 22,
      rails: true,
      clad: false,
    },
  },
] as const satisfies readonly Body[]

export const POWERTRAINS = [
  {
    id: 'ice',
    price: 0,
    hp: 190,
    zeroTo100Seconds: 8.4,
    consumption: 6.9,
    consumptionUnit: 'l',
    co2PerKm: 156,
    range: { km: 870, kind: 'total' },
    electrified: false,
  },
  {
    id: 'hybrid',
    price: 6_400,
    hp: 250,
    zeroTo100Seconds: 6.9,
    consumption: 1.4,
    consumptionUnit: 'l',
    co2PerKm: 32,
    range: { km: 62, kind: 'electric' },
    electrified: true,
  },
  {
    id: 'ev',
    price: 11_800,
    hp: 340,
    zeroTo100Seconds: 5.6,
    consumption: 17.8,
    consumptionUnit: 'kWh',
    co2PerKm: 0,
    range: { km: 512, kind: 'total' },
    electrified: true,
  },
] as const satisfies readonly Powertrain[]

export const COLOURS = [
  { id: 'porcelain', hex: '#E8E9E6', price: 0, metallic: false },
  { id: 'graphite', hex: '#3C444B', price: 1_250, metallic: true },
  { id: 'petrol', hex: '#1F3C48', price: 1_250, metallic: true },
  { id: 'carmine', hex: '#8E2027', price: 1_850, metallic: true },
] as const satisfies readonly Colour[]

export const WHEELS = [
  {
    id: 'aero19',
    price: 0,
    sizeInches: 19,
    requiresElectrified: true,
    needsBigBody: false,
    blocksPackages: [],
  },
  {
    id: 'sport20',
    price: 0,
    sizeInches: 20,
    requiresElectrified: false,
    needsBigBody: false,
    blocksPackages: [],
  },
  {
    id: 'multi21',
    price: 1_200,
    sizeInches: 21,
    requiresElectrified: false,
    needsBigBody: true,
    blocksPackages: ['tow'],
  },
] as const satisfies readonly Wheel[]

export const PACKAGES = [
  { id: 'winter', price: 2_200, needsTowCapableBody: false },
  { id: 'assist', price: 3_100, needsTowCapableBody: false },
  { id: 'sound', price: 1_900, needsTowCapableBody: false },
  { id: 'tow', price: 1_150, needsTowCapableBody: true },
] as const satisfies readonly Package[]

// The funnel, in order. The URL carries the step as this array's index.
export const STEPS = [
  'body',
  'powertrain',
  'colour',
  'wheels',
  'packages',
  'summary',
] as const satisfies readonly StepId[]

// Every correction the engine makes to the wheels lands here, so this wheel
// has to stay free and unrestricted: one that cost money would quietly make a
// corrected car more expensive than the one the user asked for, and one with
// requirements of its own could be corrected in turn — rules 1 and 2 would
// chase each other. Both are tests, not hopes.
export const FALLBACK_WHEEL = 'sport20' satisfies WheelId

export const DEFAULT_CONFIG = {
  body: 'serra',
  powertrain: 'ice',
  colour: 'porcelain',
  wheels: FALLBACK_WHEEL,
  packages: [],
  step: 'body',
} as const satisfies Config
