import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'

import type { Config } from '@/catalog/types'

import type { Note } from './constraints'
import type { Action, StoreState } from './reducer'

export const StoreStateContext = createContext<StoreState | null>(null)
export const StoreDispatchContext = createContext<Dispatch<Action> | null>(null)

function useStoreState(): StoreState {
  const state = useContext(StoreStateContext)
  if (!state)
    throw new Error('useStore: no <StoreProvider> above this component')
  return state
}

export function useConfig(): Config {
  return useStoreState().config
}

export function useNotes(): readonly Note[] {
  return useStoreState().notes
}

export function useDispatch(): Dispatch<Action> {
  const dispatch = useContext(StoreDispatchContext)
  if (!dispatch) {
    throw new Error('useDispatch: no <StoreProvider> above this component')
  }
  return dispatch
}
