import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { LangProvider } from './LangContext'
import { useLang, useT } from './useT'

function Probe() {
  const t = useT()
  const { lang, intl, setLang } = useLang()
  return (
    <div>
      <span data-testid="next">{t.ui.next}</span>
      <span data-testid="lang">{lang}</span>
      <span data-testid="intl">{intl}</span>
      <button onClick={() => setLang('de')}>de</button>
    </div>
  )
}

afterEach(() => {
  localStorage.clear()
})

describe('LangProvider / useT', () => {
  it('serves the locale named by initialLang', () => {
    render(
      <LangProvider initialLang="pt">
        <Probe />
      </LangProvider>,
    )
    expect(screen.getByTestId('next')).toHaveTextContent('Continuar')
    expect(screen.getByTestId('intl')).toHaveTextContent('pt-PT')
  })

  it('setLang swaps the locale and persists to farol.lang', async () => {
    render(
      <LangProvider initialLang="pt">
        <Probe />
      </LangProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'de' }))

    expect(screen.getByTestId('next')).toHaveTextContent('Weiter')
    expect(screen.getByTestId('lang')).toHaveTextContent('de')
    expect(localStorage.getItem('farol.lang')).toBe('de')
    expect(document.documentElement.lang).toBe('de')
  })

  it('throws when used outside a provider', () => {
    expect(() => render(<Probe />)).toThrow(/no <LangProvider>/)
  })
})
