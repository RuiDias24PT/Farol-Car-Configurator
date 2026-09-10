import type { ReactNode } from 'react'

import './AppShell.css'
import { Masthead } from './Masthead'
import { Stage } from './Stage'
import { StepPanel } from './StepPanel'
import { StepRail } from './StepRail'

interface AppShellProps {
  stage?: ReactNode
  panel?: ReactNode
}

export function AppShell({ stage, panel }: AppShellProps) {
  return (
    <>
      <header className="topbar">
        <Masthead />
        <StepRail />
      </header>

      <div className="shell">
        <div className="grid">
          <Stage>{stage}</Stage>
          <StepPanel>{panel}</StepPanel>
        </div>
      </div>
    </>
  )
}
