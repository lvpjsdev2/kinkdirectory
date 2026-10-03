<<<<<<< HEAD
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
=======
# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
>>>>>>> lvpjsdev/improve
