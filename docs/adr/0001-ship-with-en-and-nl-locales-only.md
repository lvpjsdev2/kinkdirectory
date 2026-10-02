# 1. Ship with en + nl locales only

Date: 2026-10-02

## Status

Accepted

## Context

The catalog expansion (see the catalog expansion effort) requires authored translations for every new kink. Maintaining 14 locales means 14× translation and review work for every batch, with no capacity to review machine-translated content in languages nobody on the project speaks. Machine translations of sexual vocabulary are also frequently wrong or awkward, which is worse than not offering the language at all.

## Decision

Ship with only **English** and **Dutch** locales. Dutch stays in the codebase as the source of the type-safe message schema (`MessageSchema = typeof nl`); English remains the fallback locale. The other eleven locale files (es, fr, de, it, pt, zh, ja, ko, ar, hi, hu) are removed from the repository.

## Consequences

- Restoring a removed locale is a cheap git operation plus re-running the translation pipeline, so removing the files outright is safe.
- The language switcher and `SUPPORTED_LOCALES` shrink accordingly.
- Future batches only need nl authoring + en review per kink.
- Users on the removed locales fall back to English.
