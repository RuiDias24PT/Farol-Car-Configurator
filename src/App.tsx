import { AppShell } from './ui/AppShell'
import { CarScene } from './ui/CarScene'
import { StepOptions } from './ui/StepOptions'
import { useUrlSync } from './state/useUrlSync'

export default function App() {
  useUrlSync()

  return <AppShell stage={<CarScene />} panel={<StepOptions />} />
}
