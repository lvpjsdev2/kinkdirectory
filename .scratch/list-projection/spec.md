# One List Projection Behind One Seam

Status: ready-for-agent

## Problem Statement

A List is currently interpreted independently by list rendering, Position-row rendering, Progress, quiz flows, and screenshot export. These consumers duplicate Position expansion, New detection, Choice lookup, filtering, and ordering rules. The duplicate implementations already disagree: Kink-level filtering can admit a Kink because different Positions satisfy different filters, while the rendered rows apply filters to each Position separately. This makes the displayed List, Progress, quiz, and export difficult to reason about and allows fixes in one consumer to leave the others inconsistent.

## Solution

Introduce one pure List-projection module that accepts catalogue data, one List, the existing Display filters, and an injected clock. It returns Category-grouped Position rows, the same rows flattened for sequential consumers, whole-List Progress, and diagnostics for unanswerable catalogue entries.

All read-side consumers use this projection directly or indirectly. List rendering and screenshot export use its filtered rows. Progress uses its filter-independent totals. The normal quiz projects with inactive filters; the new-only quiz projects with New-only and unanswered-only filters. This keeps every view on the same Position expansion, Choice lookup, ordering, New, and same-row filter semantics without introducing a second projection root.

## User Stories

1. As a person viewing a List, I want each answerable Position shown exactly once, so that the screen represents every answer I can give without duplicates or omissions.
2. As a person viewing a general Kink, I want one general Position row, so that a role-independent answer is not duplicated across role-specific columns.
3. As a person viewing a role-specific Kink, I want only Positions allowed by both the List role and the Kink perspectives, so that irrelevant answers are not displayed.
4. As a person with a Both List, I want all applicable dominant and submissive Positions available, so that neither side of the List is hidden.
5. As a person filtering by New, I want only Position rows belonging to Kinks added strictly within the last 48 hours, so that the filter has one predictable boundary.
6. As a person filtering by New, I want undated Kinks excluded, so that missing catalogue metadata is not mistaken for recent content.
7. As a person filtering for unanswered rows, I want only rows without a Choice, so that every visible row still needs an answer.
8. As a person filtering by Choice, I want each visible row to carry one of the selected Choices, so that a Kink cannot appear because another Position matched.
9. As a person combining filters, I want every visible row to satisfy every active filter itself, so that filter conjunction never leaks mismatched Position rows.
10. As a person combining unanswered-only with nonzero Choice filters, I want the result to be empty, so that contradictory criteria remain visibly contradictory.
11. As a person viewing Progress, I want it measured over every answerable Position in the List, so that changing Display filters does not change how complete the List is.
12. As a person viewing Progress, I want its denominator to equal the unfiltered projection's Position-row count, so that Progress cannot disagree with a fully visible List.
13. As a person taking the normal quiz, I want to traverse every answerable Position regardless of active Display filters, so that hidden screen rows are not omitted from the quiz.
14. As a person taking the new-only quiz, I want only unanswered Positions from New Kinks, so that I can review newly added catalogue content without revisiting completed answers.
15. As a person opening the new-only quiz when no matching Position exists, I want the flow to complete cleanly, so that I do not see an invalid or empty question.
16. As a person navigating a quiz, I want questions in catalogue and Position order, so that navigation is stable and predictable.
17. As a person exporting the visible List, I want export content to reflect the currently filtered view, so that the image matches the rows I chose to display.
18. As a person switching locale, I want projected data to remain language-independent, so that the same List rules work with every translation.
19. As a maintainer, I want the clock injected into New calculation, so that the 48-hour boundary is deterministic and testable.
20. As a maintainer, I want one read-side projection entry point, so that a future List rule cannot be implemented differently for rendering, Progress, quiz, or export.
21. As a maintainer, I want malformed role-specific Kinks that yield no Position reported as diagnostics rather than console side effects, so that projection remains pure and callers may decide how to surface data problems.
22. As a maintainer, I want a null active List to produce an empty projection rather than throw, so that consumers can render transient state safely.
23. As a maintainer, I want Category, Kink, and Position ordering preserved from the catalogue and canonical Position order, so that adapters never need to reconstruct domain ordering.
24. As a maintainer, I want projection tests to use synthetic catalogue, List, filters, and time data without mounting Vue components, so that domain behavior is fast and isolated.

## Implementation Decisions

