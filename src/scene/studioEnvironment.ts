import * as THREE from 'three'

/**
 * A studio drawn into a canvas rather than loaded from a file, so the scene
 * needs no assets. The softboxes are what sweep across the paint as the car
 * turns; without an environment, clearcoat and the metal rims have nothing
 * to reflect and go dark.
 */
function paintStudio(dark: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 384
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas

  const sky = ctx.createLinearGradient(0, 0, 0, height)
  const stops: [number, string][] = dark
    ? [
        [0, '#3c4550'],
        [0.42, '#232a31'],
        [0.52, '#151a1f'],
        [1, '#0a0d10'],
      ]
    : [
        [0, '#e9edf0'],
        [0.42, '#c3ccd3'],
        [0.53, '#8b959c'],
        [1, '#454c52'],
      ]
  stops.forEach(([offset, colour]) => sky.addColorStop(offset, colour))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  const softboxes = [
    [0.1, 0.06, 0.2, 0.16],
    [0.44, 0.02, 0.22, 0.2],
    [0.78, 0.08, 0.16, 0.14],
  ]
  for (const [bx, by, bw, bh] of softboxes) {
    const x = bx * width
    const y = by * height
    const w = bw * width
    const h = bh * height
    const glow = ctx.createLinearGradient(0, y, 0, y + h)
    glow.addColorStop(0, `rgba(255,255,255,${dark ? 0.9 : 0.78})`)
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(x, y, w, h)
  }

  ctx.fillStyle = `rgba(255,255,255,${dark ? 0.05 : 0.28})`
  ctx.fillRect(0, height * 0.49, width, height * 0.02)

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
  const source = new THREE.CanvasTexture(paintStudio(dark))
  source.mapping = THREE.EquirectangularReflectionMapping
  // PMREMGenerator renders this into a 3D-array target, and WebGL2 refuses
  // flipY/premultiplyAlpha on 3D uploads (it logs rather than throws).
  // CanvasTexture turns flipY on by default.
  source.flipY = false
  source.premultiplyAlpha = false

  const target = pmrem.fromEquirectangular(source)
  source.dispose()
  pmrem.dispose()

  return {
    texture: target.texture,
    dispose: () => target.dispose(),
  }
}
