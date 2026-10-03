export type KinkChoice = 0 | 1 | 2 | 3 | 4 | 5 | 6
// 0 = Not Entered, 1 = Favorite, 2 = Like, 3 = Indifferent, 4 = Maybe, 5 = Limit, 6 = Curious

// User roles
export type UserRole = 'sub' | 'dom' | 'both'

// Format types for kinks
export type KinkFormat = 'general' | 'role_specific'

// Position perspective types
export type KinkPerspective = 'self' | 'partner'

// Available positions
export type KinkPosition = 'as_dom' | 'as_sub' | 'for_dom' | 'for_sub' | 'general'

// Combination of role and perspective
export interface RolePerspective {
  role: Omit<UserRole, 'both'> // Which user role this applies to
  perspective: KinkPerspective // Whether this is for self or partner
}

// How a position is presented to the user. Role-oriented wording, because a
// position names the partner slot a rating is about, not the direction of the act.
export interface KinkPositionDisplay {
  icon: string
  labelKey: string
  color: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | undefined
}

export const KINK_POSITION_DISPLAY: Record<KinkPosition, KinkPositionDisplay> = {
  general: { icon: 'i-lucide-list-checks', labelKey: 'app.general', color: 'info' },
  as_dom: { icon: 'tdesign:user-arrow-right', labelKey: 'app.position_as_dom', color: 'primary' },
  for_sub: { icon: 'tdesign:user-arrow-right', labelKey: 'app.position_for_sub', color: 'secondary' },
  as_sub: { icon: 'tdesign:user-arrow-left', labelKey: 'app.position_as_sub', color: 'primary' },
  for_dom: { icon: 'tdesign:user-arrow-left', labelKey: 'app.position_for_dom', color: 'secondary' },
}

// Kink definition with formats
export interface KinkDefinition {
  id: string
  key: number
  format: KinkFormat
  addedAt?: number
  // For role_specific kinks, defines allowed combinations of roles and perspectives
  // Example:
  // [{ role: 'dom', perspective: 'self' }, { role: 'dom', perspective: 'partner' }]
  // means dominants can answer for themselves and for their partner
  allowedPerspectives?: RolePerspective[]
}

export interface KinkCategory {
  id: string
  kinks: KinkDefinition[]
}

export interface KinkList {
  id: string
  name: string
  role: UserRole
  created: number // timestamp
  selections: Record<string, KinkChoice> // Format: "<kinkKey>%<position>" -> choice
}
