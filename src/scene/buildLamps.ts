import * as THREE from 'three'

import type { BodyGeo, Powertrain } from '@/catalog/types'

import { halfWidth, up } from './buildBody'

/**
 * Headlights, grille, taillights, exhausts and the charge flap / fuel cap.
 * Only the last three actually vary by powertrain — an EV has no grille to
 * breathe through and no exhaust to breathe out of, a hybrid keeps one
 * pipe, and only electrified cars get a flap instead of a cap.
 */
export function buildLamps(geo: BodyGeo, powertrain: Powertrain): THREE.Group {
  const group = new THREE.Group()
  const hw = halfWidth(geo)
  const side = hw * 0.9

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xdfeaf4,
    roughness: 0.15,
  })
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xb3202a,
    roughness: 0.2,
  })
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x161b20,
    roughness: 0.85,
  })
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x14181b,
    roughness: 0.55,
  })

  const hoodY = up(geo.belt + geo.hoodDrop) - 20
  for (const sgn of [1, -1] as const) {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(34, 14, 40), lampMat)
    headlight.position.set(geo.nose + 18, hoodY, sgn * (side - 26))
    group.add(headlight)
  }

  // Electric cars don't need to breathe — no grille.
  if (powertrain.id !== 'ev') {
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(18, 34, hw * 1.3),
      darkMat,
    )
    grille.position.set(geo.nose + 7, up(geo.rocker) + 46, 0)
    group.add(grille)
  }

  const tailY = up(geo.belt + 34)
  for (const sgn of [1, -1] as const) {
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(22, 16, 40), tailMat)
    taillight.position.set(geo.tail - 12, tailY, sgn * (side - 10))
    group.add(taillight)
  }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(12, 8, hw * 1.5), tailMat)
  bar.position.set(geo.tail - 8, tailY, 0)
  group.add(bar)

  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(14, 26, hw * 1.3),
    trimMat,
  )
  rearBumper.position.set(geo.tail - 6, up(geo.rocker) + 38, 0)
  group.add(rearBumper)

  // Two pipes on petrol, one on hybrid, none on an EV.
  const exhaustSides =
    powertrain.id === 'ice'
      ? ([1, -1] as const)
      : powertrain.id === 'hybrid'
        ? ([1] as const)
        : ([] as const)
  for (const sgn of exhaustSides) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 7.5, 18, 18),
      trimMat,
    )
    pipe.rotation.z = Math.PI / 2
    pipe.position.set(geo.tail - 6, up(geo.rocker) + 4, sgn * hw * 0.68)
    group.add(pipe)
  }

  const flapX = geo.tail - 92
  const flapY = up(geo.belt) - 26
  const flapZ = hw * 0.99 + 1
  if (powertrain.electrified) {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(32, 24, 5), darkMat)
    flap.position.set(flapX, flapY, flapZ)
    group.add(flap)

    if (powertrain.id === 'ev') {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(3.4, 14, 12),
        new THREE.MeshStandardMaterial({
          color: 0x3fbf95,
          emissive: 0x2f8f70,
          emissiveIntensity: 0.9,
        }),
      )
      led.position.set(flapX + 9, flapY + 6, flapZ + 2.6)
      group.add(led)
    }
  } else {
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 11, 5, 22),
      darkMat,
    )
    cap.rotation.x = Math.PI / 2
    cap.position.set(flapX, flapY, flapZ)
    group.add(cap)
  }

  return group
}
