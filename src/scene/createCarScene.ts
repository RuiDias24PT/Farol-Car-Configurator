import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { BODIES, DEFAULT_CONFIG, POWERTRAINS } from '@/catalog'

import { buildBody, halfWidth, up } from './buildBody'
import { buildLamps } from './buildLamps'
import { buildWheel } from './buildWheel'
import { buildStudioEnvironment } from './studioEnvironment'

// Not yet driven by the user's actual selection — that's the next slice,
// once rebuild-on-change exists. For now every scene shows the default body,
// wheel and powertrain.
const PLACEHOLDER_GEO = BODIES[0].geo
const PLACEHOLDER_WHEEL = DEFAULT_CONFIG.wheels
const PLACEHOLDER_POWERTRAIN = POWERTRAINS.find(
  (p) => p.id === DEFAULT_CONFIG.powertrain,
)!

const bottom = up(PLACEHOLDER_GEO.rocker)
const top = up(PLACEHOLDER_GEO.roof)
const centre = new THREE.Vector3(
  (PLACEHOLDER_GEO.nose + PLACEHOLDER_GEO.tail) / 2,
  (bottom + top) / 2,
  0,
)

export interface CarScene {
  resize(width: number, height: number): void
  render(): void
  dispose(): void
}

// Read once at creation, matching useTheme.ts's own resolution order. Not
// live — the scene doesn't yet re-read this when the user flips the theme
// toggle, that's refreshTheme(), still to come.
function isDarkTheme(): boolean {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark') return true
  if (attr === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry.dispose()
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]
    materials.forEach((material) => material.dispose())
  })
}

export function createCarScene(canvas: HTMLCanvasElement): CarScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const environment = buildStudioEnvironment(renderer, isDarkTheme())
  scene.environment = environment.texture

  const camera = new THREE.PerspectiveCamera(35, 1, 20, 8000)
  camera.position.set(centre.x + 900, centre.y + 500, 900)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.copy(centre)
  controls.update()

  scene.add(new THREE.HemisphereLight(0xdfe8ee, 0x1a1f23, 0.6))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(centre.x - 400, centre.y + 900, 600)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.bias = -0.0015
  Object.assign(key.shadow.camera, {
    left: -600,
    right: 600,
    top: 500,
    bottom: -300,
    near: 100,
    far: 1800,
  })
  key.shadow.camera.updateProjectionMatrix()
  key.target.position.set(centre.x, 0, 0)
  scene.add(key, key.target)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.ShadowMaterial({ opacity: 0.35 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const body = buildBody(PLACEHOLDER_GEO)
  scene.add(body)

  const lamps = buildLamps(PLACEHOLDER_GEO, PLACEHOLDER_POWERTRAIN)
  scene.add(lamps)

  const wheelRadius = PLACEHOLDER_GEO.wr
  const wheelWidth = wheelRadius * 0.56
  const wheelZ = halfWidth(PLACEHOLDER_GEO) - wheelWidth / 2

  const wheels = [PLACEHOLDER_GEO.fa, PLACEHOLDER_GEO.ra].flatMap((axleX) =>
    ([1, -1] as const).map((side) => {
      const wheel = buildWheel(PLACEHOLDER_WHEEL, wheelRadius, wheelWidth)
      wheel.position.set(axleX, wheelRadius, side * wheelZ)
      // The wheel itself is left/right-symmetric (same rings on both
      // faces), so this has no visible effect yet — it's here because the
      // checklist calls it out, and it stops mattering silently once a
      // wheel gets an asymmetric detail (a valve stem, directional tread).
      if (side < 0) wheel.rotation.y = Math.PI
      return wheel
    }),
  )
  wheels.forEach((wheel) => scene.add(wheel))

  return {
    resize(width, height) {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    render() {
      controls.update()
      renderer.render(scene, camera)
    },
    dispose() {
      controls.dispose()
      environment.dispose()
      disposeObject(body)
      disposeObject(lamps)
      disposeObject(ground)
      wheels.forEach(disposeObject)
      renderer.dispose()
    },
  }
}
