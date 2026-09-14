import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

import type { CarView } from './useCarView'
import { CarViewContext } from './useCarView'

/**
 * Bridges Stage.tsx's view buttons to CarScene's camera. They're siblings
 * under <Stage> — Stage only ever sees CarScene as an opaque `children`
 * slot — so this exists specifically to cross that gap without prop
 * drilling through a ReactNode.
 */
export function CarViewProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((view: CarView) => void) | null>(null)

  const registerSetView = useCallback(
    (handler: ((view: CarView) => void) | null) => {
      handlerRef.current = handler
    },
    [],
  )

  const setView = useCallback((view: CarView) => {
    handlerRef.current?.(view)
  }, [])

  return (
    <CarViewContext value={{ setView, registerSetView }}>
      {children}
    </CarViewContext>
  )
}
