import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { LangProvider } from '@/i18n/LangContext'

import { LangMenu } from './LangMenu'

function renderMenu() {
  render(
    <LangProvider initialLang="en">
      <LangMenu />
    </LangProvider>,
  )
  return screen.getByRole('button', { name: 'Language: English' })
}

afterEach(() => {
  localStorage.clear()
})

describe('LangMenu', () => {
  it('starts closed', () => {
    const trigger = renderMenu()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('opens onto every language, marking the active one', async () => {
    const trigger = renderMenu()
    await userEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const options = within(screen.getByRole('list')).getAllByRole('button')
    expect(options.map((o) => o.textContent)).toEqual([
      'PortuguêsPT',
      'EnglishEN',
      'DeutschDE',
    ])
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Deutsch' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('switches language, persists, closes and returns focus', async () => {
    renderMenu()
    await userEvent.click(
      screen.getByRole('button', { name: 'Language: English' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Deutsch' }))

    const trigger = screen.getByRole('button', { name: 'Sprache: Deutsch' })
    expect(localStorage.getItem('farol.lang')).toBe('de')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('choosing the active language just closes', async () => {
    const trigger = renderMenu()
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(localStorage.getItem('farol.lang')).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const trigger = renderMenu()
    await userEvent.click(trigger)
    await userEvent.tab()
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes on a press outside', async () => {
    const trigger = renderMenu()
    await userEvent.click(trigger)
    await userEvent.click(document.body)

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
