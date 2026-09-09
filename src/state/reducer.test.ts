import { describe, expect, it } from 'vitest'

import { DEFAULT_CONFIG } from '@/catalog'
import type { Config } from '@/catalog/types'

import { initStore, reducer } from './reducer'
import type { Action, StoreState } from './reducer'

function stateFor(fields: Partial<Config>): StoreState {
  return initStore({ ...DEFAULT_CONFIG, ...fields })
}

describe('initStore', () => {
  it('takes the default config unchanged and says nothing about it', () => {
    const state = initStore()

    expect(state.config).toEqual(DEFAULT_CONFIG)
    expect(state.notes).toHaveLength(0)
  })
})

describe('reducer', () => {
  it('self-corrects an impossible choice and surfaces the note', () => {
    // bairro is the one body that does not take big wheels.
    const state = reducer(stateFor({ body: 'bairro' }), {
      type: 'setWheels',
      id: 'multi21',
    })

    expect(state.config.wheels).toBe('sport20')
    expect(state.notes).toEqual([
      {
        code: 'wheelsNeedBigBody',
        wheels: 'multi21',
        body: 'bairro',
        to: 'sport20',
      },
    ])
  })

  it('clears the notes on the next action', () => {
    const corrected = reducer(stateFor({ body: 'bairro' }), {
      type: 'setWheels',
      id: 'multi21',
    })
    const next = reducer(corrected, { type: 'setColour', id: 'petrol' })

    expect(next.config.colour).toBe('petrol')
    expect(next.notes).toHaveLength(0)
  })

  it('resolves upward for a package, moving body and wheels under it', () => {
    // solar cannot tow and multi21 blocks the tow bar: two things give way.
    const state = reducer(stateFor({ body: 'solar', wheels: 'multi21' }), {
      type: 'addPackage',
      id: 'tow',
    })

    expect(state.config.body).toBe('serra')
    expect(state.config.wheels).toBe('sport20')
    expect(state.config.packages).toContain('tow')
    expect(state.notes.map((note) => note.code)).toEqual([
      'bodySwappedForPackage',
      'wheelsSwappedForPackage',
    ])
  })

  it('drops a package on request', () => {
    const fitted = reducer(initStore(), { type: 'addPackage', id: 'winter' })
    const state = reducer(fitted, { type: 'removePackage', id: 'winter' })

    expect(state.config.packages).toEqual([])
    expect(state.notes).toHaveLength(0)
  })

  it('dismisses the notes without touching the car', () => {
    const corrected = reducer(stateFor({ body: 'bairro' }), {
      type: 'setWheels',
      id: 'multi21',
    })
    const state = reducer(corrected, { type: 'dismissNotes' })

    expect(state.config).toBe(corrected.config)
    expect(state.notes).toHaveLength(0)
  })

  it('loads garbage without throwing, falling back to the default car', () => {
    const garbage = {
      body: 'batmobile',
      powertrain: 'steam',
      colour: 'octarine',
      wheels: 'cartwheel',
      packages: ['jetpack'],
      step: '99',
    } as unknown as Config

    const state = reducer(initStore(), { type: 'load', config: garbage })

    expect(state.config).toEqual(DEFAULT_CONFIG)
    expect(state.notes).toHaveLength(0)
  })

  it('resets to the default car', () => {
    const configured = reducer(stateFor({ body: 'vela', powertrain: 'ev' }), {
      type: 'addPackage',
      id: 'sound',
    })
    const state = reducer(configured, { type: 'reset' })

    expect(state.config).toEqual(DEFAULT_CONFIG)
  })

  it('is pure — the same state and action give the same answer', () => {
    const state = stateFor({ body: 'bairro' })
    const action: Action = { type: 'setWheels', id: 'multi21' }

    expect(reducer(state, action)).toEqual(reducer(state, action))
  })

  it('returns the same state object when nothing actually changed', () => {
    const state = initStore()

    expect(reducer(state, { type: 'setBody', id: DEFAULT_CONFIG.body })).toBe(
      state,
    )
    expect(reducer(state, { type: 'dismissNotes' })).toBe(state)
  })
})
