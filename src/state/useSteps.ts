import { STEPS } from '@/catalog'
import type { StepId } from '@/catalog/types'

import { useConfig, useDispatch } from './useStore'

export interface Funnel {
  current: StepId
  index: number
  /** `undefined` on the first step. */
  prev?: StepId
  /** `undefined` on the last step. */
  next?: StepId
  isDone: (id: StepId) => boolean
  go: (id: StepId) => void
}

export function useSteps(): Funnel {
  const config = useConfig()
  const dispatch = useDispatch()

  const found = STEPS.indexOf(config.step)
  const index = found === -1 ? 0 : found

  return {
    current: STEPS[index],
    index,
    prev: STEPS[index - 1],
    next: STEPS[index + 1],
    isDone: (id) => STEPS.indexOf(id) < index,
    go: (id) => dispatch({ type: 'goToStep', id }),
  }
}
