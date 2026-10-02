# Spec: catalog expansion

Status: ready for tickets
Last updated: 2026-10-02

## Goal

Add a reviewed batch of ~180 kinks to the catalog, make the "new kinks" feature actually work, and cut the locale surface to the two languages we can maintain.

## Context

The catalog holds 179 kinks (119 role-specific, 60 general) with keys up to 301. The share-link format packs a kink key into 10 bits, so keys run out at 1023 — this batch lands around 359 and changes nothing about the format.

Three things are broken or missing today:

1. `addedAt` exists on only 52 kinks (an April 2025 batch); the "show only new" filter compares it against a hard-coded 2-day wall-clock window, so it is both rarely true and meaningless for long-lived lists.
2. Locales are 14 while translation review capacity is effectively two languages.
3. Kinks are added by hand-editing `src/data/kinks.ts`, which is how `double_penetration` ended up in the catalog twice under the same id.

## Decisions this spec implements

| ADR | Decision |
|---|---|
| [0001](../../docs/adr/0001-ship-with-en-and-nl-locales-only.md) | Ship en + nl only; delete the other eleven locale files |
| [0002](../../docs/adr/0002-new-kink-relative-to-list-creation.md) | "New" means `kink.addedAt > list.created`; no wall-clock window |

Vocabulary for every term used below is in [`CONTEXT.md`](../../CONTEXT.md).

## Scope

In:

- A batch of ~180 kinks from [`catalog-expansion-draft.md`](../catalog-expansion-draft.md), across 18 existing categories plus three new ones: `aftercare`, `communication`, `service_ritual`.
- The add-kink script: key assignment, insertion, locale stubs, `addedAt` stamping, and a Markdown review report.
- Newness semantics per ADR 0002, including stamping the 127 kinks that have no `addedAt`.
- Locale reduction to en + nl.
- Two known data defects: the duplicate `double_penetration` id, and the stale `KinkList.selections` comment in `src/types/index.ts`.

Out:

- **Role mode / simple mode** — the fourth role value, position collapsing, share-link role byte `3=none`. Still under grilling (open questions Q17–Q21). Separate spec.
- Share-link format v2, comparisons between lists, category filtering.

## Data contract

### Kink entry

```ts
const _entry: KinkDefinition = {
  id: 'water_snacks', // unique across the whole catalog
  format: 'general', // or 'role_specific'
  key: 302, // assigned by the script, never by hand
  addedAt: 1767225600, // batch release date, seconds since epoch
  // role_specific only:
  allowedPerspectives: [
    { role: 'dom', perspective: 'self' },
    { role: 'dom', perspective: 'partner' },
    { role: 'sub', perspective: 'self' },
    { role: 'sub', perspective: 'partner' },
  ],
}
```

Rules:

- `key` is assigned sequentially from the highest existing key plus one. Keys are never reused or renumbered; a removed kink leaves its key burned.
- `id` must be unique catalog-wide. This is the defect the script must catch.
- `addedAt` is set once, at insert time, for the whole batch.
- Timestamps are seconds since epoch, matching the existing April 2025 values.
- `role_specific` entries default to all four role×perspective combinations; the batch input may narrow them explicitly.

### Batch input

```json
{
  "id": "catalog-expansion-2026-10",
  "addedAt": 1767225600,
  "items": [
    { "category": "aftercare", "id": "water_snacks", "en": "Water and snacks afterwards", "nl": "Water en snacks achteraf", "format": "general" },
    { "category": "communication", "id": "safeword_stoplight", "en": "Traffic-light safeword system", "nl": "Stoplicht-systeem voor safewoorden", "format": "role_specific" }
  ]
}
```

### Locale entries

Each new kink needs `en` and `nl` labels. No other locale is written. The script writes stubs derived from the input; the author edits wording afterwards.

### Newness

`recentlyAddedKinds`, `newUnfilledPositionsCount` and `shouldShowKink` compare `kink.addedAt > activeList.created`. Lists created after a batch see nothing new until the next batch. All kinks that predate this batch and lack `addedAt` are stamped with the batch release date, so every existing list sees the whole batch as new.

With no active list there is nothing to compare against, so no "new" indicators are shown.

## Add-kink script contract

`src/scripts/add-kinks.ts`, run via `yarn add-kinks <batch-file>`:

1. Parse the batch file; fail loudly on malformed input.
2. Validate: unique `id` catalog-wide, category exists or is declared in the batch, `format` valid, `allowedPerspectives` only on `role_specific`, labels present.
3. `--dry-run` prints the plan — ids, assigned keys, target files — and writes nothing.
4. Insert entries into `src/data/kinks.ts`, write locale stubs into `en.json` and `nl.json`, stamp `addedAt`.
5. Re-running with the same batch file is a no-op: ids already present are skipped.
6. Generate `docs/reviews/<batch-id>.md`: one row per kink (key, category, id, labels, format, positions derived per role) plus warnings for `role_specific` entries that yield zero positions for some role, labels missing from a locale, and ids similar to existing ones.

The report exists because role-specific data cannot be eyeballed from a diff; the author reads the table and confirms each combination.

## Locale reduction

Delete `es, fr, de, it, pt, zh, ja, ko, ar, hi, hu` from `src/locales/`. Remove them from `SUPPORTED_LOCALES` and the messages map in `src/i18n/index.ts`, and from the language switcher. Keep `nl` as the type source (`MessageSchema = typeof nl`) and `en` as the fallback. Remove the `translate` script from `package.json`. Update the language list in `README.md`.

## Acceptance criteria

- [ ] Every accepted draft kink exists in `src/data/kinks.ts` with a unique id, a unique key, and `addedAt` set.
- [ ] `yarn typecheck` and `yarn lint` pass.
- [ ] `src/locales/` contains only `en.json` and `nl.json`; the app boots in both and the switcher offers exactly those two.
- [ ] A list created before the batch shows the batch as new; a list created after does not; the 2-day window is gone from the code.
- [ ] A share link created after the change round-trips a new key (e.g. `key: 302`) without loss.
- [ ] The review report has been read and its warnings resolved or consciously accepted.
- [ ] `double_penetration` appears once in the catalog.
- [ ] `KinkList.selections` in `src/types/index.ts` documents the real format (`key%position`).

## Risks

- **Draft quality**: 180 items drafted in one pass, with Dutch as a non-native draft. The review report and an author pass are the mitigation; expect wording churn.
- **Duplicate ids beyond the one we found**: near-duplicate wording with different ids will pass id validation. The report's similarity warning is the only guard.
- **Locale deletion is user-visible**: visitors on the eleven removed locales fall back to English. Accepted in ADR 0001.
- **Stamping 127 kinks** makes one batch look "new" to every existing list at once. Intended, per ADR 0002.
