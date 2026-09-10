import { useT } from '@/i18n/useT'
import { resolve } from '@/state/constraints'
import { useConfig, useDispatch } from '@/state/useStore'

import { InfoPopover } from './InfoPopover'
import { LangMenu } from './LangMenu'
import './Masthead.css'
import { PriceBar } from './PriceBar'
import { ThemeToggle } from './ThemeToggle'

export function Masthead() {
  const config = useConfig()
  const dispatch = useDispatch()
  const t = useT()

  const { body } = resolve(config)
  const bodyCopy = t.bodies[body.id]

  return (
    <div className="topbar-inner">
      <div>
        <div className="marque">Farol</div>
        <div className="model-line">
          {bodyCopy.name} · {bodyCopy.kind}
        </div>
      </div>

      <div className="price-block">
        <PriceBar />
        <InfoPopover />
        <ThemeToggle />
        <LangMenu />
        <button
          className="ghost"
          type="button"
          onClick={() => dispatch({ type: 'reset' })}
        >
          {t.ui.reset}
        </button>
      </div>
    </div>
  )
}
