import { createContext, useContext } from 'react'

// Only three of Stage.tsx's four view keys have a camera preset — 'top'
// stays disabled there until M10 defines one. See the comment on VIEWS in
// Stage.tsx for why the fourth key exists without a matching preset.
export type CarView = 'front' | 'side' | 'rear'

type SetView = (view: CarView) => void

export interface CarViewContextValue {
  /** Safe to call even before CarScene has mounted — it's a no-op then. */
  setView: SetView
  /** Called by useCarScene.ts to publish (or, with null, retract) the
   *  live scene's handler. Not meant for UI code. */
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
