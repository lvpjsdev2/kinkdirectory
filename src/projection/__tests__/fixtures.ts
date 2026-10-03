import type { KinkCategory, KinkChoice, KinkDefinition, KinkList, RolePerspective, UserRole } from '../../types'
import type { ProjectionFilters } from '../types'

// Synthetic catalogue data for the projection contract tests. Nothing here
// reads the real catalogue, storage, or the clock.

export const CREATED_MS = 1_700_000_000_000

// The same moment in seconds, because the catalogue stores `addedAt` in seconds
// while a list stores `created` in milliseconds.
export const CREATED_S = 1_700_000_000

// The clock every test injects, in unix seconds like the projection's `now`.
// Fixed rather than read from the system, so projections stay deterministic.
export const NOW_S = CREATED_S + 3_600

export function generalKink(key: number, addedAt?: number): KinkDefinition {
  return { id: `general_${key}`, format: 'general', key, ...(addedAt === undefined ? {} : { addedAt }) }
}

export function roleSpecificKink(
  key: number,
  allowedPerspectives: RolePerspective[],
  addedAt?: number,
): KinkDefinition {
  return {
    id: `role_specific_${key}`,
    format: 'role_specific',
    key,
    allowedPerspectives,
    ...(addedAt === undefined ? {} : { addedAt }),
  }
}

export function category(id: string, kinks: KinkDefinition[]): KinkCategory {
  return { id, kinks }
}

export function list(role: UserRole, selections: Record<string, KinkChoice> = {}): KinkList {
  return { id: 'list-1', name: 'List', role, created: CREATED_MS, selections }
}

export function filters(overrides: Partial<ProjectionFilters> = {}): ProjectionFilters {
  return { showOnlyNew: false, showOnlyUnfilled: false, choiceFilters: [], ...overrides }
}
