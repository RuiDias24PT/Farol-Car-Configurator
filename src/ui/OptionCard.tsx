import { useId } from 'react'
import type { ReactNode } from 'react'

import './OptionCard.css'

interface OptionCardProps {
  title: string
  kicker?: string
  price: string
  /** Secondary copy. Replaced by `blockedReason` when the option is blocked. */
  line?: string
  /** Silhouette or swatch. Without one the card shows a radio/check mark. */
  media?: ReactNode
  selected: boolean
  /** Packages toggle independently of each other: square mark, not round. */
  multi?: boolean
  blockedReason?: string | null
  onSelect: () => void
  children?: ReactNode
}

export function OptionCard({
  title,
  kicker,
  price,
  line,
  media,
  selected,
  multi = false,
  blockedReason,
  onSelect,
  children,
}: OptionCardProps) {
  const id = useId()
  const blocked = Boolean(blockedReason)
  const text = blocked ? blockedReason : line

  const className = [
    'card',
    selected && 'is-selected',
    blocked && 'is-blocked',
    multi && 'is-multi',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    // aria-disabled, not `disabled`: a disabled button leaves the tab order, so
    // a keyboard user could never land on it to hear *why* it is unavailable.
    <button
      type="button"
      className={className}
      aria-pressed={selected}
      aria-disabled={blocked || undefined}
      aria-labelledby={`${id}-title ${id}-price`}
      aria-describedby={text ? `${id}-line` : undefined}
      onClick={blocked ? undefined : onSelect}
    >
      <span className="card-top">
        {media ?? <span className="mark" aria-hidden="true" />}
        <span className="card-title" id={`${id}-title`}>
          {title}
          {kicker && <span className="card-kicker">{kicker}</span>}
        </span>
        <span className="card-price" id={`${id}-price`}>
          {price}
        </span>
      </span>

      {text && (
        <span className="card-line" id={`${id}-line`}>
          {text}
        </span>
      )}

      {children}
    </button>
  )
}

// Everything inside a <button> must be phrasing content, so these are spans
// styled as lists and grids rather than <ul>/<div>.

export function CardTags({ items }: { items: readonly string[] }) {
  return (
    <span className="tags">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </span>
  )
}

export function CardSpecs({
  items,
}: {
  items: readonly { value: string; label: string }[]
}) {
  return (
    <span className="spec-grid">
      {items.map(({ value, label }) => (
        <span key={label}>
          <b>{value}</b>
          <span>{label}</span>
        </span>
      ))}
    </span>
  )
}

export function CardContents({ items }: { items: readonly string[] }) {
  return (
    <span className="contents">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </span>
  )
}
