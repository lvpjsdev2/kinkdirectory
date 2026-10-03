# 03: Move normal and new-only Quiz flows to the projection

**What to build:** The normal Quiz and new-only Quiz traverse the same projected Position rows in stable order, without inheriting the List screen's Display filters.

**Blocked by:** 01: Build the pure List projection seam.

**Status:** ready-for-agent

- [ ] Normal Quiz traverses every answerable Position in catalogue and canonical Position order.
- [ ] New-only Quiz traverses only unanswered Positions belonging to New Kinks.
- [ ] Both modes use the projection's filter vocabulary rather than a separate New or Position-selection implementation.
- [ ] The new-only Quiz completes cleanly when no matching Position exists.
- [ ] Quiz navigation uses the flat projected row sequence with one cursor.
- [ ] Existing answer writes remain owned by List state.
- [ ] New-Quiz availability is derived from the same New-plus-unanswered projection.
- [ ] A running-app smoke check covers normal Quiz, new-only Quiz, the empty new-only state, ordering, and answering.
