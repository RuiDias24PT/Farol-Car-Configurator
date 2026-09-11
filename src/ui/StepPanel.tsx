import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { useLang, useT } from '@/i18n/useT'
import { formatEUR, total } from '@/state/pricing'
import { useSteps } from '@/state/useSteps'
import { useConfig } from '@/state/useStore'

import { NotesStrip } from './NotesStrip'
import './StepPanel.css'

interface StepPanelProps {
  children?: ReactNode
}

export function StepPanel({ children }: StepPanelProps) {
  const t = useT()
  const { intl } = useLang()
  const config = useConfig()
  const { current, prev, next, go } = useSteps()
  const [reserved, setReserved] = useState(false)
  const body = useRef<HTMLDivElement>(null)

  const copy = t.steps[current]

  return (
    <aside className="panel">
      <div className="panel-head">
        <h2>{copy.title}</h2>
        <p>{copy.blurb}</p>
      </div>

      <NotesStrip onDismissed={() => body.current?.focus()} />

      {/* Keyed by step so each step opens scrolled to the top instead of
          inheriting the previous step's scroll position. tabIndex -1 makes it a
          focus target for code (NotesStrip) without adding a Tab stop. */}
      <div className="panel-body" key={current} ref={body} tabIndex={-1}>
        {children}
      </div>

      {!next && reserved && (
        <p className="reserve-note" role="status">
          {t.ui.reserveNote}
        </p>
      )}

      <div className="panel-foot">
        {prev && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => go(prev)}
          >
            {t.ui.back}
          </button>
        )}
        {next ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => go(next)}
          >
            {t.ui.next} · {t.steps[next].tab}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setReserved(true)}
          >
            {t.ui.reserve} · {formatEUR(total(config), intl)}
          </button>
        )}
      </div>
    </aside>
  )
}
