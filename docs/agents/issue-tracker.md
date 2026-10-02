# Issue tracker: local markdown

Issues are markdown files in this repository. There is no external tracker.

## Where tickets live

```
.scratch/<feature>/issues/NNN-<slug>.md
```

- One file per ticket, numbered from `001`, kebab-case slug.
- `.scratch/` is git-ignored: tickets are working state, not history. Durable decisions belong in `docs/adr/`, vocabulary in `CONTEXT.md`. Remove the ignore line if you would rather keep tickets in history.
- Work tickets blockers-first, by hand.

## Ticket format

```markdown
---
id: 003
title: Add-kink script assigns keys and stamps addedAt
status: ready
blocked-by: [001, 002]
---

What and why, in a few lines. Acceptance criteria as a checklist.
```

`blocked-by` carries the blocking edges `/to-tickets` produces. `/implement` picks a ticket only when every blocker is `done`.

## Why not GitHub Issues

GitHub Issues are disabled on `lvpjsdev2/kinkdirectory`, and the `gh` CLI in this environment is authenticated as `lvpjsdev`, which has no write access to that repository. Enabling Issues alone would not help: creating tickets needs an account with write access.

## If this changes

Switching back is a config change only: rewrite this file and the `### Issue tracker` line in `AGENTS.md`. Re-running the setup skill does the same thing.
