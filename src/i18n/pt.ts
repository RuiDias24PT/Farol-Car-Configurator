/**
 * Portuguese is the reference locale. `type Locale = typeof pt` is derived from
 * this object, and `en` / `de` are written as `satisfies Locale` — so adding a
 * key here without adding it to the other two stops the build. That compile
 * error is the deliverable for this milestone; the shape test is only a backstop.
 *
 * Constraint messages are functions, never concatenated fragments: Portuguese
 * contracts the preposition into the article ("em" + "a Serra" -> "na Serra"),
 * and English and German split the article differently again. A message that
 * received only a name could not do that, so it receives the whole body ref.
 */

/** A body as a message needs it: its name plus the article forms for this locale. */
export interface BodyRef {
  /** Model name, e.g. "Serra" — invariant across locales, but still not in the
   *  catalogue, which stays ids and numbers only. */
  name: string
  /** Bare definite article: pt "a" / "o", en "the", de "der". */
  def: string
  /** Preposition + article as this locale writes it: pt contracted "na" / "no",
   *  en "the", de accusative "den". */
  em: string
}

export interface WheelChange {
  wheel: string
  to: string
}
export interface WheelOnBody {
  wheel: string
  body: BodyRef
  to: string
}
export interface PackageOnWheel {
  pkg: string
  wheel: string
}
export interface PackageOnBody {
  pkg: string
  body: BodyRef
}
export interface BodyChange {
  from: BodyRef
  to: BodyRef
}

/** Sentence-initial article: `def` is stored lowercase for mid-sentence use. */
const up = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

