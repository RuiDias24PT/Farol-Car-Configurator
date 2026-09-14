import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { BODIES, COLOURS, POWERTRAINS } from '@/catalog'
import type { BodyId, Config, PowertrainId, WheelId } from '@/catalog/types'

import { buildBody, halfWidth, up } from './buildBody'
import { buildLamps } from './buildLamps'
import { buildWheel } from './buildWheel'
import { buildStudioEnvironment } from './studioEnvironment'

export interface CarScene {
  resize(width: number, height: number): void
  update(config: Config): void
  refreshTheme(): void
  render(): void
  dispose(): void
}

// Matches useTheme.ts's own resolution order. Read independently here
// rather than threading that hook's value in, because useTheme() has no
// shared state to thread — it's local state read only by ThemeToggle.tsx,
// so a second call here wouldn't see that component's changes. Reading the
// DOM directly sidesteps that; see useCarScene.ts for how refreshTheme()
// actually gets called when it changes.
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

export function createCarScene(
  canvas: HTMLCanvasElement,
  initialConfig: Config,
): CarScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  let environment = buildStudioEnvironment(renderer, isDarkTheme())
  scene.environment = environment.texture

  const camera = new THREE.PerspectiveCamera(35, 1, 20, 8000)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  scene.add(new THREE.HemisphereLight(0xdfe8ee, 0x1a1f23, 0.6))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
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
  scene.add(key, key.target)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.ShadowMaterial({ opacity: 0.35 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // The car itself: everything here gets torn down and rebuilt together
  // whenever body, wheels or powertrain change. Colour does not touch any
  // of this — see applyColour below.
  let car: THREE.Object3D[] = []
  let paintMaterial: THREE.MeshPhysicalMaterial | null = null
  let currentBody: BodyId | null = null
  let currentWheel: WheelId | null = null
  let currentPowertrain: PowertrainId | null = null

  function rebuildCar(config: Config) {
    car.forEach((object) => {
      disposeObject(object)
      scene.remove(object)
    })

    const geo = BODIES.find((b) => b.id === config.body)!.geo
    const powertrain = POWERTRAINS.find((p) => p.id === config.powertrain)!

    const body = buildBody(geo)
    const lamps = buildLamps(geo, powertrain)

    const wheelRadius = geo.wr
    const wheelWidth = wheelRadius * 0.56
    const wheelZ = halfWidth(geo) - wheelWidth / 2
    const wheels = [geo.fa, geo.ra].flatMap((axleX) =>
      ([1, -1] as const).map((side) => {
        const wheel = buildWheel(config.wheels, wheelRadius, wheelWidth)
        wheel.position.set(axleX, wheelRadius, side * wheelZ)
        if (side < 0) wheel.rotation.y = Math.PI
        return wheel
      }),
    )

    car = [body.mesh, lamps, ...wheels]
    car.forEach((object) => scene.add(object))
    paintMaterial = body.paintMaterial

    // Re-target the orbit and the shadow-casting light on the new body's
    // centre — bodies differ in length and roofline, so the old pivot can
    // sit outside the new car entirely otherwise. The camera's own
    // position is left alone (see below): only the very first build
    // frames it, so a body swap doesn't yank the view out from under
    // someone who's already orbited.
    const bottom = up(geo.rocker)
    const top = up(geo.roof)
    const centreX = (geo.nose + geo.tail) / 2
    const centreY = (bottom + top) / 2
    controls.target.set(centreX, centreY, 0)
    key.target.position.set(centreX, 0, 0)
    key.target.updateMatrixWorld()

    if (currentBody === null) {
      camera.position.set(centreX + 900, centreY + 500, 900)
    }
    controls.update()

    currentBody = config.body
    currentWheel = config.wheels
    currentPowertrain = config.powertrain
  }

  function update(config: Config) {
    const needsRebuild =
      config.body !== currentBody ||
      config.wheels !== currentWheel ||
      config.powertrain !== currentPowertrain

    if (needsRebuild) rebuildCar(config)

    const hex = COLOURS.find((c) => c.id === config.colour)!.hex
    paintMaterial?.color.set(hex)
  }

  update(initialConfig)

  return {
    resize(width, height) {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    update,
    refreshTheme() {
      // Dark and light studios are different environments, not a
      // different background — rebuild the whole map, don't just recolour
      // the existing one.
      environment.dispose()
      environment = buildStudioEnvironment(renderer, isDarkTheme())
      scene.environment = environment.texture
    },
    render() {
      controls.update()
      renderer.render(scene, camera)
    },
    dispose() {
      controls.dispose()
      environment.dispose()
      car.forEach(disposeObject)
      disposeObject(ground)
      renderer.dispose()
    },
  }
}
