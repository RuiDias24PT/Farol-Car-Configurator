import { createContext, useContext } from 'react'

import type { ViewId } from '@/catalog/types'

type SetView = (view: ViewId) => void

export interface CarViewContextValue {
  /** Safe to call before CarScene has mounted — it's a no-op then. */
  setView: SetView
  /** For useCarScene.ts to publish (or, with null, retract) the live
   *  scene's handler. Not meant for UI code. */
  registerSetView: (handler: SetView | null) => void
}

export const CarViewContext = createContext<CarViewContextValue | null>(null)

export function useCarView(): CarViewContextValue {
  const ctx = useContext(CarViewContext)
  if (!ctx) {
    throw new Error('useCarView: no <CarViewProvider> above this component')
  }
  return ctx
}
