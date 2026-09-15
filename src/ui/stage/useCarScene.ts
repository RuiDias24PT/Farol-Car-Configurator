import { useEffect, useRef } from 'react'

import type { Config } from '@/catalog/types'
import { createCarScene } from '@/scene/createCarScene'
import type { CarScene } from '@/scene/createCarScene'

import { useCarView } from './useCarView'

/**
 * Owns the scene's lifecycle: creates it once the canvas exists, sizes it to
 * the `.stage` box (not the window — it's a grid cell, not the viewport),
 * drives the render loop, and disposes everything on cleanup. StrictMode
 * double-mounts this in dev, so a leak here means a leak on every real
 * mount too.
 *
 * Config changes are handled separately, by calling update() on the
 * existing scene rather than tearing it down — see createCarScene.ts for
 * which changes trigger a rebuild versus a cheap in-place update.
 */
export function useCarScene(config: Config) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<CarScene | null>(null)
  // Only the value present on the very first render matters here — the
  // mount effect below intentionally runs once, not on every config change.
  const initialConfigRef = useRef(config)
  const { registerSetView } = useCarView()

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const scene = createCarScene(canvas, initialConfigRef.current)
    // Without WebGL the rest of the stage still works; an uncaught throw
    // here would unmount the whole app instead.
    if (!scene) {
      canvas.hidden = true
      return
    }
    sceneRef.current = scene
    scene.resize(parent.clientWidth, parent.clientHeight)
    registerSetView(scene.setView)

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) scene.resize(width, height)
    })
    observer.observe(parent)

    // Two separate sources for "the theme changed": an explicit
    // light/dark pick (the data-theme attribute ThemeToggle.tsx sets) and
    // the "auto" case, which tracks the OS preference instead. useTheme.ts
    // has no shared state to subscribe to for either — see the comment on
    // isDarkTheme() in createCarScene.ts.
    const themeObserver = new MutationObserver(() => scene.refreshTheme())
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onColorSchemeChange = () => scene.refreshTheme()
    colorSchemeQuery?.addEventListener('change', onColorSchemeChange)

    let frame = 0
    const loop = () => {
      scene.render()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      themeObserver.disconnect()
      colorSchemeQuery?.removeEventListener('change', onColorSchemeChange)
      registerSetView(null)
      scene.dispose()
      sceneRef.current = null
    }
    // registerSetView is stable (useCallback with no deps in
    // CarViewContext.tsx) — this effect is still mount-once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    sceneRef.current?.update(config)
  }, [config])

  return canvasRef
}
