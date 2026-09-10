import { AppShell } from './ui/AppShell'
import { useUrlSync } from './state/useUrlSync'

export default function App() {
  useUrlSync()

  return <AppShell />
}
