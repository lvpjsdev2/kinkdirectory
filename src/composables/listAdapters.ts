import type { ListProjection, ProjectedRow, ProjectionFilters } from '../projection/types'
import type { KinkCategory, KinkList } from '../types'
import { projectList } from '../projection/projectList'

// The adapters over the pure projection. They only decide *which* projection a
// consumer reads — the rows, their grouping, the Choice lookup and Progress
// themselves stay in `projectList`. Nothing here re-derives a List rule.

/**
 * The List screen with every Display filter inactive.
 */
export const NO_DISPLAY_FILTERS: ProjectionFilters = {
  showOnlyNew: false,
  showOnlyUnfilled: false,
  choiceFilters: [],
}

/**
 * The new-only scope: unanswered Positions of New Kinks. It deliberately drops
 * the user's active Choice filters, so asking for the new Kinks never inherits
 * whatever Choice selection happens to be on screen.
 */
export const NEW_ONLY_FILTERS: ProjectionFilters = {
  showOnlyNew: true,
  showOnlyUnfilled: true,
  choiceFilters: [],
}

/**
 * The current time in unix seconds, the units the projection's injected `now`
 * uses. Reading the clock here keeps it outside the pure projection.
 */
export function currentUnixSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * What the List screen renders: Category groups of Position rows that survive
 * the active Display filters, plus filter-independent Progress.
 */
export function projectScreen(
  catalogue: KinkCategory[],
  list: KinkList | null,
  filters: ProjectionFilters,
  now: number,
): ListProjection {
  return projectList({ catalogue, list, filters, now })
}

/**
 * The whole List, ignoring the Display filters. Used for totals that must not
 * change when the user filters the screen.
 */
export function projectAll(
  catalogue: KinkCategory[],
  list: KinkList | null,
  now: number,
): ListProjection {
  return projectList({ catalogue, list, filters: NO_DISPLAY_FILTERS, now })
}

/**
 * The New-plus-unanswered projection. Whether it has a row at all is the
 * availability signal for the new-only flow.
 */
export function projectNewKinks(
  catalogue: KinkCategory[],
  list: KinkList | null,
  now: number,
): ListProjection {
  return projectList({ catalogue, list, filters: NEW_ONLY_FILTERS, now })
}

/**
 * How many distinct Kinks are New for this List. A Kink spanning several
 * Positions is still one new entry, so rows are counted by Kink.
 */
export function countNewKinks(rows: ProjectedRow[]): number {
  return new Set(rows.filter(row => row.isNew).map(row => row.kink.key)).size
}
