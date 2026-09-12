import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 420

function prefersReducedMotion(): boolean {
  // jsdom and very old browsers have no matchMedia.
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )
}

/** Ease-out cubic: fast start, gentle landing. */
const easeOut = (t: number): number => 1 - (1 - t) ** 3

/**
 * Follows `target`, gliding to each new value over a few hundred milliseconds
 * instead of jumping. Rounded to whole numbers, because every caller is money.
 */
export function useTween(target: number): number {
  const [shown, setShown] = useState(target)

  const shownRef = useRef(target)

  useEffect(() => {
    // Start from wherever the number is *now*. If the target changes mid-glide
    // the cleanup below cancels the old animation and this one picks up from
    // the half-way value, so the figure never snaps back before moving on.
    const from = shownRef.current
    if (from === target) return

    const duration = prefersReducedMotion() ? 0 : DURATION_MS

    let start: number | null = null
    let frame = 0

    function tick(now: number) {
      start ??= now
      const progress =
        duration === 0 ? 1 : Math.min((now - start) / duration, 1)
      const value = Math.round(from + (target - from) * easeOut(progress))

      shownRef.current = value
      setShown(value)

      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return shown
}
