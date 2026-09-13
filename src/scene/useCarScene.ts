import { useEffect, useRef } from 'react'

import { createCarScene } from './createCarScene'

export function useCarScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const scene = createCarScene(canvas)
    scene.resize(parent.clientWidth, parent.clientHeight)

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) scene.resize(width, height)
    })
    observer.observe(parent)

    let frame = requestAnimationFrame(loop)
    function loop() {
      scene.render()
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      scene.dispose()
    }
  }, [])

  return canvasRef
}
