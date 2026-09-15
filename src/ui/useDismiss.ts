import { useEffect } from 'react'
import type { RefObject } from 'react'

interface DismissOptions {
  open: boolean
  /** Takes the useState setter directly: React guarantees it is stable, so the
   *  listeners aren't torn down and re-added on every render while open. */
  setOpen: (open: boolean) => void
  /** Trigger and panel together: a press inside it is not "outside". */
  container: RefObject<HTMLElement | null>
  /** Where focus goes back to on Escape, so keyboard users aren't dropped on <body>. */
  trigger: RefObject<HTMLElement | null>
}

/** Closes a popover on a press outside it or on Escape. Listeners exist only
 *  while it is open. Because the press is caught at pointerdown, opening one
 *  popover closes any other — its trigger is outside the other's container. */
export function useDismiss({
  open,
  setOpen,
  container,
  trigger,
}: DismissOptions) {
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, setOpen, container, trigger])
}
