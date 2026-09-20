---
name: project-status
description: Keep a project's overview honest: what is built, what is next, milestone progress, risks and what needs a decision. Use this whenever someone asks where a project stands, for a status summary or progress report, after finishing a milestone, when risks or priorities need review, or when someone asks what to work on next. Also use it when an overview document has gone stale.
---

# Keeping status honest

Status documents rot in one direction: towards optimism. Every update is a chance to correct that, so write what is true rather than what was planned.

## Where it goes

`OVERVIEW.md` at the repository root, the first thing a newcomer reads.

## What it holds

- **What it is**, in a short paragraph.
- **Where it stands**, in plain words, including what is not done.
- **A few numbers**: milestones done, tests passing, how it has been verified.
- **Built**, with an importance rating for each.
- **Pipeline**, with importance, milestone, and why it matters.
- **Milestones** and their status.
- **Risks**, with what to do about each.
- **Needs a decision**, listing what only the owner can answer.

## Rating importance

Three levels, defined where the reader can see them: must-have, meaning not worth shipping without; should-have, meaning expected but survivable for a while; nice-to-have, meaning real value and no urgency.

Rate against the product's purpose, not the work already done. A feature you just built is not must-have because it took effort.

## Verification, stated exactly

Distinguish tested, seen working, and shipped to a person. "Verified in a browser, not yet run on a phone" is the useful sentence. A reader who thinks something is proven when it is not will make plans on it.

## Risks worth writing

A risk is something that would change the plan if it happened, with something you could do about it. "Bugs may exist" is not a risk; it is a truism.

Look for these, since they hide well:
- **Work that cannot be undone yet.** No backup, no export, no rollback.
- **The feature that justifies the product not being built**, while easier things get added.
- **Placeholders treated as decisions**, such as a provider chosen for convenience.
- **Compliance and licensing**, which arrive late and block launch.
- **Scope added after a freeze**, which is worth counting.

Order by impact. Give each one an action, not a worry.

## When to update

At the end of every milestone, when scope changes, and when a risk becomes real or goes away. Reread the previous version and correct anything that is no longer true, rather than only appending.

Review the parked ideas at the same time. An idea whose trigger has been met should move into the plan, and one that is dead should be deleted with a line in the changelog.

## Reporting

Lead with the state, including the uncomfortable part. Then the top thing to do next, and what you need from the reader.
