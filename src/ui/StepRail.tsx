import { STEPS } from '@/catalog'
import { useT } from '@/i18n/useT'
import { useSteps } from '@/state/useSteps'

import './StepRail.css'

export function StepRail() {
  const t = useT()
  const { current, isDone, go } = useSteps()

  return (
    <nav className="steps">
      <div className="steps-inner">
        {STEPS.map((id, i) => {
          const active = id === current
          return (
            <button
              key={id}
              type="button"
              className={`step-btn${active ? ' is-active' : ''}${isDone(id) ? ' is-done' : ''}`}
              aria-current={active ? 'step' : undefined}
              onClick={() => go(id)}
            >
              <span className="step-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="step-label">{t.steps[id].tab}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
