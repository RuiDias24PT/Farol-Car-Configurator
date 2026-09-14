import * as THREE from 'three'

/**
 * A softbox-lit backdrop, drawn into a canvas rather than loaded from an
 * image file — keeps the scene asset-free. This is what
 * PMREMGenerator turns into the reflections a clearcoat paint needs:
 * without an environment map, clearcoat and the wheels' fully-metallic rim
 * material have nothing to reflect and render close to black.
 */
function paintStudioCanvas(dark: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height)
  if (dark) {
    sky.addColorStop(0, '#3c4550')
    sky.addColorStop(0.5, '#1c2126')
    sky.addColorStop(1, '#0a0d10')
  } else {
    sky.addColorStop(0, '#e9edf0')
    sky.addColorStop(0.5, '#a9b2b8')
    sky.addColorStop(1, '#454c52')
  }
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Three overhead softbox highlights — what actually sweeps across
  // clearcoat paint as the camera orbits, not the flat sky gradient.
  for (const x of [0.2, 0.5, 0.8]) {
    const box = ctx.createRadialGradient(
      x * canvas.width,
      canvas.height * 0.12,
      0,
      x * canvas.width,
      canvas.height * 0.12,
      canvas.width * 0.12,
    )
    box.addColorStop(
      0,
      dark ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)',
    )
    box.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = box
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return canvas
}

export interface StudioEnvironment {
  texture: THREE.Texture
  dispose(): void
}

export function buildStudioEnvironment(
  renderer: THREE.WebGLRenderer,
  dark: boolean,
): StudioEnvironment {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const source = new THREE.CanvasTexture(paintStudioCanvas(dark))
  source.mapping = THREE.EquirectangularReflectionMapping

  const target = pmrem.fromEquirectangular(source)

  source.dispose()
  pmrem.dispose()

  return {
    texture: target.texture,
    dispose: () => target.dispose(),
  }
}
