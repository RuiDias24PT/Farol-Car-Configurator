import type { ReactNode } from 'react'

import { useT } from '@/i18n/useT'
import { useSteps } from '@/state/useSteps'

import './StepPanel.css'

interface StepPanelProps {
  children?: ReactNode
}

export function StepPanel({ children }: StepPanelProps) {
  const t = useT()
  const { current, prev, next, go } = useSteps()

  const copy = t.steps[current]

  return (
    <aside className="panel">
      <div className="panel-head">
        <h2>{copy.title}</h2>
        <p>{copy.blurb}</p>
      </div>

      <div className="panel-body">{children}</div>

      <div className="panel-foot">
        <button
          className="btn btn-ghost"
          type="button"
          disabled={!prev}
          onClick={() => prev && go(prev)}
        >
          {t.ui.back}
        </button>
        {/* On the last step this becomes the Reserve CTA. It stays inert until
            M9 gives it the reserveNote panel to open. */}
        <button
          className="btn btn-primary"
          type="button"
          disabled={!next}
          onClick={() => next && go(next)}
        >
          {next ? t.ui.next : t.ui.reserve}
        </button>
      </div>
    </aside>
  )
}
