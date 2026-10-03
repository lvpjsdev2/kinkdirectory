# 01: Build the pure List projection seam

**What to build:** A deterministic projection of a List into ordered Category-grouped Position rows that can be consumed without Vue or browser state.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] General Kinks produce exactly one `general` row; role-specific Kinks produce the canonical Position subset for `dom`, `sub`, and `both` Lists.
- [ ] New, unanswered, and Choice filters are applied as a same-row conjunction, including the contradictory unanswered-plus-nonzero Choice case.
- [ ] New is determined by `Kink.addedAt > List.created` (catalogue seconds versus List milliseconds) and excludes undated Kinks.
- [ ] Progress covers all answerable Positions and is independent of Display filters.
- [ ] Flat rows preserve catalogue and canonical Position order and expose Category identity, Kink, Position, Choice, and New state without locale or styling data.
- [ ] Normal-quiz and new-only-quiz row sets are expressible through the same projection contract.
- [ ] Null Lists and empty catalogues return empty projections; unanswerable role-specific Kinks become diagnostics without logging or throwing.
- [ ] Direct contract tests cover row expansion, filters, New boundaries, Progress, ordering, empty inputs, and diagnostics.
- [ ] Minimal TypeScript test configuration is added without introducing component-test infrastructure.
