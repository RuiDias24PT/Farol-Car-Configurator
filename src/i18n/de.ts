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

export const de = {
  name: 'Deutsch',
  tag: 'DE',
  intl: 'de-DE',
  units: { power: 'PS' },

  ui: {
    priceLabel: 'Preis mit Optionen',
    reset: 'Neu beginnen',
    from: 'ab',
    included: 'inkl.',
    total: 'Gesamt',
    back: 'Zurück',
    next: 'Weiter',
    reserve: 'Reservieren',
    theme: 'Design',
    language: 'Sprache',
    info: 'Information',
    shareText:
      'Die gesamte Konfiguration steht in der Adresse. Link speichern oder senden — er öffnet genau dieses Auto.',
    copy: 'Kopieren',
    copied: 'Kopiert',
    reserveNote: 'Prototyp: die Reservierung endet hier.',
    linkFixed: 'Link angepasst:',
  },

  views: { front: '3/4 vorn', side: 'Profil', rear: '3/4 hinten', top: 'hoch' },

  specs: {
    power: 'Leistung',
    wheels: 'Räder',
    accel: '0–100',
    consumption: 'Verbrauch',
    co2: 'g CO₂/km',
    powerShort: 'Leistung',
  },

  steps: {
    body: {
      tab: 'Karosserie',
      title: 'Karosserie',
      blurb: 'Vier Karosserien auf einer Plattform.',
    },
    powertrain: {
      tab: 'Antrieb',
      title: 'Antrieb',
      blurb: 'Verbrauch und Emissionen im kombinierten WLTP-Zyklus.',
    },
    colour: {
      tab: 'Lackierung',
      title: 'Außenlackierung',
      blurb: 'Uni-Lack serienmäßig; Metallic gegen Aufpreis.',
    },
    wheels: {
      tab: 'Räder',
      title: 'Räder',
      blurb: 'Das Rad verändert den Verbrauch so stark wie der Motor.',
    },
    packages: {
      tab: 'Ausstattung',
      title: 'Ausstattung',
      blurb: 'Pakete, die häufig zusammen bestellt werden.',
    },
    summary: {
      tab: 'Übersicht',
      title: 'Übersicht',
      blurb: 'Die komplette Konfiguration, mit Link zum Speichern.',
    },
  },

  bodies: {
    serra: {
      name: 'Serra',
      def: 'der',
      em: 'den',
      kind: 'SUV',
      line: '21 cm Bodenfreiheit und Dachreling serienmäßig.',
      specs: ['4,68 m', '720 l', '5 Sitze'],
    },
    solar: {
      name: 'Solar',
      def: 'der',
      em: 'den',
      kind: 'Limousine',
      line: 'Das flachste Modell der Reihe, am sparsamsten auf der Autobahn.',
      specs: ['4,94 m', '480 l', '5 Sitze'],
    },
    bairro: {
      name: 'Bairro',
      def: 'der',
      em: 'den',
      kind: 'Kompakt',
      line: 'Einen halben Meter kürzer als die Limousine. Parkt überall.',
      specs: ['4,12 m', '350 l', '5 Sitze'],
    },
    vela: {
      name: 'Vela',
      def: 'der',
      em: 'den',
      kind: 'Kombi',
      line: 'Langes Dach bis zum Heck: 640 l ohne Umklappen der Sitze.',
      specs: ['4,94 m', '640 l', '5 Sitze'],
    },
  },

  powertrains: {
    ice: {
      label: '2.0 Turbo Benzin',
      note: 'Achtstufen-Automatik. Keine Rad-Einschränkungen.',
      rangeLabel: '/100 km',
    },
    hybrid: {
      label: 'Plug-in-Hybrid',
      note: '62 km elektrisch. Lädt in 2:30 h an 7,4 kW.',
      rangeLabel: 'Elektrische Reichweite',
    },
    ev: {
      label: 'eDrive 450',
      note: '77 kWh nutzbare Batterie. 205 kW an Gleichstrom.',
      rangeLabel: 'WLTP-Reichweite',
    },
  },

  colours: {
    porcelain: { label: 'Porzellanweiß', finish: 'Uni' },
    graphite: { label: 'Graphit Metallic', finish: 'Metallic' },
    petrol: { label: 'Petrolblau', finish: 'Metallic' },
    carmine: { label: 'Karminrot', finish: 'Sondermetallic' },
  },

  wheels: {
    aero19: {
      label: '19" Aero',
      effect: '+18 km Reichweite',
      specs: ['225/55 R19', 'Aerodynamische Abdeckung'],
    },
    sport20: {
      label: '20" Sport 5-Speichen',
      effect: 'Referenz der Reihe',
      specs: ['245/45 R20', 'Zweifarbig glanzgedreht'],
    },
    multi21: {
      label: '21" Vielspeichen',
      effect: '−24 km Reichweite',
      specs: ['255/40 R21', 'Niederquerschnittsreifen'],
    },
  },

  packages: {
    winter: {
      label: 'Winterpaket',
      contents: ['Allradantrieb', 'Sitz- und Lenkradheizung', 'Wärmepumpe'],
    },
    assist: {
      label: 'Fahrassistenz Plus',
      contents: [
        'Assistiertes Fahren Level 2',
        'Automatischer Spurwechsel',
        'Ferngesteuertes Parken',
      ],
    },
    sound: {
      label: 'Premium-Audio',
      contents: [
        '16 Lautsprecher, 1.400 W',
        '3D-Klang',
        'Geräuschunterdrückung',
      ],
    },
    tow: {
      label: 'Anhängerkupplung',
      contents: ['Versenkbare Kugel', 'Bis 2.000 kg', 'Rangierassistent'],
    },
  },

  constraints: {
    wheelsNeedElectrified: (p: WheelChange): string =>
      `${p.wheel} gibt es nur für elektrifizierte Versionen — ich bin auf ${p.to} gewechselt.`,
    wheelsNeedBigBody: (p: WheelOnBody): string =>
      `${p.wheel} sind für ${p.body.em} ${p.body.name} nicht homologiert — ich bin auf ${p.to} zurück.`,
    packageBlockedByWheels: (p: PackageOnWheel): string =>
      `Das Paket ${p.pkg} ist mit ${p.wheel} nicht homologiert.`,
    packageNeedsTowBody: (p: PackageOnBody): string =>
      `Das Paket ${p.pkg} gibt es für ${p.body.em} ${p.body.name} nicht.`,
    bodySwappedForPackage: (p: BodyChange): string =>
      `${up(p.from.def)} ${p.from.name} ist nicht für Anhängerbetrieb homologiert — ich habe auf ${p.to.em} ${p.to.name} gewechselt, der bis 2.000 kg zieht.`,
    wheelsSwappedForPackage: (p: WheelChange): string =>
      `${p.wheel} sind für Anhängerbetrieb nicht homologiert — ich bin auf ${p.to} zurück.`,
  },

  blocked: {
    wheelsNeedElectrified: (): string => 'Nur elektrifizierte Versionen',
    wheelsNeedBigBody: (body: BodyRef): string =>
      `Nicht homologiert für ${body.em} ${body.name}`,
    packageBlockedByWheels: (p: { wheel: string }): string =>
      `Nicht verfügbar mit ${p.wheel}`,
    packageNeedsTowBody: (body: BodyRef): string =>
      `Nicht verfügbar für ${body.em} ${body.name}`,
  },

  copilot: {
    head: 'copilot · Nutzung beschreiben',
    intro:
      'Sag mir, wie du das Auto nutzt, und ich wähle Karosserie und Rest. Jede Änderung erscheint als Tool-Aufruf.',
    scripts: [
      {
        chip: 'Familie, Schnee, elektrisch',
        reply:
          'Ich habe die Serra gewählt — Bodenfreiheit und Kofferraum — und den eDrive 450 wegen der 512 km. Das Winterpaket bringt den Allradantrieb.',
      },
      {
        chip: '1.800 kg ziehen',
        reply:
          'Die Anhängerkupplung ist bis 2.000 kg zugelassen. Es gibt sie nur für Serra und Vela, und nicht mit 21" Rädern — beides habe ich vorher geregelt.',
      },
      {
        chip: 'Nur ich, Stadtverkehr',
        reply:
          'Für die Stadt reicht der Bairro: der kürzeste und günstigste der Reihe. Elektrisch mit Aero-Rädern ist die effizienteste Kombination.',
      },
      {
        chip: 'Ich brauche Kofferraum',
        reply:
          'Die Vela fasst 640 l mit dem langen Dach, ohne dass die SUV-Höhe den Autobahnverbrauch belastet.',
      },
    ],
  },

  legal: [
    'Portfolio-Prototyp. Farol ist eine erfundene Marke. Das 3D-Modell entsteht im Code aus den Parametern jeder Karosserie, ohne externe Dateien.',
    'Verbrauchs- und Emissionswerte nach WLTP-Zyklus, zu Vergleichszwecken. Die tatsächlichen Werte hängen von Fahrweise, Straßenzustand und Beladung ab. Abbildungen sind beispielhaft.',
  ],
} satisfies Locale
