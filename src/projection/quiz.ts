import type { KinkCategory, KinkList } from '../types'
import type { ProjectedRow, ProjectionFilters } from './types'
import { projectList } from './projectList'

// The Quiz is an adapter over the one List projection, not a second read-side
// expansion of Position, New, or Choice. It differs from the List screen in one
// way only: it chooses its own Display filters instead of inheriting the ones
// the screen happens to have active.

export interface QuizProjectionInput {
  catalogue: KinkCategory[]
  list: KinkList | null
}

// 'all' is the normal Quiz: every answerable Position, answered or not.
// 'newAndUnanswered' is the new-only Quiz: the New filter and the unanswered
// filter together, with Choice filters inactive.
export type QuizScope = 'all' | 'newAndUnanswered'

const SCOPE_FILTERS: Record<QuizScope, ProjectionFilters> = {
  all: { showOnlyNew: false, showOnlyUnfilled: false, choiceFilters: [] },
  newAndUnanswered: { showOnlyNew: true, showOnlyUnfilled: true, choiceFilters: [] },
}

// The flat Position-row sequence the Quiz traverses with a single cursor, in
// catalogue and canonical Position order.
export function projectQuizRows(input: QuizProjectionInput, scope: QuizScope): ProjectedRow[] {
  return projectList({ ...input, filters: SCOPE_FILTERS[scope] }).rows
}
