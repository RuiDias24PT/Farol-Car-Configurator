import { useEffect, useRef } from 'react'

import type { Config } from '@/catalog/types'

import { hashFor, parseHash } from './url'
import { useConfig, useDispatch } from './useStore'

export function useUrlSync(): string {
  const config = useConfig()
  const dispatch = useDispatch()

  const latest = useRef(config)

  const previousStep = useRef(config.step)

  useEffect(() => {
    latest.current = config

    const hash = hashFor(config)
    const stepChanged = previousStep.current !== config.step
    previousStep.current = config.step

    if (window.location.hash === hash) return

    if (stepChanged) window.history.pushState(null, '', hash)
    else window.history.replaceState(null, '', hash)
  }, [config])

  useEffect(() => {
    function onHashChange() {
      const current = latest.current
      if (window.location.hash === hashFor(current)) return

      // `load` reconciles, so an impossible link arrives corrected and carrying
      // its notes. Unknown ids fall back to the car on screen, not the default.
      dispatch({
        type: 'load',
        config: parseHash(window.location.hash, current),
      })
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [dispatch])

  return shareUrlFor(config)
}

/** Lives here because this file is the only one allowed to read `location`.
 *  The hash comes from state, never from the address bar, which can lag behind. */
export function shareUrlFor(config: Config): string {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname}${search}${hashFor(config)}`
}
