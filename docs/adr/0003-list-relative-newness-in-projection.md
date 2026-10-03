# 0003 — List-relative Newness in the List Projection

**Status: Accepted**

The Newness clause in [ADR-0002 — One List projection behind one seam](./0002-one-list-projection-behind-one-seam.md) conflicts with [ADR-0002 — “New kink” means added after the list was created](./0002-new-kink-relative-to-list-creation.md) and the domain glossary: it describes a 48-hour wall-clock window. The List projection uses the authoritative domain meaning instead: a Kink is **New** for a List if and only if its `addedAt` timestamp is strictly later than that List's `created` timestamp; an undated Kink is never New. This supersedes only the Newness clause of the projection ADR. The projection compares catalogue seconds with List creation milliseconds and does not require an injected wall clock for Newness.

The choice preserves Newness across delayed visits and makes it a relation between the catalogue and the List rather than a calendar property. The existing projection seam, same-row filtering, filter-independent Progress, and quiz scopes remain unchanged.
