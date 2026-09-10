import type { BodyGeo } from '@/catalog/types'
import {
  archPath,
  bodyPath,
  VIEW_BOX,
  wheelCentreY,
} from '@/geometry/bodyPath'

import './Silhouette.css'

interface SilhouetteProps {
  geo: BodyGeo
  title?: string
}

export function Silhouette({ geo, title }: SilhouetteProps) {
  const cy = wheelCentreY(geo)

  return (
    <svg
      className="silhouette"
      viewBox={VIEW_BOX}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}

      {/* Behind the body, so only the part inside each arch shows. */}
      <circle className="silhouette-wheel" cx={geo.fa} cy={cy} r={geo.wr} />
      <circle className="silhouette-wheel" cx={geo.ra} cy={cy} r={geo.wr} />

      <path className="silhouette-body" d={bodyPath(geo)} />
      <path className="silhouette-arch" d={archPath(geo)} />
    </svg>
  )
}
