import * as THREE from 'three'

import { BODIES, COLOURS, POWERTRAINS, VIEWS } from '@/catalog'
import type {
  BodyId,
  Config,
  PowertrainId,
  ViewId,
  WheelId,
} from '@/catalog/types'

import { buildBody } from './buildBody'
import { buildLamps } from './buildLamps'
import { buildWheel } from './buildWheel'
import {
  applyEnvironment,
  createMaterials,
  disposeMaterials,
} from './materials'
import { buildStudioEnvironment } from './studioEnvironment'

// The field of view is vertical, so the distance is derived from the width:
// the car then fills the same share of the stage whatever the window shape.
const CAR_FILL = 2520
const MIN_RADIUS = 1120
const MAX_RADIUS = 2150

const MIN_ELEVATION = 0.04
const MAX_ELEVATION = 0.62
const AUTO_ROTATE_STEP = 0.0018
const RESUME_AFTER_DRAG_MS = 4000
const RESUME_AFTER_VIEW_MS = 6000
const VIEW_TWEEN_MS = 620

// These intensities were tuned under three's legacy light units, removed in
// r155. Multiplying by π gives the same result under the physical ones.
const LEGACY_LIGHT = Math.PI

export interface CarScene {
  resize(width: number, height: number): void
  update(config: Config): void
  refreshTheme(): void
  setView(view: ViewId): void
  render(): void
  dispose(): void
}

// Matches useTheme.ts's own resolution order. Read from the DOM because
// useTheme() is local state inside ThemeToggle.tsx — there's no shared
// value to subscribe to. useCarScene.ts calls refreshTheme() on changes.
function isDarkTheme(): boolean {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'dark') return true
  if (attr === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function disposeGeometries(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) child.geometry.dispose()
  })
}

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

/** Into (-π, π], so a preset always swings the short way round. */
function wrapAngle(angle: number): number {
  const turn = Math.PI * 2
  return ((((angle + Math.PI) % turn) + turn) % turn) - Math.PI
}

