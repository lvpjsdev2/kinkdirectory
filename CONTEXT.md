<<<<<<< HEAD
# Glossary

Canonical vocabulary of the Kink Directory. Implementation details live in the code and in ADRs, not here.

## Catalog

**Kink** — A single rateable item in the catalog. Belongs to exactly one category.

**Category** — A named group of kinks.

**General kink** — A kink that receives a single rating, independent of roles.

**Role-specific kink** — A kink rated separately per position, because it means different things depending on which side of it you are.

**Position** — The side a rating is given from on a role-specific kink: as the dominant, as the submissive, for the dominant, or for the submissive. General kinks have exactly one implicit position.

**Perspective** — Whether a rating is about yourself (self) or about your partner (partner). Positions of role-specific kinks are derived from role × perspective.

**Role** — The list owner's stance: dominant, submissive, or both. The role decides which kinks and positions are visible in a list.

**Rating** — One of six ordered values a position can receive: Favorite, Like, Indifferent, Maybe, Curious, Limit. The absence of a rating is "unrated".

**Kink key** — A stable number identifying a kink. It is never reused, renumbered, or reassigned — even if a kink's wording changes — because share links and saved lists reference it.

**Batch** — A set of kinks added to the catalog at the same time, sharing one `addedAt` timestamp. A list judges newness against the batch's timestamp, so a batch is either entirely new or entirely not new for any given list.

## Lists

**List** — A named, saved set of selections with its own role and creation date. Exactly one list is active at a time.

**Selection** — A single rating for one (kink, position) pair within a list.

**New kink** — A kink added to the catalog after the active list was created. Newness is relative to the list, not to the calendar.

**Quiz mode** — A guided flow that walks through every visible (kink, position) pair of the active list one at a time.

**Share link** — A URL that encodes a list so a partner can view it.

**View mode** — Browsing a list decoded from a share link without saving it.

**Import** — Copying a viewed shared list into your own saved lists.
=======
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

**Position row** — one answerable unit of a List: a Kink together with one
Position it can be answered from. A List renders one row per Position, and
each row stands on its own.

**Display filter** — a restriction on which Position rows are shown (New
only, unanswered only, or by Choice). A filter changes the view, never the
List. _Avoid_: unfilled (except as the filter's display label).

**New** — a Kink that entered the catalogue within the last two days:
strictly newer than 48 hours. A Kink with no recorded date is never New.

**Progress** — how much of a List is answered: the share of its answerable
Positions that carry a Choice. Always measured over the whole List, never
over a filtered subset.

## Core statements

- A kink is answered **once per position** the list can answer it from. A kink
  reachable from two positions appears twice in the same list.
- A kink is **visible** when the list can answer at least one of its positions.
  Visibility is a consequence of positions, never a separate rule.
- A *Both* list is a **switch**: it answers as a dominant and as a submissive,
  so it carries all four positions. It is not "the sub role with extra steps".
- General kinks are role-independent and carry no position label.
- Display filters are judged **by the Position row, not the Kink**. A row is
  visible under active filters only when that row itself satisfies every
  active filter; a Kink never qualifies through one of its other Positions.
- A filtered view is a subset of the List. Filtering never changes stored
  Choices, and Progress ignores filters entirely.

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
>>>>>>> lvpjsdev/improve
