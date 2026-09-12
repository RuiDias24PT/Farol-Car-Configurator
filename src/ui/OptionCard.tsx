import { useId } from 'react'
import type { ReactNode } from 'react'

import './OptionCard.css'

interface OptionCardProps {
  title: string
  kicker?: string
  price: string
  line?: string
  media?: ReactNode
  selected: boolean
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
