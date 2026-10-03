import type { KinkDefinition, KinkPosition, RolePerspective, UserRole } from '../types'
import type {
  ListProjection,
  ProjectedCategory,
  ProjectedProgress,
  ProjectedRow,
  ProjectionFilters,
  ProjectListInput,
  UnanswerableKink,
} from './types'

export type {
  ListProjection,
  ProjectedCategory,
  ProjectedProgress,
  ProjectedRow,
  ProjectionFilters,
  ProjectListInput,
  UnanswerableKink,
} from './types'

// A position names the partner slot a rating is about. The allowedPerspectives
// entry it requires is fixed: it does not depend on which role the list answers
// for, so the mapping below is data, not a per-role rule.
type KinkSlot = Exclude<KinkPosition, 'general'>

const POSITION_TARGET: Record<KinkSlot, RolePerspective> = {
  as_dom: { role: 'dom', perspective: 'self' },
  for_sub: { role: 'dom', perspective: 'partner' },
  as_sub: { role: 'sub', perspective: 'self' },
  for_dom: { role: 'sub', perspective: 'partner' },
}

// The positions a list answers for, in canonical display order. A Both list is
// a switch: it answers as a dom and as a sub, so it carries all four.
const LIST_POSITIONS: Record<UserRole, KinkSlot[]> = {
  dom: ['as_dom', 'for_sub'],
  sub: ['as_sub', 'for_dom'],
  both: ['as_dom', 'for_sub', 'as_sub', 'for_dom'],
}

// The one Position-resolution rule (ADR-0001). Visibility is defined as "has at
// least one position", so it can never disagree with what is rendered. This is
// deliberately module-private: a second read-side expansion root is what the
// projection exists to remove.
function getKinkPositions(kink: KinkDefinition, role: UserRole): KinkPosition[] {
  if (kink.format === 'general')
    return ['general']

  if (kink.format !== 'role_specific' || !kink.allowedPerspectives)
    return []

  return LIST_POSITIONS[role].filter((position) => {
    const target = POSITION_TARGET[position]
    return kink.allowedPerspectives!.some(
      allowed => allowed.role === target.role && allowed.perspective === target.perspective,
    )
  })
}

function emptyProjection(): ListProjection {
  return {
    categories: [],
    rows: [],
    progress: { completed: 0, total: 0, percentage: 0 },
    unanswerable: [],
  }
}

// General kinks and role-specific kinks are two distinct tables in the renderer
// and in the export surface, so the grouping keeps them apart. Categories
// appear in catalogue order and are omitted once they hold no visible row.
function groupIntoCategories(rows: ProjectedRow[]): ProjectedCategory[] {
  const categories = new Map<string, ProjectedCategory>()

  for (const row of rows) {
    let category = categories.get(row.categoryId)
    if (!category) {
      category = { categoryId: row.categoryId, general: [], roleSpecific: [] }
      categories.set(row.categoryId, category)
    }

    if (row.position === 'general')
      category.general.push(row)
    else
      category.roleSpecific.push(row)
  }

  return [...categories.values()]
}

// The one read-side entry point (ADR-0002): a List projected into ordered
// Category groups, a flat row sequence for sequential consumers, filter-
// independent Progress, and diagnostics. Input is plain data only — no reactive
// state, no browser globals, no locale, no clock — so rendering, quiz and export
// are adapters over this function rather than re-deriving the same rules.
export function projectList(input: ProjectListInput): ListProjection {
  if (!input.list)
    return emptyProjection()

  const { catalogue, list, filters } = input
  const rows: ProjectedRow[] = []
  const unanswerable: UnanswerableKink[] = []

  for (const category of catalogue) {
    for (const kink of category.kinks) {
      const positions = getKinkPositions(kink, list.role)

      // A role-specific kink with no position for this role is a catalogue data
      // problem. It is reported as data so a caller may surface it; the
      // projection neither logs nor throws.
      if (positions.length === 0) {
        if (kink.format === 'role_specific')
          unanswerable.push({ categoryId: category.id, kink, role: list.role })
        continue
      }

      const isNew = isKinkNew(kink, list.created)
      for (const position of positions) {
        rows.push({
          categoryId: category.id,
          kink,
          position,
          choice: list.selections[`${kink.key}%${position}`] ?? 0,
          isNew,
        })
      }
    }
  }

  const visibleRows = rows.filter(row => satisfiesFilters(row, filters))

  return {
    categories: groupIntoCategories(visibleRows),
    rows: visibleRows,
    progress: measureProgress(rows),
    unanswerable,
  }
}

// Progress is measured over every answerable position of the list, before any
// display filter is applied: changing the filters cannot change how complete a
// list is.
function measureProgress(rows: ProjectedRow[]): ProjectedProgress {
  const completed = rows.filter(row => row.choice !== 0).length

  return {
    completed,
    total: rows.length,
    percentage: rows.length > 0 ? Math.round((completed / rows.length) * 100) : 0,
  }
}

// Filters are judged by the row, not by the kink: a row is shown only when that
// row itself satisfies every active filter. A kink therefore cannot appear
// through one position while satisfying another position's predicate.
function satisfiesFilters(row: ProjectedRow, filters: ProjectionFilters): boolean {
  if (filters.showOnlyNew && !row.isNew)
    return false

  if (filters.showOnlyUnfilled && row.choice !== 0)
    return false

  if (filters.choiceFilters.length > 0 && !filters.choiceFilters.includes(row.choice))
    return false

  return true
}

// New is a relation between the catalogue and the list, not a calendar window:
// a kink is New when it entered the catalogue after this list was created. An
// undated kink is never New. Catalogue timestamps are seconds, list creation
// milliseconds.
function isKinkNew(kink: KinkDefinition, listCreated: number): boolean {
  if (!kink.addedAt)
    return false
  return kink.addedAt * 1000 > listCreated
}