export const pt = {
  name: 'Português',
  tag: 'PT',
  intl: 'pt-PT',
  units: { power: 'cv' },

  ui: {
    priceLabel: 'Preço com opções',
    reset: 'Recomeçar',
    from: 'desde',
    included: 'incl.',
    total: 'Total',
    back: 'Voltar',
    next: 'Continuar',
    reserve: 'Reservar',
    theme: 'Tema',
    language: 'Idioma',
    info: 'Informação',
    shareText:
      'Toda a configuração está no endereço. Guarda o link ou envia-o — abre exactamente neste carro.',
    copy: 'Copiar',
    copied: 'Copiado',
    reserveNote: 'Protótipo: a reserva termina aqui.',
    linkFixed: 'Ajustei o link:',
  },

  views: { front: '3/4 frente', side: 'perfil', rear: '3/4 trás', top: 'alto' },

  specs: {
    power: 'Potência',
    wheels: 'Jantes',
    accel: '0–100',
    consumption: 'consumo',
    co2: 'g CO₂/km',
    powerShort: 'potência',
  },

  steps: {
    body: {
      tab: 'Carroçaria',
      title: 'Carroçaria',
      blurb: 'Quatro carroçarias sobre a mesma plataforma.',
    },
    powertrain: {
      tab: 'Motorização',
      title: 'Motorização',
      blurb: 'Consumos e emissões em ciclo WLTP combinado.',
    },
    colour: {
      tab: 'Cor',
      title: 'Cor exterior',
      blurb: 'Pintura sólida de série; metalizadas com sobretaxa.',
    },
    wheels: {
      tab: 'Jantes',
      title: 'Jantes',
      blurb: 'A jante muda o consumo tanto como o motor.',
    },
    packages: {
      tab: 'Equipamento',
      title: 'Equipamento',
      blurb: 'Pacotes que agrupam o que costuma ser pedido em conjunto.',
    },
    summary: {
      tab: 'Resumo',
      title: 'Resumo',
      blurb: 'A configuração completa, com o link para a guardar.',
    },
  },

  bodies: {
    serra: {
      name: 'Serra',
      def: 'a',
      em: 'na',
      kind: 'SUV',
      line: 'Altura ao solo de 21 cm e barras de tejadilho de série.',
      specs: ['4,68 m', '720 l', '5 lugares'],
    },
    solar: {
      name: 'Solar',
      def: 'o',
      em: 'no',
      kind: 'Berlina',
      line: 'A mais baixa da gama, e a que menos gasta em autoestrada.',
      specs: ['4,94 m', '480 l', '5 lugares'],
    },
    bairro: {
      name: 'Bairro',
      def: 'o',
      em: 'no',
      kind: 'Compacto',
      line: 'Meio metro mais curto do que a berlina. Estaciona em qualquer lugar.',
      specs: ['4,12 m', '350 l', '5 lugares'],
    },
    vela: {
      name: 'Vela',
      def: 'a',
      em: 'na',
      kind: 'Carrinha',
      line: 'Tejadilho longo até à retaguarda: 640 l sem baixar os bancos.',
      specs: ['4,94 m', '640 l', '5 lugares'],
    },
  },

  powertrains: {
    ice: {
      label: '2.0 Turbo Gasolina',
      note: 'Caixa automática de 8 velocidades. Sem restrições de jantes.',
      rangeLabel: '/100 km',
    },
    hybrid: {
      label: 'Híbrido Plug-in',
      note: '62 km em elétrico. Carrega em 2h30 numa tomada de 7,4 kW.',
      rangeLabel: 'Autonomia elétrica',
    },
    ev: {
      label: 'eDrive 450',
      note: 'Bateria de 77 kWh úteis. 205 kW em corrente contínua.',
      rangeLabel: 'Autonomia WLTP',
    },
  },

  colours: {
    porcelain: { label: 'Branco Porcelana', finish: 'Sólida' },
    graphite: { label: 'Grafite Metalizado', finish: 'Metalizada' },
    petrol: { label: 'Azul Petróleo', finish: 'Metalizada' },
    carmine: { label: 'Vermelho Carmim', finish: 'Metalizada especial' },
  },

  wheels: {
    aero19: {
      label: '19" Aero',
      effect: '+18 km de autonomia',
      specs: ['225/55 R19', 'Tampa aerodinâmica'],
    },
    sport20: {
      label: '20" Sport 5 raios',
      effect: 'Referência da gama',
      specs: ['245/45 R20', 'Diamantada bicolor'],
    },
    multi21: {
      label: '21" Multi-raio',
      effect: '−24 km de autonomia',
      specs: ['255/40 R21', 'Pneu de perfil baixo'],
    },
  },

  packages: {
    winter: {
      label: 'Pacote Inverno',
      contents: [
        'Tração integral',
        'Bancos e volante aquecidos',
        'Bomba de calor',
      ],
    },
    assist: {
      label: 'Assistência Avançada',
      contents: [
        'Condução assistida nível 2',
        'Mudança de faixa automática',
        'Estacionamento remoto',
      ],
    },
    sound: {
      label: 'Áudio Premium',
      contents: ['16 colunas, 1 400 W', 'Som 3D', 'Cancelamento de ruído'],
    },
    tow: {
      label: 'Kit de Reboque',
      contents: ['Rótula retrátil', 'Até 2 000 kg', 'Assistente de manobra'],
    },
  },

  /** The correction toast: what the engine changed, and why. */
  constraints: {
    wheelsNeedElectrified: (p: WheelChange): string =>
      `As jantes ${p.wheel} só existem nas versões electrificadas — passei para ${p.to}.`,
    wheelsNeedBigBody: (p: WheelOnBody): string =>
      `As jantes ${p.wheel} não são homologadas ${p.body.em} ${p.body.name} — desci para ${p.to}.`,
    packageBlockedByWheels: (p: PackageOnWheel): string =>
      `O ${p.pkg} não é homologado com jantes ${p.wheel}.`,
    packageNeedsTowBody: (p: PackageOnBody): string =>
      `O ${p.pkg} não está disponível ${p.body.em} ${p.body.name}.`,
    bodySwappedForPackage: (p: BodyChange): string =>
      `${up(p.from.def)} ${p.from.name} não homologa reboque — passei para ${p.to.def} ${p.to.name}, que puxa até 2 000 kg.`,
    wheelsSwappedForPackage: (p: WheelChange): string =>
      `As jantes ${p.wheel} não são homologadas para reboque — desci para ${p.to}.`,
  },

  /** The short badge on a disabled option: why it can't be picked. No "I moved…". */
  blocked: {
    wheelsNeedElectrified: (): string => 'Só em versões electrificadas',
    wheelsNeedBigBody: (body: BodyRef): string =>
      `Não homologada ${body.em} ${body.name}`,
    packageBlockedByWheels: (p: { wheel: string }): string =>
      `Indisponível com jantes ${p.wheel}`,
    packageNeedsTowBody: (body: BodyRef): string =>
      `Indisponível ${body.em} ${body.name}`,
  },

  copilot: {
    head: 'copiloto · descreve o uso',
    intro:
      'Diz-me como vais usar o carro e eu escolho a carroçaria e o resto. Cada alteração aparece como chamada de tool.',
    scripts: [
      {
        chip: 'Família, neve, elétrico',
        reply:
          'Fui à Serra pela altura ao solo e pela bagageira, e ao eDrive 450 pelos 512 km. O Pacote Inverno é o que traz a tração integral.',
      },
      {
        chip: 'Preciso de rebocar 1 800 kg',
        reply:
          'O Kit de Reboque suporta 2 000 kg. Só existe na Serra e na Vela, e não é homologado com jantes de 21" — tratei disso antes de o juntar.',
      },
      {
        chip: 'Só eu, para a cidade',
        reply:
          'Para cidade, o Bairro chega: é o mais curto e o mais barato. Elétrico com jantes Aero é a combinação mais eficiente da gama.',
      },
      {
        chip: 'Preciso de mala grande',
        reply:
          'A Vela leva 640 l com o tejadilho longo, sem a altura do SUV a penalizar o consumo em autoestrada.',
      },
    ],
  },

  legal: [
    'Protótipo de portefólio. Farol é uma marca fictícia. O modelo 3D é gerado por código a partir dos parâmetros de cada carroçaria, sem ficheiros externos.',
    'Valores de consumo e emissões determinados segundo o ciclo WLTP, para efeitos de comparação. Os valores reais dependem do estilo de condução, do estado da estrada e da carga. Imagens meramente ilustrativas.',
  ],
}

export type Locale = typeof pt
