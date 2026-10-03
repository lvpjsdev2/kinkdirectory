# Issue tracker: Linear

Issues are tracked in Linear. Linear is the source of truth for work status,
ownership, labels, parent/child relationships, and blocking relations.

## Conventions

- One feature or effort has a parent Linear issue.
- The implementation specification is retained locally at
  `.scratch/<feature-slug>/spec.md` and copied or linked into the parent Linear
  issue description.
- Each implementation ticket is a separate Linear issue, preferably a child of
  the parent issue.
- Create tickets in dependency order so blocker references can be established
  immediately.
- Use native Linear `blocks` / `blocked by` relations for ticket dependencies.
- Use the team's existing Linear workflow states. Do not invent repository-local
  status names when Linear already provides an equivalent.
- Apply `ready-for-agent` to fully specified implementation tickets.
- Comments, implementation progress, PR links, and completion notes belong on
  the corresponding Linear issue.
- `.scratch/` may contain local specs, handoffs, and cached ticket material, but
  it is not the authoritative issue tracker.

## Tooling

Use Orca's Linear integration for Linear operations. Resolve the executable for
the session and load the version-matched guide before running commands:

    ORCA skills get orca-linear --json

Do not use `gh` or `glab` for this repository's issue workflow. Do not guess
Orca command names or flags; use the loaded guide or the executable's help.

## When a skill says "publish to the issue tracker"

Create or update the corresponding Linear issue. Preserve the local
`.scratch/<feature-slug>/spec.md` or ticket file as the working artifact, then
publish the issue title, description, acceptance criteria, labels, parent
relationship, and native blocking relations to Linear.

## When a skill says "fetch the relevant ticket"

Fetch the referenced Linear issue, including its description, status, labels,
parent/child relationships, blocking relations, and relevant comments.

## When a skill says "move a ticket"

Update the Linear issue's workflow state through Orca. Keep the local
`.scratch/` artifact unchanged unless the skill explicitly requests a sync.

## Parent and child issues

The parent issue describes the user-facing problem and solution. Child issues
are tracer-bullet implementation slices. A child must state its blockers and
must not be started until every blocking Linear relation is resolved.

## Local working artifacts

Local specs and handoffs use this layout:

- `.scratch/<feature-slug>/spec.md`
- `.scratch/<feature-slug>/issues/<NN>-<slug>.md`

These files support implementation and context handoff. They do not replace
Linear issues or Linear workflow state.