- Build one pure `projectList` entry point. It accepts plain catalogue data, a nullable List containing at least its role and stored Choices, the existing Display-filter state shape, and `now` as Unix seconds.
- A null List and an empty catalogue both return an empty projection with zero Progress. The projection does not read reactive state, browser globals, storage, locale, styling, or the system clock.
- The result contains Category projections in catalogue order. Each Category projection separates general rows from role-specific rows because those are distinct tables in both the current renderer and export surface.
- The result also contains the same filtered Position rows as one flat sequence for quiz traversal and other sequential consumers. Each row carries its Category identity, Kink definition, Position, resolved Choice, and New flag. It does not carry localized strings, CSS concerns, storage keys, or presentation-specific display values.
- General Kinks produce exactly one general row. Role-specific Kinks use the existing canonical List-role-to-Position order and perspective matching established by ADR-0001.
- Display filtering is one conjunction evaluated against each Position row: New-only requires the row's Kink to be New; unanswered-only requires the row's Choice to be absent; active Choice filters require the row's Choice to be included. Empty Choice filters are inactive.
- New means that the Kink has an `addedAt` value strictly greater than `now - 48 hours`. An absent date is never New. Input clock and catalogue timestamps use seconds.
- Progress is derived before Display filters are applied. Its total is every answerable Position, its answered count is every row carrying a Choice, and its percentage uses the existing application rounding behavior. Empty Progress is zero rather than an invalid division.
- The normal quiz calls the same projection with all Display filters inactive. The new-only quiz calls it with New-only and unanswered-only active and Choice filters inactive. Neither quiz inherits the user's current Display filters.
- Quiz traversal consumes the flat Position-row sequence with one cursor. It does not create another Category/Kink/Position projection or retain a second definition of New Kinks.
- The indicator that a new-only quiz is available is derived from whether that same New-plus-unanswered projection has at least one row. No separate badge-count field or new-Kink derivation is added to the projection contract.
- The projection reports role-specific Kinks that yield no answerable Position as data in an `unanswerable` diagnostic collection. It does not log or throw for that condition.
- Vue reactivity remains an adapter around the pure projection. Components receive projected data and render it; they do not repeat Position expansion, Choice lookup, filtering, Progress, or New calculations.
- The existing filter state shape is passed to the projection without introducing a second filter DTO or mapping vocabulary.
- The screenshot exporter remains an adapter over the rendered List for this change. Because the rendered List is projection-backed, its exported row selection follows the projection. Replacing DOM cloning, selector assumptions, fixed-layout construction, or the html2canvas pipeline belongs to the separate screenshot-export architecture candidate and is not part of this cutover.
- Remove obsolete read-side derivations after every caller has cut over. Do not retain compatibility aliases, duplicate helpers, deprecated entry points, or a separate quiz projection.
- The accepted one-row-per-Position and one-projection ADRs remain authoritative when implementation details conflict with existing incidental behavior.

## Testing Decisions

- The primary automated seam is the pure `projectList` contract. Tests assert observable rows, grouping, ordering, Progress, and diagnostics from plain inputs; they do not mount Vue components or inspect helper internals.
- Add the minimal Vite-compatible TypeScript test runner configuration needed for deterministic projection tests because the repository currently has no automated test setup. Do not introduce component-test infrastructure for this work.
- Cover one general Kink producing one general row and role-specific Kinks producing the canonical Position subsets for Dominant, Submissive, and Both Lists.
- Cover same-row conjunction explicitly: construct a Kink with multiple Positions whose different rows would satisfy different filters and verify no cross-Position match is admitted.
- Cover the contradictory unanswered-only plus nonzero Choice-filter case and verify the filtered result is empty.
- Cover New boundaries with injected time: strictly newer than 48 hours is New, exactly 48 hours is not, older is not, and undated is not.
- Cover Progress independence by projecting the same List under several filters and verifying answered, total, and percentage remain identical while visible rows change.
- Cover normal-quiz and new-only-quiz inputs through the same projection contract, including an empty new-only result and catalogue/Position ordering.
- Cover a null List, an empty catalogue, and a role-specific Kink with no applicable Position. Verify empty values and diagnostics, not thrown errors or console output.
- Cover Category omission when filtering leaves it with no visible rows and preservation of the general/role-specific split when either side remains populated.
- Add an integration smoke scenario using the running application: apply combined filters, compare visible rows with Progress, open both quiz modes, and export the visible List. The smoke verifies adapter wiring and user-observable behavior; it must not duplicate the projection's exhaustive domain matrix.
- Existing build, typecheck, and lint commands remain required verification after the cutover.

## Out of Scope

- Redesigning List persistence, Choice encoding, URL sharing, or storage-key format.
- Moving answer writes into the projection; the module is read-only and existing write ownership remains unchanged.
- Localizing or styling projection rows.
- Adding extension hooks, pluggable predicates, injected clock interfaces, catalogue repositories, or other hypothetical adapters.
- Reworking quiz interaction state beyond consuming a flat projected row sequence; broader quiz-session state-machine work remains separate.
- Replacing screenshot DOM cloning, selector-based layout extraction, fixed six-column styling, image generation, or download mechanics.
- Changing the meaning or displayed labels of Choice values.
- Changing catalogue content, Kink perspectives, List roles, or canonical Position order.

## Further Notes

- The domain terms List, Kink, Position, Choice, Display filter, New, and Progress carry the meanings in the repository domain documentation.
- ADR-0001 defines one row per answerable Position. ADR-0002 defines the single projection root, same-row filter conjunction, filter-independent Progress, quiz scopes, and the selected interface shape.
- The deliberate behavior change is that contradictory or cross-Position filter combinations no longer leak visible Kinks. Consumers must not preserve the prior Kink-level existential behavior for compatibility.
- The implementation is a clean cutover: all consumers move together and obsolete derivations are deleted in the same change.