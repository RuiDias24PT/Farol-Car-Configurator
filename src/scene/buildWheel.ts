import * as THREE from 'three'

import type { WheelId } from '@/catalog/types'

import type { CarMaterials } from './materials'

type WheelStyle = 'aero' | 'sport' | 'multi'

const STYLE: Record<WheelId, WheelStyle> = {
  aero19: 'aero',
  sport20: 'sport',
  multi21: 'multi',
}

// Bigger rims leave thinner sidewalls.
const RIM_RATIO: Record<WheelStyle, number> = {
  aero: 0.6,
  sport: 0.67,
  multi: 0.74,
}

/**
 * Centred on the origin, rolling axis along z, styled face on +z. The left
 * wheels are the same object turned half a revolution, so the face always
 * ends up outside.
 */
export function buildWheel(
  wheel: WheelId,
  radius: number,
  width: number,
  materials: CarMaterials,
): THREE.Group {
  const style = STYLE[wheel]
  const rimRadius = radius * RIM_RATIO[style]
  const outer = width / 2
  const faceZ = outer - 3
  const group = new THREE.Group()

  const add = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    z = 0,
  ) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.z = z
    group.add(mesh)
    return mesh
  }
  // CylinderGeometry stands along y; a wheel's axle is z.
  const onAxle = (mesh: THREE.Mesh) => {
    mesh.rotation.x = Math.PI / 2
    return mesh
  }

  // Open-ended, with ring sidewalls, so the rim shows through.
  const tread = onAxle(
    add(
      new THREE.CylinderGeometry(radius, radius, width, 48, 1, true),
      materials.tire,
    ),
  )
  tread.castShadow = true

  const sidewall = new THREE.RingGeometry(rimRadius * 0.99, radius, 48)
  add(sidewall, materials.tire, outer)
  add(sidewall, materials.tire, -outer).rotation.y = Math.PI

  onAxle(
    add(
      new THREE.CylinderGeometry(
        rimRadius,
        rimRadius,
        width * 0.92,
        40,
        1,
        true,
      ),
      materials.rim,
    ),
  )
  onAxle(
    add(
      new THREE.CylinderGeometry(
        rimRadius * 0.7,
        rimRadius * 0.7,
        width * 0.26,
        30,
      ),
      materials.disc,
      -width * 0.12,
    ),
  )
  add(
    new THREE.BoxGeometry(rimRadius * 0.3, rimRadius * 0.52, width * 0.2),
    materials.caliper,
    -width * 0.12,
  ).position.x = -rimRadius * 0.46

  if (style === 'aero') {
    onAxle(
      add(
        new THREE.CylinderGeometry(rimRadius * 0.98, rimRadius * 0.98, 5, 44),
        materials.rim,
        faceZ - 2,
      ),
    )
    const slot = new THREE.BoxGeometry(rimRadius * 0.2, rimRadius * 0.5, 3)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const mesh = add(slot, materials.trim, faceZ + 1)
      mesh.position.x = Math.cos(angle) * rimRadius * 0.55
      mesh.position.y = Math.sin(angle) * rimRadius * 0.55
      mesh.rotation.z = angle
    }
  } else {
    const count = style === 'sport' ? 5 : 10
    const spoke = new THREE.BoxGeometry(
      rimRadius * (style === 'multi' ? 0.13 : 0.28),
      rimRadius * 1.55,
      8,
    )
    for (let i = 0; i < count; i++) {
      add(spoke, materials.rim, faceZ - 3).rotation.z =
        (i / count) * Math.PI * 2
    }
  }

  add(new THREE.TorusGeometry(rimRadius * 0.97, 4, 8, 44), materials.rim, faceZ)
  onAxle(
    add(
      new THREE.CylinderGeometry(rimRadius * 0.22, rimRadius * 0.22, 10, 24),
      materials.rim,
      faceZ + 1,
    ),
  )

  return group
}
