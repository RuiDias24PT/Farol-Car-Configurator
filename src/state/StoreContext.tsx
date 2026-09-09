import { useReducer } from 'react'
import type { ReactNode } from 'react'

import type { Config } from '@/catalog/types'

import { initStore, reducer } from './reducer'
import { StoreDispatchContext, StoreStateContext } from './useStore'

interface StoreProviderProps {
  children: ReactNode
  initialConfig?: Config
}

export function StoreProvider({ children, initialConfig }: StoreProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialConfig, initStore)

  return (
    <StoreStateContext value={state}>
      <StoreDispatchContext value={dispatch}>{children}</StoreDispatchContext>
    </StoreStateContext>
  )
}
