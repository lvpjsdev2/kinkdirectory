## Agent skills

### Issue tracker

<<<<<<< HEAD
Issues are local markdown files under `.scratch/<feature>/issues/`, one file per ticket, with blocking edges in front matter. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one glossary at `CONTEXT.md`, ADRs under `docs/adr/`. See `docs/agents/domain.md`.

## Project conventions

Canonical conventions live in `.cursor/rules/kdirectory.mdc` — read it before writing code.

Package manager: **npm**. `package-lock.json` is the source of truth, CI installs with `npm ci`, and the stale "Use BUN" rule has been corrected.

One rule still contradicts the repo and is tracked by ticket 002: the Cursor rule says "NL + auto translate to other languages", while ADR 0001 dropped auto-translation and settled on en + nl only.
=======
Issues and specs are tracked as local Markdown under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses a single-context layout. See `docs/agents/domain.md`.
>>>>>>> lvpjsdev/improve
