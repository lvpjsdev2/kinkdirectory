# Domain docs: single-context

One bounded context, no `CONTEXT-MAP.md`.

- `CONTEXT.md` — the glossary; canonical terms only, no implementation details, no specs.
- `docs/adr/` — one file per decision, numbered from `0001-`, kebab-case slugs.

## Rules for agents

- Read `CONTEXT.md` before discussing domain wording; call out conflicts instead of silently picking one. If a file above does not exist, proceed silently — don't flag its absence or suggest creating it upfront.
- Update a term in `CONTEXT.md` the moment it is resolved, not at the end.
- Write an ADR only when all three hold: hard to reverse, surprising without context, the result of a real trade-off.
- Accepted ADRs are immutable; supersede rather than rewrite.
- Docs are English; conversation may be in any language the user asks for.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
