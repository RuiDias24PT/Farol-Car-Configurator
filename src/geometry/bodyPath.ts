import type { BodyGeo } from '@/catalog/types'

/**
 * The car outline, as an SVG path, from the same `geo` the 3D scene extrudes
 * (SPEC §1). It lives here rather than in `ui/` because M10's `buildBody` needs
 * the identical curve — a second copy is exactly what the shared parameter set
 * exists to prevent.
 *
 * Coordinate frame: SVG's, so y grows downward. `roof` is the smallest y,
 * `GROUND` the largest.
 */

/** y of the surface both wheels rest on. */
export const GROUND = 358

/** How far the arch is cut beyond the tyre, in the same units. */
export const ARCH_CLEARANCE = 10

/** Frame that holds every body in the catalogue with margin to spare. */
export const VIEW_BOX = '60 60 790 320'

export function archRadius(geo: BodyGeo): number {
  return geo.wr + ARCH_CLEARANCE
}

export function wheelCentreY(geo: BodyGeo): number {
  return GROUND - geo.wr
}

export function bodyPath(geo: BodyGeo): string {
  const a = archRadius(geo)
  const hoodX = geo.nose + 34
  const hoodY = geo.belt + geo.hoodDrop

  return [
    `M ${geo.nose},${geo.rocker}`,

    // Sill, front to back. The two arcs below only cut upward because the path
    // runs left to right with sweep-flag 1: in a y-down frame that is clockwise
    // on screen, so the curve climbs over the top of the wheel. Flip either flag
    // to 0 and the arch bulges downward and swallows the tyre it should clear.
    `L ${geo.fa - a},${geo.rocker}`,
    `A ${a},${a} 0 0,1 ${geo.fa + a},${geo.rocker}`,
    `L ${geo.ra - a},${geo.rocker}`,
    `A ${a},${a} 0 0,1 ${geo.ra + a},${geo.rocker}`,
    `L ${geo.tail - 20},${geo.rocker}`,

    // Rear bumper radius, up the tailgate, over the shoulder to the beltline.
    `C ${geo.tail - 6},${geo.rocker} ${geo.tail},${geo.rocker - 10} ${geo.tail},${geo.rocker - 26}`,
    `L ${geo.tail},${geo.belt + 46}`,
    `C ${geo.tail},${geo.belt + 20} ${geo.tail - 10},${geo.belt + 10} ${geo.tail - 26},${geo.belt + 4}`,
    `L ${geo.cBase},${geo.belt}`,

    // C-pillar up, along the roof, A-pillar down. The short curves at each end
    // are the roof radii; without them the greenhouse reads as a wedge.
    `L ${geo.roofEnd + 8},${geo.roof + 8}`,
    `C ${geo.roofEnd},${geo.roof + 1} ${geo.roofEnd - 4},${geo.roof} ${geo.roofEnd - 14},${geo.roof}`,
    `L ${geo.roofStart + 14},${geo.roof}`,
    `C ${geo.roofStart + 4},${geo.roof} ${geo.roofStart - 2},${geo.roof + 2} ${geo.roofStart - 8},${geo.roof + 8}`,
    `L ${geo.aBase},${geo.belt}`,

    // Hood forward, then down the nose to the bumper face.
    `L ${hoodX},${hoodY}`,
    `C ${hoodX - 16},${hoodY + 4} ${geo.nose + 6},${hoodY + 16} ${geo.nose + 2},${hoodY + 34}`,
    `L ${geo.nose},${geo.rocker - 26}`,
    'Z',
  ].join(' ')
}

/**
 * The two arches again, stroke-only. Painted over the body in the panel colour
 * so the gap between tyre and arch reads at thumbnail size, where a 10-unit
 * clearance would otherwise close up.
 */
export function archPath(geo: BodyGeo): string {
  const a = archRadius(geo)

  return [geo.fa, geo.ra]
    .map(
      (x) =>
        `M ${x - a},${geo.rocker} A ${a},${a} 0 0,1 ${x + a},${geo.rocker}`,
    )
    .join(' ')
}
