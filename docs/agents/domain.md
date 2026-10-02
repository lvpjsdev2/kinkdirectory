# Domain docs: single-context

One bounded context, no `CONTEXT-MAP.md`.

- `CONTEXT.md` — the glossary; canonical terms only, no implementation details, no specs.
- `docs/adr/` — one file per decision, numbered from `0001-`, kebab-case slugs.

## Rules for agents

- Read `CONTEXT.md` before discussing domain wording; call out conflicts instead of silently picking one.
- Update a term in `CONTEXT.md` the moment it is resolved, not at the end.
- Write an ADR only when all three hold: hard to reverse, surprising without context, the result of a real trade-off.
- Accepted ADRs are immutable; supersede rather than rewrite.
- Docs are English; conversation may be in any language the user asks for.
