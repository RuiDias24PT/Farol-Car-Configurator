import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONFIG } from '@/catalog'
import type { Config } from '@/catalog/types'

import { StoreProvider } from './StoreContext'
import { hashFor } from './url'
import { useUrlSync } from './useUrlSync'
import { useConfig, useDispatch } from './useStore'

function Harness() {
  const shareUrl = useUrlSync()
  const config = useConfig()
  const dispatch = useDispatch()

  return (
    <>
      <p data-testid="share">{shareUrl}</p>
      <p data-testid="car">{`${config.body}/${config.colour}/${config.wheels}/${config.step}`}</p>
      <button onClick={() => dispatch({ type: 'goToStep', id: 'colour' })}>
        step
      </button>
      <button onClick={() => dispatch({ type: 'setColour', id: 'petrol' })}>
        colour
      </button>
    </>
  )
}

function mount(initialConfig?: Config) {
  return render(
    <StoreProvider initialConfig={initialConfig}>
      <Harness />
    </StoreProvider>,
  )
}

/** jsdom fires `hashchange` asynchronously; the app only cares that it fires. */
function navigateTo(hash: string) {
  act(() => {
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

let push: ReturnType<typeof vi.spyOn>
let replace: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  push = vi.spyOn(window.history, 'pushState')
  replace = vi.spyOn(window.history, 'replaceState')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useUrlSync', () => {
  it('writes the car into an empty address bar without adding a history entry', () => {
    mount()

    expect(window.location.hash).toBe(hashFor(DEFAULT_CONFIG))
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('writes nothing when the address bar already matches', () => {
    window.history.replaceState(null, '', hashFor(DEFAULT_CONFIG))
    replace.mockClear()

    mount()

    expect(replace).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('replaces the entry when an entry link needed correcting', () => {
    // bairro does not take 21" wheels, so the engine bounces them to sport20.
    const corrected = mount({
      ...DEFAULT_CONFIG,
      body: 'bairro',
      wheels: 'multi21',
    })

    expect(window.location.hash).toContain('/sport20/')
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()

    corrected.unmount()
  })

  it('pushes on a step change, so the back button walks the funnel', async () => {
    mount()
    replace.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'step' }))

    expect(window.location.hash).toContain('/colour')
    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
  })

  it('replaces on an option change, so undoing a choice is not a back press', async () => {
    mount()
    replace.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'colour' }))

    expect(window.location.hash).toContain('/petrol/')
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('loads a car when the address bar is edited by hand', () => {
    mount()

    navigateTo('#/vela/ev/carmine/sport20/-/wheels')

    expect(screen.getByTestId('car')).toHaveTextContent(
      'vela/carmine/sport20/wheels',
    )
  })

  it('corrects an impossible link rather than showing it', () => {
    mount()

    navigateTo('#/bairro/ice/carmine/multi21/-/wheels')

    expect(screen.getByTestId('car')).toHaveTextContent(
      'bairro/carmine/sport20/wheels',
    )
  })

  it('keeps unknown segments on the car already on screen', () => {
    mount({ ...DEFAULT_CONFIG, body: 'vela', colour: 'carmine' })

    navigateTo('#/batmobile/ev/carmine/sport20/-/wheels')

    expect(screen.getByTestId('car')).toHaveTextContent('vela/carmine')
  })

  it('does not loop when the incoming hash is the car already in state', () => {
    mount()
    push.mockClear()
    replace.mockClear()

    navigateTo(hashFor(DEFAULT_CONFIG))

    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('builds the share link from state, not from the address bar', async () => {
    mount()

    await userEvent.click(screen.getByRole('button', { name: 'colour' }))

    expect(screen.getByTestId('share')).toHaveTextContent(
      `${window.location.origin}/${hashFor({ ...DEFAULT_CONFIG, colour: 'petrol' })}`,
    )
  })
})
