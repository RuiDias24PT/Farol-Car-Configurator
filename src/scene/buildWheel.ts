import * as THREE from 'three'

import type { WheelId } from '@/catalog/types'

const RADIAL_SEGMENTS = 48

// How far the rim's face reaches out relative to the tyre's full radius —
// aero covers sit closer to the hub, multi-spoke rims read as larger.
const RIM_RATIO: Record<WheelId, number> = {
  aero19: 0.6,
  sport20: 0.67,
  multi21: 0.74,
}

/**
 * A tyre + rim as a single unit, centred on the origin with its rolling
 * axis along z (so it drops straight into a wheel arch: place it at the
 * axle x, ground-height y, and the car's half-width z).
 */
export function buildWheel(
  style: WheelId,
  radius: number,
  width: number,
): THREE.Group {
  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x14171a,
    roughness: 0.92,
  })
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xccd3d8,
    metalness: 1,
    roughness: 0.2,
  })

  // Open-ended (no caps): the flat sidewall rings below stand in for the
  // tyre's faces, so a capped cylinder would just be hidden geometry.
  const tread = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, width, RADIAL_SEGMENTS, 1, true),
    tireMaterial,
  )
  tread.rotation.x = Math.PI / 2

  const rimRadius = radius * RIM_RATIO[style]
  const sidewallGeometry = new THREE.RingGeometry(
    rimRadius,
    radius,
    RADIAL_SEGMENTS,
  )

  const group = new THREE.Group()
  group.add(tread)

  for (const side of [1, -1] as const) {
    const sidewall = new THREE.Mesh(sidewallGeometry, rimMaterial)
    sidewall.position.z = side * (width / 2)
    // A ring's face points +z by default; the far side needs flipping so
    // both sidewalls face outward instead of one facing into the tyre.
    if (side < 0) sidewall.rotation.y = Math.PI
    group.add(sidewall)
  }

  return group
}
