import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONFIG } from '@/catalog'

import { StoreProvider } from './StoreContext'
import { useConfig, useDispatch, useNotes } from './useStore'

function Probe() {
  const config = useConfig()
  const notes = useNotes()
  const dispatch = useDispatch()

  return (
    <>
      <p data-testid="wheels">{config.wheels}</p>
      <p data-testid="notes">{notes.map((note) => note.code).join(',')}</p>
      <button onClick={() => dispatch({ type: 'setWheels', id: 'multi21' })}>
        21"
      </button>
    </>
  )
}

describe('StoreProvider', () => {
  it('routes a dispatched action through the engine and back to the tree', async () => {
    render(
      <StoreProvider initialConfig={{ ...DEFAULT_CONFIG, body: 'bairro' }}>
        <Probe />
      </StoreProvider>,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByTestId('wheels')).toHaveTextContent('sport20')
    expect(screen.getByTestId('notes')).toHaveTextContent('wheelsNeedBigBody')
  })

  it('renders the default car when given no config', () => {
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    )

    expect(screen.getByTestId('wheels')).toHaveTextContent(
      DEFAULT_CONFIG.wheels,
    )
    expect(screen.getByTestId('notes')).toBeEmptyDOMElement()
  })

  it('refuses to work outside a provider rather than serving a fake car', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow(/StoreProvider/)
  })
})
