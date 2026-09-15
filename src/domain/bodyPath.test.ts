import { describe, expect, it } from 'vitest'

import { BODIES } from '@/catalog'

import {
  archPath,
  archRadius,
  bodyPath,
  GROUND,
  VIEW_BOX,
  wheelCentreY,
} from './bodyPath'

interface Point {
  x: number
  y: number
}

function toPoint(token: string): Point {
  const [x, y] = token.split(',').map(Number)
  return { x, y }
}

/**
 * Every coordinate the path names, control points included. Parses the string
 * that actually ships rather than a structure kept alongside it, so a change to
 * the output cannot pass by agreeing with a stale model of itself.
 */
function pathPoints(d: string): Point[] {
  const tokens = d.split(' ')
  const points: Point[] = []

  for (let i = 0; i < tokens.length; i++) {
    switch (tokens[i]) {
      case 'M':
      case 'L':
        points.push(toPoint(tokens[i + 1]))
        i += 1
        break
      case 'C':
        points.push(
          toPoint(tokens[i + 1]),
          toPoint(tokens[i + 2]),
          toPoint(tokens[i + 3]),
        )
        i += 3
        break
      case 'A':
        // rx,ry  x-rotation  large-arc,sweep  x,y
        points.push(toPoint(tokens[i + 4]))
        i += 4
        break
    }
  }

  return points
}

const [vbX, vbY, vbW, vbH] = VIEW_BOX.split(' ').map(Number)

describe('bodyPath', () => {
  for (const body of BODIES) {
    describe(body.id, () => {
      const d = bodyPath(body.geo)
      const a = archRadius(body.geo)

      it('is a closed path with no unresolved numbers', () => {
        expect(d.startsWith('M ')).toBe(true)
        expect(d.endsWith(' Z')).toBe(true)
        expect(d).not.toMatch(/NaN|undefined|Infinity/)
        for (const point of pathPoints(d)) {
          expect(Number.isFinite(point.x)).toBe(true)
          expect(Number.isFinite(point.y)).toBe(true)
        }
      })

      // The trap BUILD-ORDER M8 warns about. Sweep-flag 1, walking the sill left
      // to right, is what makes the arch climb over the wheel; flip it and the
      // body bulges downward and eats the tyre.
      it('cuts both wheel arches upward (sweep flag 1)', () => {
        const arcs = d.match(/A \d+,\d+ 0 \d,\d/g) ?? []
        expect(arcs).toHaveLength(2)
        for (const arc of arcs) {
          expect(arc.endsWith('0 0,1')).toBe(true)
        }
      })

      it('walks the sill front to back, arches clear of each other', () => {
        expect(body.geo.fa - a).toBeGreaterThan(body.geo.nose)
        expect(body.geo.fa + a).toBeLessThan(body.geo.ra - a)
      })

      it('leaves a gap between arch and tyre', () => {
        expect(a).toBeGreaterThan(body.geo.wr)
      })

      it('opens the arch high enough to show the wheel', () => {
        // Apex above the wheel's centre, or the tyre reads as a filled block.
        expect(body.geo.rocker - a).toBeLessThan(wheelCentreY(body.geo))
      })

      it('sits wholly inside the view box', () => {
        const points = [
          ...pathPoints(d),
          // The arc apexes are implied, not named — check them explicitly.
          { x: body.geo.fa, y: body.geo.rocker - a },
          { x: body.geo.ra, y: body.geo.rocker - a },
        ]

        for (const point of points) {
          expect(point.x).toBeGreaterThanOrEqual(vbX)
          expect(point.x).toBeLessThanOrEqual(vbX + vbW)
          expect(point.y).toBeGreaterThanOrEqual(vbY)
          expect(point.y).toBeLessThanOrEqual(vbY + vbH)
        }
      })

      it('rests both wheels on the ground line, inside the view box', () => {
        const cy = wheelCentreY(body.geo)
        expect(cy + body.geo.wr).toBe(GROUND)
        expect(cy - body.geo.wr).toBeGreaterThanOrEqual(vbY)
        expect(GROUND).toBeLessThanOrEqual(vbY + vbH)

        for (const cx of [body.geo.fa, body.geo.ra]) {
          expect(cx - body.geo.wr).toBeGreaterThanOrEqual(vbX)
          expect(cx + body.geo.wr).toBeLessThanOrEqual(vbX + vbW)
        }
      })
    })
  }

  it('draws a different shape for every body', () => {
    const shapes = new Set(BODIES.map((body) => bodyPath(body.geo)))
    expect(shapes.size).toBe(BODIES.length)
  })

  // Bairro's rear overhang (tail - ra = 60) is shorter than its arch radius
  // (wr + 10 = 66), so the arch's trailing edge lands 6 units behind where the
  // bumper curve starts and the sill doubles back on itself. That is the
  // prototype's own geometry and it is sub-pixel on a 120px card (~0.9px), so
  // it is pinned here rather than "fixed" by inventing a shape nobody has seen.
  // This fails loudly if another body ever develops the same overrun.
  it('pins the one body whose rear arch outruns its overhang', () => {
    const overrun = BODIES.filter(
      (body) => body.geo.ra + archRadius(body.geo) > body.geo.tail - 20,
    )
    expect(overrun.map((body) => body.id)).toEqual(['bairro'])
  })
})

describe('archPath', () => {
  for (const body of BODIES) {
    it(`${body.id}: two stroke-only arches matching the body's cutouts`, () => {
      const d = archPath(body.geo)
      const arcs = d.match(/A \d+,\d+ 0 \d,\d/g) ?? []

      expect(arcs).toHaveLength(2)
      for (const arc of arcs) {
        expect(arc.endsWith('0 0,1')).toBe(true)
      }
      // Same radius and endpoints as the cutouts in bodyPath, or the gap drifts.
      const a = archRadius(body.geo)
      expect(d).toContain(`M ${body.geo.fa - a},${body.geo.rocker}`)
      expect(d).toContain(`M ${body.geo.ra - a},${body.geo.rocker}`)
    })
  }
})
