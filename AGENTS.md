## Agent skills

### Issue tracker

Issues are tracked in Linear; specs remain in `.scratch/<feature>/` as local working artifacts. See `docs/agents/issue-tracker.md`.

### Triage labels

Linear uses the default five-label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses a single-context layout. See `docs/agents/domain.md`.

## Project conventions

Canonical conventions live in `.cursor/rules/kdirectory.mdc` — read it before writing code.

Package manager: **npm**. `package-lock.json` is the source of truth, CI installs with `npm ci`, and the stale "Use BUN" rule has been corrected.
