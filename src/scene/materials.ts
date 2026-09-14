import * as THREE from 'three'

// Hex colours are converted to linear by three's ColorManagement on the way
// in. Calling convertSRGBToLinear() on top of that would convert twice.

/**
 * Every material the car uses, created once per scene. A rebuild swaps
 * geometry only, so changing the paint is a colour set on a material that
 * already exists, and materials are disposed once, with the scene.
 */
export function createMaterials() {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: 0xe8e9e6,
      metalness: 0.26,
      roughness: 0.38,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.65,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0e1418,
      metalness: 0.25,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.6,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: 0x14181b,
      metalness: 0.4,
      roughness: 0.55,
      envMapIntensity: 0.7,
    }),
    tire: new THREE.MeshStandardMaterial({
      color: 0x14171a,
      metalness: 0,
      roughness: 0.92,
    }),
    rim: new THREE.MeshStandardMaterial({
      color: 0xccd3d8,
      metalness: 1,
      roughness: 0.2,
      envMapIntensity: 1.4,
    }),
    disc: new THREE.MeshStandardMaterial({
      color: 0x565e64,
      metalness: 1,
      roughness: 0.45,
    }),
    caliper: new THREE.MeshStandardMaterial({
      color: 0xa6202b,
      metalness: 0.2,
      roughness: 0.4,
    }),
    lamp: new THREE.MeshPhysicalMaterial({
      color: 0xdfeaf4,
      metalness: 0.1,
      roughness: 0.08,
      clearcoat: 1,
      envMapIntensity: 1.6,
    }),
    tail: new THREE.MeshPhysicalMaterial({
      color: 0xb3202a,
      metalness: 0.1,
      roughness: 0.12,
      clearcoat: 1,
      envMapIntensity: 1.4,
    }),
    charge: new THREE.MeshStandardMaterial({
      color: 0x3fbf95,
      emissive: 0x2f8f70,
      emissiveIntensity: 0.9,
      roughness: 0.4,
    }),
    // Matte and unreflective, so flaps and caps still read on a white body.
    dark: new THREE.MeshStandardMaterial({
      color: 0x161b20,
      metalness: 0.05,
      roughness: 0.85,
      envMapIntensity: 0.25,
    }),
  }
}

export type CarMaterials = ReturnType<typeof createMaterials>

/**
 * Sets the studio on each material directly. With only scene.environment,
 * three (r163+) ignores every material's envMapIntensity and uses 1 — the
 * glass, rims and paint above were each tuned to something else.
 */
export function applyEnvironment(
  materials: CarMaterials,
  texture: THREE.Texture,
) {
  Object.values(materials).forEach((material) => {
    material.envMap = texture
    material.needsUpdate = true
  })
}

export function disposeMaterials(materials: CarMaterials) {
  Object.values(materials).forEach((material) => material.dispose())
}
