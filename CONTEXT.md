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
