# 1. Ship with en + ru locales

Date: 2026-10-02

## Status

Accepted

## Context

The catalog expansion requires authored translations for every new kink. Maintaining 14 locales means 14× translation and review work per batch, with no capacity to review machine-translated content in languages nobody on the project speaks. Machine translations of sexual vocabulary are also frequently wrong or awkward, which is worse than not offering the language at all.

## Decision

The UI ships **English** and **Russian**. Dutch stays in the repository as the source of the type-safe message schema (`MessageSchema = typeof nl`) and the language new labels are authored in — it is kept as the reserve, not offered in the language switcher. English remains the fallback locale.

The other eleven locale files (es, fr, de, it, pt, zh, ja, ko, ar, hi, hu) are removed from the repository, along with their translation CSVs and the `translate` script that fed the machine-translation pipeline. The manual CSV workflow (`export-translations` / `import-translations`) stays.

## Consequences

- The language switcher offers exactly two locales; the "auto" option resolves against those two.
- Restoring a removed locale is a cheap git operation plus re-running the manual CSV workflow.
- New kinks need `en` and `ru` labels. Dutch labels are optional; the schema tolerates their absence.
- Visitors on the removed locales fall back to English.
- `.cursor/rules/kdirectory.mdc` no longer instructs auto-translation.
