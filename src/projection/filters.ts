import type { ProjectionFilters } from './types'

/** The whole List: Display filters inactive. */
export const NO_DISPLAY_FILTERS: ProjectionFilters = {
  showOnlyNew: false,
  showOnlyUnfilled: false,
  choiceFilters: [],
}

/** New Kinks with unanswered Positions, independent of screen Choice filters. */
export const NEW_ONLY_FILTERS: ProjectionFilters = {
  showOnlyNew: true,
  showOnlyUnfilled: true,
  choiceFilters: [],
}
