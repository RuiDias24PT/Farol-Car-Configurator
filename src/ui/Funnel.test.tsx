import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { LangProvider } from '@/i18n/LangContext'
import { StoreProvider } from '@/state/StoreContext'
import { parseHash } from '@/state/url'

function renderApp(hash = '') {
  window.history.replaceState(null, '', `/${hash}`)
  return render(
    <LangProvider initialLang="en">
      <StoreProvider initialConfig={parseHash(window.location.hash)}>
        <App />
      </StoreProvider>
    </LangProvider>,
  )
}

type User = ReturnType<typeof userEvent.setup>

/** Presses Tab until `target` has focus. Fails if it never does — which is
 *  exactly the bug this guards: something only a mouse can reach. */
async function tabTo(user: User, target: HTMLElement) {
  for (let presses = 0; presses < 60; presses++) {
    if (document.activeElement === target) return
    await user.tab()
  }
  throw new Error(`Tab never reached ${target.textContent}`)
}

async function choose(user: User, name: RegExp) {
  await tabTo(user, screen.getByRole('button', { name }))
  await user.keyboard('{Enter}')
}

const panel = () => screen.getByRole('complementary')

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('the funnel, keyboard only', () => {
  it('configures a car end to end without a pointer', async () => {
    const user = userEvent.setup()
    renderApp()

    await choose(user, /^Vela/)
    await choose(user, /Continue · Powertrain/)
    await choose(user, /^eDrive 450/)
    await choose(user, /Continue · Paint/)
    await choose(user, /^Carmine Red/)
    await choose(user, /Continue · Wheels/)
    await choose(user, /^21" Multi-spoke/)
    await choose(user, /Continue · Equipment/)
    await choose(user, /^Advanced assist/)
    await choose(user, /Continue · Summary/)

    const rows = within(panel()).getAllByRole('term')
    expect(rows.map((row) => row.textContent)).toEqual([
      'Vela Estate',
      'eDrive 450',
      'Carmine Red',
      '21" Multi-spoke',
      'Advanced assist',
    ])
    // 49 600 + 11 800 + 1 850 + 1 200 + 3 100
    expect(within(panel()).getByText('€67,550')).toBeInTheDocument()
    expect(window.location.hash).toBe(
      '#/vela/ev/carmine/multi21/assist/summary',
    )
  })

  it('keeps a blocked option focusable, explains it, and ignores Enter', async () => {
    const user = userEvent.setup()
    renderApp('#/vela/ev/porcelain/multi21/-/packages')

    const tow = screen.getByRole('button', { name: /^Towing kit/ })
    expect(tow).toHaveAttribute('aria-disabled', 'true')
    expect(tow).toHaveAccessibleDescription(
      'Unavailable with 21" Multi-spoke rims',
    )

    await tabTo(user, tow)
    await user.keyboard('{Enter}')

    expect(tow).toHaveAttribute('aria-pressed', 'false')
    expect(window.location.hash).toBe('#/vela/ev/porcelain/multi21/-/packages')
  })
})

describe('the notes strip', () => {
  it('reports a correction, and dismissing it keeps focus inside the panel', async () => {
    const user = userEvent.setup()
    renderApp('#/serra/ice/porcelain/multi21/-/body')

    await choose(user, /^Bairro/)

    const status = within(panel()).getAllByRole('status')[0]
    expect(status).toHaveTextContent(
      '21" Multi-spoke rims are not homologated on the Bairro',
    )

    await choose(user, /Dismiss notice/)

    expect(status).toBeEmptyDOMElement()
    expect(panel()).toContainElement(document.activeElement as HTMLElement)
  })

  it('stays silent for a visitor who picked nothing', () => {
    renderApp()

    expect(within(panel()).getAllByRole('status')[0]).toBeEmptyDOMElement()
  })
})
