# 0001 — A Both list renders one row per position

Date: 2026-10-02
Status: Accepted

## Context

A **Both** list is a switch: the user plays both dominant and submissive
depending on the scene. The list's role therefore determines *four* distinct
answers per role-specific kink, not two.

The code disagreed with itself about this. `getKinkPositions` produced two
positions for a Both list, `isKinkVisibleForRole` hid every kink without a
`self` perspective, `isPositionApplicable` in the row already accepted four
combinations, and the quiz modal already labelled positions. Four
implementations of one rule, giving three different answers.
A role-specific kink can legitimately declare any subset of the four
role/perspective pairs, and the catalogue is uneven: 113 of 119 role-specific
kinks allow `{dom, partner}` and `{sub, self}`, only 6 allow the reverse pair,
and 4 allow all four. The dominant case is two positions, not four.

## Decision

1. **One row per position.** A kink reachable from two positions renders as
   two rows, each stating exactly one position. The position is named next to
   the kink name, because a two-column table cannot carry four labels.
2. **`Both` carries all four positions**, derived from the kink's declared
   allowed perspectives rather than special-cased per role.
3. **One rule, not four.** Position resolution lives in a single function;
   visibility is defined as "has at least one position", so it cannot drift
   from what is rendered.
4. **Positions are named for the part played** ("As Dominant", "For my
   Dominant"), not for direction ("Giving", "Receiving"), which is ambiguous
   once four positions are in play.

## Alternatives rejected

**Four columns in the table.** Rejected: the table renders a fixed pair of
choice cells, and widening it to four does not fit seven rating buttons per
cell. The mobile path already uses a drawer regardless, so the work buys
nothing. It also breaks the screenshot exporter, which infers column count
from `th:nth-child(3)`.

**Keep two columns and drop the extra positions.** Rejected: this is the bug
being fixed. A user who identifies as a switch cannot express half their
preferences.

**Group repeated names, blanking continuations.** Rejected: a blank cell fails
to stand on its own, and the 6-column screenshot layout gives no cue where one
kink ends and the next begins.

## Consequences

- `dom` and `sub` lists are unchanged in practice — 113 of 119 role-specific
  kinks still yield two positions, so their 183-row tables look as before.
- `both` lists go from 183 to 306 rows, and their progress denominator grows
  with them. Existing Both lists gain previously unreachable rows; their
  stored answers are untouched.
- The selection key stays `"<kinkKey>%<position>"`, so stored lists and
  already-shared links keep working. No data migration and no version bump.
- Position labels are worded per locale, using each locale's own role
  vocabulary rather than machine translation.
