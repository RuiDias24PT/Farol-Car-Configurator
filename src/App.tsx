import { AppShell } from './ui/AppShell'
import { StepOptions } from './ui/StepOptions'
import { useUrlSync } from './state/useUrlSync'

export default function App() {
  useUrlSync()

  return <AppShell panel={<StepOptions />} />
}
