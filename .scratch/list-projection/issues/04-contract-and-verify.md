# 04: Contract old List derivations and verify the full cutover

**What to build:** There is one authoritative read-side projection, obsolete List derivations are removed, and the complete List, Quiz, Progress, and export flow is verified together.

**Blocked by:** 02: Move List rendering, filters, and Progress to the projection; 03: Move normal and new-only Quiz flows to the projection.

**Status:** ready-for-agent

- [ ] Old Kink-level visibility and filter derivations are deleted.
- [ ] Old Position-expansion and Progress loops are deleted.
- [ ] Old Quiz subset, New calculation, and New-availability derivations are deleted.
- [ ] No compatibility aliases or second projection root remain.
- [ ] All read-side consumers use the agreed projection seam.
- [ ] Build, typecheck, lint, and projection tests pass.
- [ ] One end-to-end smoke run covers filtered List rendering, filter-independent Progress, both Quiz modes, locale-independent projection data, and screenshot export.
- [ ] ADR-0002 and the implementation contract remain consistent with the landed behavior.
