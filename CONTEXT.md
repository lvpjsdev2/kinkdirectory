# Kink Directory — Domain Glossary

One bounded context: the app lets a person record how they feel about a fixed
catalogue of kinks, from the point of view of a chosen role, and share that
record with a partner.

## Core nouns

**Kink** — one item in the catalogue (for example *Collar*). A kink is a
statement the user answers, not a thing they own.

**Category** — a group of kinks (*Restrictive*, *Pain*). Categories group for
scanning only; they carry no meaning of their own.

**Role** — the stance a **List** answers from: *Submissive*, *Dominant*, or
*Both*. Chosen once when the list is created and never inferred from answers.

**Position** — the partner slot a single rating is about. A kink is answered
once per position, and each answer is an independent statement. Positions are
named for the part the user plays, so they read the same in every role:

| Position | Means |
| --- | --- |
| `as_dom` | doing it as the dominant, to a partner |
| `for_sub` | doing it as the dominant, with a submissive partner |
| `as_sub` | receiving it as the submissive |
| `for_dom` | doing it as the submissive, for a dominant partner |
| `general` | role-independent; answered once |

`as_dom`/`for_sub` both have the user giving; `as_sub`/`for_dom` both have the
user receiving. The distinction is *whose* action it is, not the direction.

**Perspective** — whether the kink concerns the user (*self*) or the partner
(*partner*). A kink's data declares which role/perspective pairs it is
meaningful for; a position is one such pair.

**Allowed perspectives** — the pairs a role-specific kink can be answered
from. This is the kink's own specification, not a cache: `deep throat` allows
all four, `chastity` only two.

**Choice** — the rating for one position of one kink: Favorite, Like,
Indifferent, Maybe, Limit, Curious, or unanswered. *Unanswered* is not a
rating; it is the absence of one.

**List** — a person's saved record: a name, a role, and every choice made
across all kinks and positions. One person may hold several.

## Core statements

- A kink is answered **once per position** the list can answer it from. A kink
  reachable from two positions appears twice in the same list.
- A kink is **visible** when the list can answer at least one of its positions.
  Visibility is a consequence of positions, never a separate rule.
- A *Both* list is a **switch**: it answers as a dominant and as a submissive,
  so it carries all four positions. It is not "the sub role with extra steps".
- General kinks are role-independent and carry no position label.

## Disputed

Terms where the code and the intended meaning disagree. Each entry is a known
defect, not a definition.

**`general`** — three different things share this word: the `general` *format*
(role-independent kink), the `general` *category*, and the `general` *position*
(answered once). Distinguished by context, not by name. *Not yet renamed.*

**`0` in the choice scale** — the code treats it as both a sentinel ("not
entered") and member of an ordered scale (`KinkChoice` is `0 | 1 | … | 6`).
`getDisplayValue` is a leftover remapping table with five commented-out cases,
suggesting the displayed scale once differed from the stored one. *Unresolved:
what should the displayed numbers mean?*

**`giving` / `receiving`** — two-way labels that only work while one role is
fixed. With four positions they are ambiguous, so positions now use their own
labels. The old keys remain for the general section header.

**`subcategories.general`** — present in all 14 locale files, referenced by no
component. Dead translation key. *Candidate for deletion.*

## Not part of the model

Share links and screenshots are transports of a List, not distinct concepts.
Nothing in this glossary depends on how a List is stored or transmitted.
