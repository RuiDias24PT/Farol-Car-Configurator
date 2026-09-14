import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

import type { BodyGeo } from '@/catalog/types'
import { bodyPath, GROUND } from '@/geometry/bodyPath'

const BEVEL = 11
const CURVE_SEGMENTS = 24

export function up(y: number): number {
  return GROUND - y
}

export function halfWidth(geo: BodyGeo): number {
  return (geo.tail - geo.nose) / 4.75
}

function toShape(geo: BodyGeo): THREE.Shape {
  const svg = `<svg><path d="${bodyPath(geo)}"/></svg>`
  const { paths } = new SVGLoader().parse(svg)
  const [flatShape] = SVGLoader.createShapes(paths[0])

  const points = flatShape
    .getPoints(CURVE_SEGMENTS)
    .map((p) => new THREE.Vector2(p.x, up(p.y)))

  return new THREE.Shape(points)
}

export function buildBody(geo: BodyGeo): THREE.Group {
  const depth = halfWidth(geo) * 2 - BEVEL * 2

  const geometry = new THREE.ExtrudeGeometry(toShape(geo), {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL * 0.72,
    bevelSegments: 5,
    curveSegments: 2,
  })

  geometry.translate(0, 0, -depth / 2)

  // Clearcoat over the base paint is what makes it read as car paint
  // rather than plastic — it needs scene.environment to actually reflect
  // anything, which createCarScene.ts supplies.
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x888888,
    metalness: 0.26,
    roughness: 0.38,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.65,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true

  const group = new THREE.Group()
  group.add(mesh)
  return group
}
