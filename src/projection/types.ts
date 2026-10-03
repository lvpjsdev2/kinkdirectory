import type { KinkCategory, KinkChoice, KinkDefinition, KinkList, KinkPosition, UserRole } from '../types'

// The public contract of the one List projection (ADR-0002, ADR-0003).
// Everything here is plain data: no reactive state, no locale, no styling.

// The existing Display-filter state shape, passed through verbatim rather than
// translated into a second filter vocabulary.
export interface ProjectionFilters {
  showOnlyNew: boolean
  showOnlyUnfilled: boolean
  choiceFilters: KinkChoice[]
}

export interface ProjectedRow {
  categoryId: string
  kink: KinkDefinition
  position: KinkPosition
  choice: KinkChoice
  isNew: boolean
}

// The two-table structure the renderer and the export surface already draw:
// general kinks and role-specific kinks are separate tables.
export interface ProjectedCategory {
  categoryId: string
  general: ProjectedRow[]
  roleSpecific: ProjectedRow[]
}

// Measured over every answerable Position of the List, never over the filtered
// view, so that filters cannot change how complete a List is.
export interface ProjectedProgress {
  completed: number
  total: number
  percentage: number
}

// Role-specific catalogue entries that yield no answerable Position for this
// List's role. Reported as data; the projection neither logs nor throws.
export interface UnanswerableKink {
  categoryId: string
  kink: KinkDefinition
  role: UserRole
}

export interface ProjectListInput {
  catalogue: KinkCategory[]
  list: KinkList | null
  filters: ProjectionFilters
}

export interface ListProjection {
  categories: ProjectedCategory[]
  rows: ProjectedRow[]
  progress: ProjectedProgress
  unanswerable: UnanswerableKink[]
}
