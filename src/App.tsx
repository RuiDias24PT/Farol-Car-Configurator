import { AppShell } from './ui/shell/AppShell'
import { CarScene } from './ui/stage/CarScene'
import { StepOptions } from './ui/steps/StepOptions'
import { useUrlSync } from './state/useUrlSync'

export default function App() {
  useUrlSync()

  return <AppShell stage={<CarScene />} panel={<StepOptions />} />
}
