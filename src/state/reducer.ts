import { DEFAULT_CONFIG } from '@/catalog'
import type {
  BodyId,
  ColourId,
  Config,
  PackageId,
  PowertrainId,
  StepId,
  WheelId,
} from '@/catalog/types'

import { addPackage, reconcile } from './constraints'
import type { Note, Reconciled } from './constraints'

export interface StoreState {
  config: Config
  notes: readonly Note[]
}

export type Action =
  | { type: 'setBody'; id: BodyId }
  | { type: 'setPowertrain'; id: PowertrainId }
  | { type: 'setColour'; id: ColourId }
  | { type: 'setWheels'; id: WheelId }
  | { type: 'addPackage'; id: PackageId }
  | { type: 'removePackage'; id: PackageId }
  | { type: 'goToStep'; id: StepId }
  | { type: 'load'; config: Config }
  | { type: 'reset' }
  | { type: 'dismissNotes' }


type ConfigAction = Exclude<Action, { type: 'dismissNotes' }>

const NO_NOTES: readonly Note[] = Object.freeze([])

function set<K extends 'body' | 'powertrain' | 'colour' | 'wheels' | 'step'>(
  config: Config,
  key: K,
  id: Config[K],
): Config {
  if (config[key] === id) return config
  const next = { ...config }
  next[key] = id
  return next
}

function apply(config: Config, action: ConfigAction): Reconciled {
  switch (action.type) {
    case 'setBody':
      return reconcile(set(config, 'body', action.id))
    case 'setPowertrain':
      return reconcile(set(config, 'powertrain', action.id))
    case 'setColour':
      return reconcile(set(config, 'colour', action.id))
    case 'setWheels':
      return reconcile(set(config, 'wheels', action.id))
    case 'goToStep':
      return reconcile(set(config, 'step', action.id))
    case 'addPackage':
      return addPackage(config, action.id)
    case 'removePackage': {
      if (!config.packages.includes(action.id)) return reconcile(config)
      const packages = config.packages.filter((id) => id !== action.id)
      return reconcile({ ...config, packages })
    }
    case 'load':
      return reconcile(action.config)
    case 'reset':
      return reconcile(DEFAULT_CONFIG)
  }
}

export function reducer(state: StoreState, action: Action): StoreState {
  if (action.type === 'dismissNotes') {
    return state.notes.length === 0 ? state : { ...state, notes: NO_NOTES }
  }

  const next = apply(state.config, action)

  const unchanged =
    next.config === state.config &&
    next.notes.length === 0 &&
    state.notes.length === 0

  return unchanged ? state : next
}

export function initStore(config: Config = DEFAULT_CONFIG): StoreState {
  return reconcile(config)
}
