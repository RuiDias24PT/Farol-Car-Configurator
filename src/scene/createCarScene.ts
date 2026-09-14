import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { BODIES } from '@/catalog'

import { buildBody, up } from './buildBody'

// Not yet driven by the user's actual selection — that's the next slice,
// once rebuild-on-change exists. For now every scene shows the default body.
const PLACEHOLDER_GEO = BODIES[0].geo

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

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 20, 8000)
  camera.position.set(centre.x + 900, centre.y + 500, 900)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.copy(centre)
  controls.update()

  scene.add(new THREE.HemisphereLight(0xdfe8ee, 0x1a1f23, 0.6))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(centre.x - 400, centre.y + 900, 600)
  scene.add(key)

  const body = buildBody(PLACEHOLDER_GEO)
  scene.add(body)

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
      disposeObject(body)
      renderer.dispose()
    },
  }
}
