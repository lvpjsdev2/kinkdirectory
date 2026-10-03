# 02: Move List rendering, filters, and Progress to the projection

**What to build:** The main List screen displays exactly the Position rows produced by the projection, while existing filter controls, Category sections, empty states, Progress, and visible export behavior remain coherent.

**Blocked by:** 01: Build the pure List projection seam.

**Status:** ready-for-agent

- [ ] List rendering consumes projection Category groups instead of re-expanding Kinks or re-evaluating filters.
- [ ] General and role-specific sections retain their existing presentation structure.
- [ ] Categories with no visible rows are omitted.
- [ ] Combined filters are evaluated per Position row; cross-Position matches do not leak.
- [ ] Contradictory unanswered-only plus nonzero Choice filters produce no rows.
- [ ] Progress remains unchanged when Display filters change.
- [ ] Null active-List state remains safe.
- [ ] Existing filter controls and clear-filter behavior continue to work.
- [ ] Exporting the visible List still reflects the projection-backed rendered rows; the screenshot DOM/html2canvas implementation is not redesigned here.
- [ ] A running-app smoke check covers filtering, visible rows, Progress, and export.
