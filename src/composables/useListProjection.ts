import type { ComputedRef } from 'vue'
import type { ListProjection, ProjectedProgress } from '../projection/types'
import { computed } from 'vue'
import { kinkList } from '../data/kinks'
import { countNewKinks, currentUnixSeconds, projectAll, projectNewKinks, projectScreen } from './listAdapters'
import { useKinkListState } from './useKinkList'

export interface ListProjectionState {
  /** Category groups of Position rows the List screen renders, plus Progress. */
  screen: ComputedRef<ListProjection>
  /** The whole List, ignoring the Display filters. */
  all: ComputedRef<ListProjection>
  /** New-plus-unanswered rows, used for the new-only flow. */
  newKinks: ComputedRef<ListProjection>
  /** Filter-independent: derived from the unfiltered List, not from the screen. */
  progress: ComputedRef<ProjectedProgress>
  /** Distinct Kinks added after the active List was created. */
  newKinkCount: ComputedRef<number>
  /** Whether the new-only flow has anything to ask about. */
  newKinksAvailable: ComputedRef<boolean>
}

/**
 * Reactivity around the pure projection: the catalogue and the active List come
 * from reactive state, everything below is `projectList`. Components read this
 * instead of re-expanding Positions, resolving Choices or measuring Progress.
 */
export function useListProjection(): ListProjectionState {
  const { activeList, filters } = useKinkListState()

  const screen = computed(() =>
    projectScreen(kinkList, activeList.value, filters.value, currentUnixSeconds()),
  )
  const all = computed(() => projectAll(kinkList, activeList.value, currentUnixSeconds()))
  const newKinks = computed(() => projectNewKinks(kinkList, activeList.value, currentUnixSeconds()))

  return {
    screen,
    all,
    newKinks,
    // `projectList` measures Progress before applying any Display filter, so
    // filtering the screen cannot change how complete the List is.
    progress: computed(() => screen.value.progress),
    newKinkCount: computed(() => countNewKinks(all.value.rows)),
    newKinksAvailable: computed(() => newKinks.value.rows.length > 0),
  }
}
