# 2. "New kink" means added after the list was created

Date: 2026-10-02

## Status

Accepted

## Context

The catalog previously carried no `addedAt` timestamps; the "show only new" filter compared `addedAt` against a hard-coded 2-day wall-clock window. With no timestamps in the data, the filter never matched anything.

Expanding the catalog turns the filter into a real feature for the first time, so "new" must be defined. A wall-clock window ("added in the last N days") has two flaws: the window is an arbitrary knob, and users who don't open the app within N days permanently miss the "new" designation.

## Decision

A kink is **new** for a list if and only if its `addedAt` timestamp is later than the list's `created` timestamp. Newness is a relation between the catalog and each list, not a property of the calendar.

All kinks that existed before the catalog expansion get `addedAt` set to the release date of the expansion, so lists created before that date see the entire expansion as new. Lists created after it see nothing as new until the next batch.

## Consequences

- The 2-day wall-clock window is removed; no window constant remains.
- Every kink in the catalog must carry `addedAt`; the batch process sets it for new entries and the expansion release set it for pre-existing ones.
- "New" filters and counters always compare `addedAt > activeList.created`.
- Future batches automatically target exactly the lists that predate them.
