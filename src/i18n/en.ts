import type {
  BodyChange,
  BodyRef,
  Locale,
  PackageOnBody,
  PackageOnWheel,
  WheelChange,
  WheelOnBody,
} from './pt'

const up = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

export const en = {
  name: 'English',
  tag: 'EN',
  intl: 'en-GB',
  units: { power: 'hp' },

  ui: {
    priceLabel: 'Price as configured',
    reset: 'Start over',
    from: 'from',
    included: 'incl.',
    total: 'Total',
    back: 'Back',
    next: 'Continue',
    reserve: 'Reserve',
    theme: 'Theme',
    language: 'Language',
    info: 'Information',
    shareText:
      'The whole configuration lives in the address. Save the link or send it — it opens on exactly this car.',
    copy: 'Copy',
    copied: 'Copied',
    reserveNote: 'Prototype: the booking flow ends here.',
    linkFixed: 'I adjusted the link:',
  },

  views: { front: 'front 3/4', side: 'profile', rear: 'rear 3/4', top: 'high' },

  specs: {
    power: 'Power',
    wheels: 'Wheels',
    accel: '0–62',
    consumption: 'economy',
    co2: 'g CO₂/km',
    powerShort: 'power',
  },

  steps: {
    body: {
      tab: 'Body',
      title: 'Body style',
      blurb: 'Four body styles on one platform.',
    },
    powertrain: {
      tab: 'Powertrain',
      title: 'Powertrain',
      blurb: 'Consumption and emissions on the combined WLTP cycle.',
    },
    colour: {
      tab: 'Paint',
      title: 'Exterior paint',
      blurb: 'Solid paint as standard; metallics carry a surcharge.',
    },
    wheels: {
      tab: 'Wheels',
      title: 'Wheels',
      blurb: 'The wheel changes consumption as much as the engine does.',
    },
    packages: {
      tab: 'Equipment',
      title: 'Equipment',
      blurb: 'Packages that bundle what people usually order together.',
    },
    summary: {
      tab: 'Summary',
      title: 'Summary',
      blurb: 'The full configuration, with the link to keep it.',
    },
  },

  bodies: {
    serra: {
      name: 'Serra',
      def: 'the',
      em: 'the',
      kind: 'SUV',
      line: '21 cm of ground clearance and roof rails as standard.',
      specs: ['4.68 m', '720 l', '5 seats'],
    },
    solar: {
      name: 'Solar',
      def: 'the',
      em: 'the',
      kind: 'Saloon',
      line: 'The lowest car in the range, and the cheapest to run on a motorway.',
      specs: ['4.94 m', '480 l', '5 seats'],
    },
    bairro: {
      name: 'Bairro',
      def: 'the',
      em: 'the',
      kind: 'Compact',
      line: 'Half a metre shorter than the saloon. Parks anywhere.',
      specs: ['4.12 m', '350 l', '5 seats'],
    },
    vela: {
      name: 'Vela',
      def: 'the',
      em: 'the',
      kind: 'Estate',
      line: 'Long roof all the way back: 640 l without folding the seats.',
      specs: ['4.94 m', '640 l', '5 seats'],
    },
  },

  powertrains: {
    ice: {
      label: '2.0 Turbo petrol',
      note: 'Eight-speed automatic. No wheel restrictions.',
      rangeLabel: '/100 km',
    },
    hybrid: {
      label: 'Plug-in hybrid',
      note: '62 km on electric. Charges in 2h30 on a 7.4 kW socket.',
      rangeLabel: 'Electric range',
    },
    ev: {
      label: 'eDrive 450',
      note: '77 kWh usable battery. 205 kW on DC.',
      rangeLabel: 'WLTP range',
    },
  },

  colours: {
    porcelain: { label: 'Porcelain White', finish: 'Solid' },
    graphite: { label: 'Graphite Metallic', finish: 'Metallic' },
    petrol: { label: 'Petrol Blue', finish: 'Metallic' },
    carmine: { label: 'Carmine Red', finish: 'Special metallic' },
  },

  wheels: {
    aero19: {
      label: '19" Aero',
      effect: '+18 km of range',
      specs: ['225/55 R19', 'Aerodynamic cover'],
    },
    sport20: {
      label: '20" Sport 5-spoke',
      effect: 'Range benchmark',
      specs: ['245/45 R20', 'Two-tone diamond cut'],
    },
    multi21: {
      label: '21" Multi-spoke',
      effect: '−24 km of range',
      specs: ['255/40 R21', 'Low-profile tyre'],
    },
  },

  packages: {
    winter: {
      label: 'Winter pack',
      contents: ['All-wheel drive', 'Heated seats and steering wheel', 'Heat pump'],
    },
    assist: {
      label: 'Advanced assist',
      contents: [
        'Level 2 assisted driving',
        'Automatic lane change',
        'Remote parking',
      ],
    },
    sound: {
      label: 'Premium audio',
      contents: ['16 speakers, 1,400 W', '3D sound', 'Noise cancelling'],
    },
    tow: {
      label: 'Towing kit',
      contents: ['Retractable ball', 'Up to 2,000 kg', 'Manoeuvring assistant'],
    },
  },

  constraints: {
    wheelsNeedElectrified: (p: WheelChange): string =>
      `${p.wheel} rims are only offered on electrified cars, so I moved you to ${p.to}.`,
    wheelsNeedBigBody: (p: WheelOnBody): string =>
      `${p.wheel} rims are not homologated on ${p.body.def} ${p.body.name}, so I dropped to ${p.to}.`,
    packageBlockedByWheels: (p: PackageOnWheel): string =>
      `The ${p.pkg} is not homologated with ${p.wheel} rims.`,
    packageNeedsTowBody: (p: PackageOnBody): string =>
      `The ${p.pkg} is not available on ${p.body.def} ${p.body.name}.`,
    bodySwappedForPackage: (p: BodyChange): string =>
      `${up(p.from.def)} ${p.from.name} is not homologated for towing, so I switched to ${p.to.def} ${p.to.name}, which pulls up to 2,000 kg.`,
    wheelsSwappedForPackage: (p: WheelChange): string =>
      `${p.wheel} rims are not homologated for towing, so I dropped to ${p.to}.`,
  },

  blocked: {
    wheelsNeedElectrified: (): string => 'Electrified versions only',
    wheelsNeedBigBody: (body: BodyRef): string =>
      `Not homologated on ${body.def} ${body.name}`,
    packageBlockedByWheels: (p: { wheel: string }): string =>
      `Unavailable with ${p.wheel} rims`,
    packageNeedsTowBody: (body: BodyRef): string =>
      `Unavailable on ${body.def} ${body.name}`,
  },

  copilot: {
    head: 'copilot · describe the use',
    intro:
      'Tell me how you will use the car and I will pick the body and the rest. Every change shows up as a tool call.',
    scripts: [
      {
        chip: 'Family, snow, electric',
        reply:
          'I went with the Serra for the ground clearance and the boot, and the eDrive 450 for its 512 km. The Winter pack is what brings all-wheel drive.',
      },
      {
        chip: 'I need to tow 1,800 kg',
        reply:
          'The towing kit is rated to 2,000 kg. It only exists on the Serra and the Vela, and is not homologated with 21" rims — I sorted both before adding it.',
      },
      {
        chip: 'Just me, city driving',
        reply:
          'For the city the Bairro is enough: shortest and cheapest in the range. Electric with Aero rims is the most efficient combination we build.',
      },
      {
        chip: 'I need a big boot',
        reply:
          'The Vela carries 640 l with its long roof, without the SUV height hurting motorway consumption.',
      },
    ],
  },

  legal: [
    'Portfolio prototype. Farol is a fictional marque. The 3D model is generated in code from each body style’s parameters, with no external assets.',
    'Consumption and emissions figures determined on the WLTP cycle, for comparison purposes. Real figures depend on driving style, road conditions and load. Images are illustrative.',
  ],
} satisfies Locale
