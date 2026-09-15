import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LangProvider } from '@/i18n/LangContext'

import { ThemeToggle } from './ThemeToggle'

function renderToggle() {
  render(
    <LangProvider initialLang="en">
      <ThemeToggle />
    </LangProvider>,
  )
  return screen.getByRole('button')
}

const root = document.documentElement

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  root.removeAttribute('data-theme')
})

describe('ThemeToggle / useTheme', () => {
  it('starts on auto with no data-theme and nothing stored', () => {
    const button = renderToggle()
    expect(button).toHaveAccessibleName('Theme: Automatic')
    expect(root).not.toHaveAttribute('data-theme')
    expect(localStorage.getItem('farol.theme')).toBeNull()
  })

  it('cycles auto -> light -> dark -> auto, persisting each pick', async () => {
    const button = renderToggle()

    await userEvent.click(button)
    expect(button).toHaveAccessibleName('Theme: Light')
    expect(root).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('farol.theme')).toBe('light')

    await userEvent.click(button)
    expect(button).toHaveAccessibleName('Theme: Dark')
    expect(root).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('farol.theme')).toBe('dark')

    await userEvent.click(button)
    expect(button).toHaveAccessibleName('Theme: Automatic')
    // auto hands control back to the media query; "auto" is never an attribute value.
    expect(root).not.toHaveAttribute('data-theme')
    expect(localStorage.getItem('farol.theme')).toBe('auto')
  })

  it('restores a stored theme', () => {
    localStorage.setItem('farol.theme', 'dark')
    const button = renderToggle()
    expect(button).toHaveAccessibleName('Theme: Dark')
    expect(root).toHaveAttribute('data-theme', 'dark')
  })

  it('treats an unknown stored value as auto', () => {
    localStorage.setItem('farol.theme', 'sepia')
    const button = renderToggle()
    expect(button).toHaveAccessibleName('Theme: Automatic')
    expect(root).not.toHaveAttribute('data-theme')
  })


  it('labels the state in the active language', () => {
    render(
      <LangProvider initialLang="pt">
        <ThemeToggle />
      </LangProvider>,
    )
    expect(screen.getByRole('button')).toHaveAccessibleName('Tema: Automático')
  })
})
