import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { BODIES } from '@/catalog'
import { GROUND } from '@/geometry/bodyPath'

const PLACEHOLDER_GEO = BODIES[0].geo
const up = (y: number) => GROUND - y

const length = PLACEHOLDER_GEO.tail - PLACEHOLDER_GEO.nose
const halfWidth = length / 4.75
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

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(length, top - bottom, halfWidth * 2),
    new THREE.MeshStandardMaterial({ color: 0x888888 }),
  )
  box.position.copy(centre)
  scene.add(box)

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
      box.geometry.dispose()
      ;(box.material as THREE.Material).dispose()
      renderer.dispose()
    },
  }
}
