import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './state/StoreContext'
import { parseHash } from './state/url'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider initialConfig={parseHash(window.location.hash)}>
      <App />
    </StoreProvider>
  </StrictMode>,
)