/** Null when the browser can't give us WebGL — the caller decides what then. */
export function createCarScene(
  canvas: HTMLCanvasElement,
  initialConfig: Config,
): CarScene | null {
  let renderer: THREE.WebGLRenderer
  try {
    // alpha: true lets Stage.css's gradient show through the empty canvas.
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
  } catch {
    // Blocked GPU, old device, or jsdom in tests. Only this is caught: any
    // other failure below is a bug and should still surface.
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.6
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  let environment = buildStudioEnvironment(renderer, isDarkTheme())

  const camera = new THREE.PerspectiveCamera(26, 1.9, 20, 8000)

  const key = new THREE.DirectionalLight(0xffffff, 1.05 * LEGACY_LIGHT)
  key.position.set(-260, 620, 420)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.bias = -0.0012
  Object.assign(key.shadow.camera, {
    left: -600,
    right: 600,
    top: 500,
    bottom: -300,
    near: 100,
    far: 1800,
  })
  key.shadow.camera.updateProjectionMatrix()

  const fill = new THREE.DirectionalLight(0xc9dcea, 0.34 * LEGACY_LIGHT)
  fill.position.set(500, 320, -420)

  const rim = new THREE.DirectionalLight(0xffffff, 0.5 * LEGACY_LIGHT)
  rim.position.set(320, 220, 520)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.ShadowMaterial({ opacity: 0.4 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true

  scene.add(
    key,
    key.target,
    fill,
    rim,
    new THREE.HemisphereLight(0xdfe8ee, 0x1a1f23, 0.14 * LEGACY_LIGHT),
    floor,
  )

  // --- camera orbit ---

  const target = new THREE.Vector3(450, 150, 0)
  let radius = 1500
  let azimuth = -0.78
  let elevation = 0.2
  let autoRotate = true
  let idleTimer: number | undefined
  let drag: { x: number; y: number } | null = null
  let tween: {
    fromAzimuth: number
    fromElevation: number
    deltaAzimuth: number
    toElevation: number
    start: number
  } | null = null
  const reducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  function pauseAutoRotate() {
    autoRotate = false
    window.clearTimeout(idleTimer)
  }

  function resumeAutoRotateAfter(ms: number) {
    window.clearTimeout(idleTimer)
    idleTimer = window.setTimeout(() => {
      autoRotate = true
    }, ms)
  }

  const onPointerDown = (event: PointerEvent) => {
    drag = { x: event.clientX, y: event.clientY }
    tween = null
    pauseAutoRotate()
    canvas.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (!drag) return
    azimuth -= (event.clientX - drag.x) * 0.007
    elevation = THREE.MathUtils.clamp(
      elevation + (event.clientY - drag.y) * 0.004,
      MIN_ELEVATION,
      MAX_ELEVATION,
    )
    drag = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = () => {
    if (!drag) return
    drag = null
    resumeAutoRotateAfter(RESUME_AFTER_DRAG_MS)
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)

  // --- the car ---

  // Shared across rebuilds: a rebuild only swaps geometry.
  const materials = createMaterials()
  applyEnvironment(materials, environment.texture)
  const car = new THREE.Group()
  scene.add(car)

  let built: {
    body: BodyId
    wheels: WheelId
    powertrain: PowertrainId
  } | null = null

  function rebuild(config: Config) {
    car.children.forEach(disposeGeometries)
    car.clear()

    const { geo } = BODIES.find((b) => b.id === config.body)!
    const powertrain = POWERTRAINS.find((p) => p.id === config.powertrain)!
    const body = buildBody(geo, materials)
    car.add(body.group, buildLamps(geo, body.halfWidth, powertrain, materials))

    const wheelRadius = geo.wr
    const wheelWidth = wheelRadius * 0.56
    const wheelZ = body.halfWidth * 0.99 - wheelWidth * 0.42
    for (const axle of [geo.fa, geo.ra]) {
      for (const sgn of [1, -1]) {
        const wheel = buildWheel(
          config.wheels,
          wheelRadius,
          wheelWidth,
          materials,
        )
        wheel.position.set(axle, wheelRadius, sgn * wheelZ)
        if (sgn < 0) wheel.rotation.y = Math.PI
        car.add(wheel)
      }
    }

    // One distance for the whole range: switching body shows the real
    // difference in size instead of reframing every car to fit.
    const centreX = (geo.nose + geo.tail) / 2
    target.set(centreX, 168, 0)
    key.target.position.set(centreX, 60, 0)
    key.target.updateMatrixWorld()

    built = {
      body: config.body,
      wheels: config.wheels,
      powertrain: config.powertrain,
    }
  }

  function update(config: Config) {
    if (
      built?.body !== config.body ||
      built.wheels !== config.wheels ||
      built.powertrain !== config.powertrain
    ) {
      rebuild(config)
    }

    const colour = COLOURS.find((c) => c.id === config.colour)!
    materials.paint.color.set(colour.hex)
    // A solid white needs far less metalness than the metallics to stay
    // white rather than going grey.
    materials.paint.metalness = colour.metallic ? 0.3 : 0.08
  }

  update(initialConfig)

  return {
    resize(width, height) {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      radius = THREE.MathUtils.clamp(
        CAR_FILL / camera.aspect,
        MIN_RADIUS,
        MAX_RADIUS,
      )
      camera.updateProjectionMatrix()
    },
    update,
    setView(view) {
      const preset = VIEWS.find((v) => v.id === view)!
      pauseAutoRotate()
      tween = {
        fromAzimuth: azimuth,
        fromElevation: elevation,
        deltaAzimuth: wrapAngle(preset.azimuth - azimuth),
        toElevation: preset.elevation,
        start: performance.now(),
      }
    },
    refreshTheme() {
      // Dark and light studios are different environments, not a different
      // background: rebuild the map rather than tint it.
      environment.dispose()
      environment = buildStudioEnvironment(renderer, isDarkTheme())
      applyEnvironment(materials, environment.texture)
    },
    render() {
      if (tween) {
        const t = Math.min((performance.now() - tween.start) / VIEW_TWEEN_MS, 1)
        const eased = easeInOut(t)
        azimuth = tween.fromAzimuth + tween.deltaAzimuth * eased
        elevation =
          tween.fromElevation +
          (tween.toElevation - tween.fromElevation) * eased
        if (t === 1) {
          tween = null
          resumeAutoRotateAfter(RESUME_AFTER_VIEW_MS)
        }
      } else if (autoRotate && !reducedMotion) {
        azimuth -= AUTO_ROTATE_STEP
      }

      camera.position.set(
        target.x + radius * Math.sin(azimuth) * Math.cos(elevation),
        target.y + radius * Math.sin(elevation),
        target.z + radius * Math.cos(azimuth) * Math.cos(elevation),
      )
      camera.lookAt(target)
      renderer.render(scene, camera)
    },
    dispose() {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      window.clearTimeout(idleTimer)
      car.children.forEach(disposeGeometries)
      disposeMaterials(materials)
      floor.geometry.dispose()
      floor.material.dispose()
      environment.dispose()
      renderer.dispose()
    },
  }
}
