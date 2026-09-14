import * as THREE from 'three'

import type { BodyGeo, Powertrain } from '@/catalog/types'

import { up } from './buildBody'
import type { CarMaterials } from './materials'

/**
 * Lights, grille, exhausts and the filler. Grille, exhausts and filler vary
 * by powertrain: an EV has nothing to cool through the nose and nothing to
 * breathe out, a hybrid keeps one pipe, and electrified cars get a charge
 * flap instead of a fuel cap.
 */
export function buildLamps(
  geo: BodyGeo,
  halfWidth: number,
  powertrain: Powertrain,
  materials: CarMaterials,
): THREE.Group {
  const group = new THREE.Group()
  const add = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    group.add(mesh)
    return mesh
  }

  const isEv = powertrain.id === 'ev'
  const side = halfWidth * 0.9
  const rockerY = up(geo.rocker)
  const lampY = up(geo.belt + geo.hoodDrop) - 20
  const tailY = up(geo.belt + 34)

  const headlight = new THREE.BoxGeometry(34, 14, 40)
  const taillight = new THREE.BoxGeometry(22, 16, 40)
  for (const sgn of [1, -1]) {
    add(headlight, materials.lamp, geo.nose + 18, lampY, sgn * (side - 26))
    add(taillight, materials.tail, geo.tail - 12, tailY, sgn * (side - 10))
  }

  if (!isEv) {
    add(
      new THREE.BoxGeometry(18, 34, halfWidth * 1.3),
      materials.dark,
      geo.nose + 7,
      rockerY + 46,
      0,
    )
  }

  add(
    new THREE.BoxGeometry(12, 8, halfWidth * 1.5),
    materials.tail,
    geo.tail - 8,
    tailY,
    0,
  )
  add(
    new THREE.BoxGeometry(14, 26, halfWidth * 1.3),
    materials.trim,
    geo.tail - 6,
    rockerY + 38,
    0,
  )

  const pipes: number[] = isEv ? [] : powertrain.id === 'hybrid' ? [1] : [-1, 1]
  const pipe = new THREE.CylinderGeometry(7.5, 7.5, 18, 18)
  for (const sgn of pipes) {
    add(
      pipe,
      materials.rim,
      geo.tail - 6,
      rockerY + 4,
      sgn * halfWidth * 0.68,
    ).rotation.z = Math.PI / 2
  }

  // One filler, on the flank the default views face.
  const flapX = geo.tail - 92
  const flapY = up(geo.belt) - 26
  const flapZ = halfWidth * 0.99 + 1
  if (powertrain.electrified) {
    add(new THREE.BoxGeometry(32, 24, 5), materials.dark, flapX, flapY, flapZ)
    if (isEv) {
      add(
        new THREE.SphereGeometry(3.4, 14, 12),
        materials.charge,
        flapX + 9,
        flapY + 6,
        flapZ + 2.6,
      )
    }
  } else {
    add(
      new THREE.CylinderGeometry(11, 11, 5, 22),
      materials.dark,
      flapX,
      flapY,
      flapZ,
    ).rotation.x = Math.PI / 2
  }

  return group
}
