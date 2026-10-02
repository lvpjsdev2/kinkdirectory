# 0002 — One List projection behind one seam

Date: 2026-10-02
Status: Accepted

## Context

Position resolution is one rule (ADR-0001), but every consumer still built
its own view of a List: `ListContent` re-derived categories and progress,
`KinkSection` re-expanded Kinks into rows and re-applied filters, the quiz
modal built its own subset, and the screenshot export scraped live DOM. Two
filter semantics coexisted — Kink-level existential predicates in
`shouldShowKink` and Position-row predicates in `KinkSection` — and with both
active a Kink could appear through one Position while satisfying another
Position's predicate.

## Decision

One pure module projects a List to **Category-grouped Position rows** and
owns every derived view:

- Input is data only: the catalogue, one List's stored Choices, the display
  filters, and the clock (injected). No reactive state, no global lookups,
  no localized text, no styling. Rendering, quiz, and export are adapters
  over it.
- **Filters are judged by the row, not the Kink**: a row is shown only when
  that row itself satisfies every active filter. Consequence: "unanswered
  only" together with a Choice filter matches rows only if the Choice filter
  contains `0` (unanswered); with any nonzero-only Choice filter the
  conjunction is empty.
- **New** is a property of the catalogue entry: `addedAt` strictly newer than
  48 hours, with `now` injected so the projection stays deterministic. A
  Kink without a date is never New.
- **Progress ignores filters** — always measured over every answerable
  Position of the List. A future reader will be tempted to "fix" this; it is
  deliberate.
- The **normal quiz traverses the whole List** and ignores display filters.
  The **new-only quiz** takes New Kinks' unanswered Positions, also ignoring
  display filters. Only list rendering and the screenshot export consume the
  filtered view.
- General Kinks contribute exactly one `general` row; role-specific Kinks
  one row per applicable Position (ADR-0001's rule, unchanged).
- Rows stay in catalogue order; Positions in `LIST_POSITIONS` order.
- One cutover for all five consumers, so a second projection cannot take
  root.

## Alternatives rejected

**Separate list/quiz/progress/export projections.** Rejected: preserves the
drift this decision exists to remove; filtering semantics would still have
two homes.

**A reactive module owning List state.** Rejected: pulls persistence and
global state into the projection's interface and makes it untestable
without Vue.

**Localized or styled rows.** Rejected: couples the projection to locale
state and makes the interface presentation-shaped; adapters keep that job.

## Interface (design-it-twice outcome)

Three interface designs were compared (one God-call output; two entry
points with a quiz function; quiz-as-filter-data). The chosen shape:

- **One entry point**: `projectList(input): ListProjection`, pure, in
  `src/projection/`. There is no quiz entry point and no quiz field: the
  normal quiz calls it with no filters, the new-only quiz calls it with
  `{ showOnlyNew: true, showOnlyUnfilled: true }`, the badge count reads
  `rows.length > 0` of that same call — the quiz scope *is* the filter
  conjunction, so it cannot drift from it.
- **Input**: `{ catalogue, list, filters, now }` where `filters` is the
  existing filter-state shape verbatim, `now` is unix seconds, and a null
  list projects empty instead of throwing. No reactive state, locale, or
  styling behind the seam; the Vue composable is just the reactivity
  adapter.
- **Output**: `categories` (`{ category, general: Row[], roleSpecific: Row[] }`
  — the two-table structure the UI and export actually render), flat
  `rows` carrying `{ categoryId, kink, position, choice, isNew }` for quiz
  traversal, `progress` (whole List, with percent), and `unanswerable`
  diagnostics (replacing the `console.warn`). No `byKink`, no storage keys
  on rows, no badge-count fields.
- **Rejected**: a quiz entry point with a `scope` option (second traversal
  concept), clock/catalogue ports (one adapter = hypothetical seam),
  reactive or locale-aware rows, any second projection root.

## Consequences

- Filter, progress, quiz, and screenshot behavior change in one
  implementation; tests assert the projection directly without mounting
  components.
- Combining "unanswered only" with a nonzero Choice filter now visibly
  yields no rows instead of leaking mismatched rows.
- Exporting respects the currently filtered view, as before; the export's
  hidden DOM contract is addressed by candidate 4 of the architecture
  review, not here.
