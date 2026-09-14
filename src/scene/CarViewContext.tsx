import { useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

import type { ViewId } from '@/catalog/types'

import { CarViewContext } from './useCarView'

type SetView = (view: ViewId) => void

/**
 * Bridges Stage.tsx's view buttons to CarScene's camera. Stage only ever
 * sees CarScene as an opaque `children` slot, so this crosses that gap
 * without prop drilling through a ReactNode.
 */
export function CarViewProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<SetView | null>(null)

  const registerSetView = useCallback((handler: SetView | null) => {
    handlerRef.current = handler
  }, [])

  const setView = useCallback((view: ViewId) => {
    handlerRef.current?.(view)
  }, [])

  return (
    <CarViewContext value={{ setView, registerSetView }}>
      {children}
    </CarViewContext>
  )
}
