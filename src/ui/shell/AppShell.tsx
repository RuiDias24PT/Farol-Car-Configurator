import type { ReactNode } from 'react'

// Import order is cascade order: AppShell.css must load before the stylesheets
// the region components pull in.
import './AppShell.css'
import { Masthead } from './Masthead'
import { Stage } from '@/ui/stage/Stage'
import { StepPanel } from '@/ui/steps/StepPanel'
import { StepRail } from '@/ui/steps/StepRail'

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
