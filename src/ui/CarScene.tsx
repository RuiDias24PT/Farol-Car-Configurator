import { useCarScene } from '@/scene/useCarScene'
import { useConfig } from '@/state/useStore'

/** Rendered as a direct child of `.stage` — see the `.stage > canvas` rule in Stage.css. */
export function CarScene() {
  const config = useConfig()
  const canvasRef = useCarScene(config)

  return <canvas ref={canvasRef} />
}
