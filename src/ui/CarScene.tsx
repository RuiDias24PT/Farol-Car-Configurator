import { useCarScene } from '@/scene/useCarScene'

export function CarScene() {
  const canvasRef = useCarScene()

  return <canvas ref={canvasRef} />
}
