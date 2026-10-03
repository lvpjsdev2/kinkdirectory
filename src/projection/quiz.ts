import type { KinkCategory, KinkList } from '../types'
import type { ProjectedRow } from './types'
import { NEW_ONLY_FILTERS, NO_DISPLAY_FILTERS } from './filters'
import { projectList } from './projectList'

// The Quiz is an adapter over the one List projection, not a second read-side
// expansion of Position, New, or Choice. It differs from the List screen in one
// way only: it chooses its own Display filters instead of inheriting the ones
// the screen happens to have active.

export interface QuizProjectionInput {
  catalogue: KinkCategory[]
  list: KinkList | null
  // The injected clock in unix seconds, passed through to the projection.
  now: number
}

// 'all' is the normal Quiz: every answerable Position, answered or not.
// 'newAndUnanswered' is the new-only Quiz: the New filter and the unanswered
// filter together, with Choice filters inactive.
export type QuizScope = 'all' | 'newAndUnanswered'

// The flat Position-row sequence the Quiz traverses with a single cursor, in
// catalogue and canonical Position order.
export function projectQuizRows(input: QuizProjectionInput, scope: QuizScope): ProjectedRow[] {
  const filters = scope === 'all' ? NO_DISPLAY_FILTERS : NEW_ONLY_FILTERS
  return projectList({ ...input, filters }).rows
}
