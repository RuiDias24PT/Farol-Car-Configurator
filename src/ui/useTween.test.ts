import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTween } from './useTween'

// A hand-cranked requestAnimationFrame: nothing runs until the test calls
// frame(t), so every intermediate value is observable and deterministic.
let pending = new Map<number, FrameRequestCallback>()
let nextId = 1

function frame(now: number) {
  const due = pending
  pending = new Map()
  act(() => due.forEach((cb) => cb(now)))
}

beforeEach(() => {
  pending = new Map()
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    pending.set(nextId, cb)
    return nextId++
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    pending.delete(id)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTween', () => {
  it('shows the first value immediately, without animating in from zero', () => {
    const { result } = renderHook(() => useTween(46_900))

    expect(result.current).toBe(46_900)
    expect(pending.size).toBe(0)
  })

  it('glides to a new value and lands on it exactly', () => {
    const { result, rerender } = renderHook(({ n }) => useTween(n), {
      initialProps: { n: 0 },
    })

    rerender({ n: 1_000 })
    frame(0)
    expect(result.current).toBe(0)

    frame(210)
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(1_000)

    frame(420)
    expect(result.current).toBe(1_000)
    expect(pending.size).toBe(0)
  })

  it('retargets from the value on screen, never snapping back first', () => {
    const { result, rerender } = renderHook(({ n }) => useTween(n), {
      initialProps: { n: 0 },
    })

    rerender({ n: 1_000 })
    frame(0)
    frame(210)
    const midway = result.current

    rerender({ n: 2_000 })
    frame(5_000) // first frame of the new glide: progress 0
    expect(result.current).toBe(midway)

    frame(5_420)
    expect(result.current).toBe(2_000)
  })

  it('jumps in a single frame when the user asks for reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
    }))
    const { result, rerender } = renderHook(({ n }) => useTween(n), {
      initialProps: { n: 0 },
    })

    rerender({ n: 1_000 })
    frame(0)

    expect(result.current).toBe(1_000)
    expect(pending.size).toBe(0)
    vi.unstubAllGlobals()
  })
})
