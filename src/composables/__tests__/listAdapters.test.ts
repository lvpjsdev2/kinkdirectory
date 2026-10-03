import { describe, expect, it } from 'vitest'
import { category, CREATED_S, filters, generalKink, list, roleSpecificKink } from '../../projection/__tests__/fixtures'
import {
  countNewKinks,
  NEW_ONLY_FILTERS,
  NO_DISPLAY_FILTERS,
  projectAll,
  projectNewKinks,
  projectScreen,
} from '../listAdapters'

// The adapters only choose *which* projection each consumer reads. The rows,
// grouping and Progress themselves belong to the pure seam, so these tests
// assert the scope handed to it rather than re-deriving the projection rules.

const DOM = { role: 'dom' as const, perspective: 'self' as const }
const DOM_PARTNER = { role: 'dom' as const, perspective: 'partner' as const }
const SUB = { role: 'sub' as const, perspective: 'self' as const }
const SUB_PARTNER = { role: 'sub' as const, perspective: 'partner' as const }

describe('list adapters', () => {
  describe('filter scopes', () => {
    it('describes "no Display filters" with every filter inactive', () => {
      expect(NO_DISPLAY_FILTERS).toEqual({
        showOnlyNew: false,
        showOnlyUnfilled: false,
        choiceFilters: [],
      })
    })

    it('describes the new-only scope as New plus unanswered and never a Choice filter', () => {
      expect(NEW_ONLY_FILTERS).toEqual({
        showOnlyNew: true,
        showOnlyUnfilled: true,
        choiceFilters: [],
      })
    })
  })

  describe('projectScreen', () => {
    it('renders exactly the rows the active Display filters admit', () => {
      const catalogue = [category('a', [generalKink(1), generalKink(2)])]
      const screen = projectScreen(catalogue, list('both', { '1%general': 3 }), filters({ showOnlyUnfilled: true }))

      expect(screen.rows.map(row => row.kink.key)).toEqual([2])
    })

    it('measures Progress over the whole List, so filters cannot change it', () => {
      const catalogue = [category('a', [generalKink(1), generalKink(2)])]
      const active = list('both', { '1%general': 3 })

      const unfilled = projectScreen(catalogue, active, filters({ showOnlyUnfilled: true }))
      const filteredByChoice = projectScreen(catalogue, active, filters({ choiceFilters: [1, 2] }))

      expect(unfilled.progress).toEqual({ completed: 1, total: 2, percentage: 50 })
      expect(filteredByChoice.progress).toEqual(unfilled.progress)
    })

    it('omits a Category left with no visible rows', () => {
      const catalogue = [
        category('kept', [generalKink(1)]),
        category('hidden', [generalKink(2)]),
      ]
      const screen = projectScreen(catalogue, list('both', {}), filters({ choiceFilters: [3] }))

      // Nothing carries choice 3, so both Categories drop out.
      expect(screen.categories).toEqual([])
    })

    it('returns an empty projection for a null List', () => {
      const screen = projectScreen([category('a', [generalKink(1)])], null, NO_DISPLAY_FILTERS)

      expect(screen.categories).toEqual([])
      expect(screen.rows).toEqual([])
      expect(screen.progress).toEqual({ completed: 0, total: 0, percentage: 0 })
    })
  })

  describe('projectAll', () => {
    it('ignores Display filters entirely', () => {
      const catalogue = [category('a', [generalKink(1, CREATED_S - 10)])]

      expect(projectAll(catalogue, list('both', {})).rows).toHaveLength(1)
    })

    it('carries every answerable Position, one row each', () => {
      const catalogue = [category('a', [roleSpecificKink(1, [DOM, DOM_PARTNER, SUB, SUB_PARTNER])])]
      const all = projectAll(catalogue, list('both', {}))

      expect(all.rows.map(row => row.position)).toEqual(['as_dom', 'for_sub', 'as_sub', 'for_dom'])
    })
  })

  describe('projectNewKinks', () => {
    it('keeps only unanswered Positions of Kinks added after the List was created', () => {
      const catalogue = [
        category('a', [
          generalKink(1, CREATED_S + 10), // New and unanswered
          generalKink(2, CREATED_S + 10), // New but already answered
          generalKink(3, CREATED_S - 10), // Not new
          generalKink(4), // Undated is never New
        ]),
      ]
      const newKinks = projectNewKinks(catalogue, list('both', { '2%general': 1 }))

      expect(newKinks.rows.map(row => row.kink.key)).toEqual([1])
    })

    it('never inherits the active Display Choice filters', () => {
      // A New row holding choice 2 must survive, because the new-only scope
      // asks for "unanswered New", not for the user's choice selection.
      const catalogue = [category('a', [generalKink(1, CREATED_S + 10)])]
      const active = list('both', { '1%general': 2 })

      expect(projectNewKinks(catalogue, active).rows).toEqual([])
      expect(projectScreen(catalogue, active, filters({ choiceFilters: [2] })).rows).toHaveLength(1)
    })
  })

  describe('countNewKinks', () => {
    it('counts a New Kink once even when it spans several Positions', () => {
      const catalogue = [
        category('a', [
          roleSpecificKink(1, [DOM, DOM_PARTNER], CREATED_S + 10),
          generalKink(2, CREATED_S + 10),
          generalKink(3, CREATED_S - 10),
        ]),
      ]

      expect(countNewKinks(projectAll(catalogue, list('both', {})).rows)).toBe(2)
    })

    it('is zero without a List and for a catalogue with nothing new', () => {
      const catalogue = [category('a', [generalKink(1, CREATED_S - 10)])]

      expect(countNewKinks(projectAll(catalogue, null).rows)).toBe(0)
      expect(countNewKinks(projectAll(catalogue, list('both', {})).rows)).toBe(0)
    })

    it('counts a New Kink only where this List role can answer it', () => {
      // A New Kink the List has no Position for cannot be rated, so it is not
      // something the List is missing and must not inflate the count.
      const catalogue = [
        category('a', [roleSpecificKink(1, [DOM, DOM_PARTNER], CREATED_S + 10)]),
      ]

      expect(countNewKinks(projectAll(catalogue, list('dom', {})).rows)).toBe(1)
      expect(countNewKinks(projectAll(catalogue, list('sub', {})).rows)).toBe(0)
    })

    it('agrees with itself whichever projection the count is read from', () => {
      // The badge reads the whole List and the filtered screen both have to
      // report the same New Kinks, so turning a Display filter on cannot make a
      // New Kink appear or vanish from the count.
      const catalogue = [
        category('a', [
          generalKink(1, CREATED_S + 10),
          roleSpecificKink(2, [DOM, DOM_PARTNER], CREATED_S + 10),
          generalKink(3, CREATED_S - 10),
        ]),
      ]
      const active = list('both', {})

      const fromWholeList = countNewKinks(projectAll(catalogue, active).rows)
      const fromNewFilter = countNewKinks(
        projectScreen(catalogue, active, filters({ showOnlyNew: true })).rows,
      )

      expect(fromWholeList).toBe(2)
      expect(fromNewFilter).toBe(fromWholeList)
    })
  })
})
