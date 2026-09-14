import * as THREE from 'three'

import type { BodyGeo } from '@/catalog/types'
import { GROUND } from '@/geometry/bodyPath'

import type { CarMaterials } from './materials'

const STEP = 4
const BEVEL = 11

/** The catalogue's frame is SVG's, y-down. three.js is y-up. */
export function up(y: number): number {
  return GROUND - y
}

export function halfWidth(geo: BodyGeo): number {
  return (geo.tail - geo.nose) / 4.75
}

type Knot = readonly [x: number, y: number]

// Smoothstep between neighbouring knots: continuous, and flat at every knot,
// which is what stops the hood, roof and tailgate from kinking.
function profile(knots: readonly Knot[]) {
  return (x: number): number => {
    if (x <= knots[0][0]) return knots[0][1]
    for (let i = 1; i < knots.length; i++) {
      const [bx, by] = knots[i]
      if (x <= bx) {
        const [ax, ay] = knots[i - 1]
        const t = (x - ax) / Math.max(1e-6, bx - ax)
        return ay + (by - ay) * t * t * (3 - 2 * t)
      }
    }
    return knots[knots.length - 1][1]
  }
}

function samples(from: number, to: number): number[] {
  const xs: number[] = []
  if (from <= to) for (let x = from; x <= to; x += STEP) xs.push(x)
  else for (let x = from; x >= to; x -= STEP) xs.push(x)
  return xs
}

function extrudeCentred(
  outline: THREE.Vector2[],
  depth: number,
  bevelThickness: number,
  bevelSize: number,
  bevelSegments: number,
): THREE.ExtrudeGeometry {
  // The sampling runs land on their end points twice; drop the repeats so
  // the triangulator never meets a zero-length edge.
  const points = outline.filter((p, i) => i === 0 || !p.equals(outline[i - 1]))
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(points), {
    depth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments: 2,
  })
  geometry.translate(0, 0, -depth / 2)
  return geometry
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  castShadow = false,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = castShadow
  group.add(mesh)
  return mesh
}

export interface BuiltBody {
  group: THREE.Group
  halfWidth: number
}

export function buildBody(geo: BodyGeo, materials: CarMaterials): BuiltBody {
  const hw = halfWidth(geo)
  const rockerY = up(geo.rocker)
  const beltY = up(geo.belt)
  const roofY = up(geo.roof)
  const hoodY = up(geo.belt + geo.hoodDrop)
  const arch = geo.wr + 10
  const v = (x: number, y: number) => new THREE.Vector2(x, y)

  const top = profile([
    [geo.nose, rockerY + 30],
    [geo.nose + 12, hoodY - 24],
    [geo.nose + 44, hoodY],
    [geo.aBase, beltY],
    [geo.roofStart, roofY],
    [geo.roofEnd, roofY],
    [geo.cBase, beltY],
    [geo.tail - 24, beltY - 4],
    [geo.tail - 6, rockerY + 46],
    [geo.tail, rockerY + 34],
  ])

  const bottom = (x: number) =>
    [geo.fa, geo.ra].reduce((y, axle) => {
      const d = Math.abs(x - axle)
      return d < arch
        ? Math.max(y, rockerY + Math.sqrt(arch * arch - d * d))
        : y
    }, rockerY)

  const group = new THREE.Group()

  // Everything above the beltline is flattened onto it: the cabin belongs
  // to the glass and the roof skin below.
  const lower = extrudeCentred(
    [
      ...samples(geo.nose, geo.tail).map((x) => v(x, Math.min(top(x), beltY))),
      v(geo.tail, Math.min(top(geo.tail), beltY)),
      ...samples(geo.tail, geo.nose).map((x) => v(x, bottom(x))),
      v(geo.nose, bottom(geo.nose)),
    ],
    hw * 2 - BEVEL * 2,
    BEVEL,
    BEVEL * 0.72,
    5,
  )
  addMesh(group, lower, materials.paint, true)

  const cabinHalfWidth = hw * 0.8
  const glassBevel = 10
  const glass = extrudeCentred(
    [
      ...samples(geo.aBase, geo.cBase).map((x) =>
        v(x, Math.max(top(x), beltY - 2)),
      ),
      v(geo.cBase, beltY - 2),
      v(geo.aBase, beltY - 2),
    ],
    cabinHalfWidth * 2 - glassBevel * 2,
    glassBevel,
    glassBevel * 0.8,
    4,
  )
  addMesh(group, glass, materials.glass, true)

  // A painted skin over the top of the glass, so only the pillars and the
  // side windows show dark.
  const roofFrom = geo.roofStart - 14
  const roofTo = geo.roofEnd + 14
  const roof = extrudeCentred(
    [
      ...samples(roofFrom, roofTo).map((x) => v(x, top(x) + 3)),
      ...samples(roofTo, roofFrom).map((x) => v(x, top(x) - 15)),
    ],
    cabinHalfWidth * 0.99 * 2 - 16,
    8,
    7,
    3,
  )
  addMesh(group, roof, materials.paint, true)

  const rocker = extrudeCentred(
    [
      v(geo.fa + arch - 10, rockerY + 16),
      v(geo.ra - arch + 10, rockerY + 16),
      v(geo.ra - arch + 10, rockerY - 2),
      v(geo.fa + arch - 10, rockerY - 2),
    ],
    hw * 2.02 - 12,
    6,
    5,
    2,
  )
  addMesh(group, rocker, materials.trim)

  // Just proud of the bevelled flank, so the details sit on the paint
  // rather than inside it.
  const side = hw - BEVEL + BEVEL * 0.72 + 1
  const span = geo.cBase - geo.aBase
  const seam = new THREE.BoxGeometry(3, beltY - rockerY - 34, 2)
  const beltLine = new THREE.BoxGeometry(span, 4, 2.5)
  const handle = new THREE.BoxGeometry(34, 7, 5)

  for (const sgn of [1, -1]) {
    for (const t of [0.3, 0.58, 0.8]) {
      addMesh(group, seam, materials.trim).position.set(
        geo.aBase + span * t,
        (beltY + rockerY) / 2 + 12,
        sgn * side,
      )
    }
    addMesh(group, beltLine, materials.rim).position.set(
      (geo.aBase + geo.cBase) / 2,
      beltY + 3,
      sgn * side,
    )
    for (const t of [0.36, 0.63]) {
      addMesh(group, handle, materials.rim).position.set(
        geo.aBase + span * t,
        beltY - 16,
        sgn * (side + 1),
      )
    }
  }

  return { group, halfWidth: hw }
}
