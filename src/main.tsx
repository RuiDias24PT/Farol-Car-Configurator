import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/tokens.css'
import App from './App.tsx'
import { LangProvider } from './i18n/LangContext'
import { StoreProvider } from './state/StoreContext'
import { parseHash } from './state/url'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <StoreProvider initialConfig={parseHash(window.location.hash)}>
        <App />
      </StoreProvider>
    </LangProvider>
  </StrictMode>,
)
