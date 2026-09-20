---
name: story-write
description: Turn a spec or feature request into user stories with testable acceptance criteria and a milestone build order. Use this whenever scope needs breaking into buildable pieces, when someone asks what to build first or in what order, when a feature needs acceptance criteria before coding, or right after a spec is written. Also use it when a milestone plan needs updating because work landed or scope changed.
---

# Writing stories and acceptance criteria

The job is to make "done" impossible to argue about. A story whose criteria cannot be checked will be declared finished while broken.

## Where it goes

`USER-STORIES.md` at the repository root, the companion to `SPEC.md`.

## Story shape

```
**US-AREA-1: Short title**
As a <kind of user>, I want <capability>, so that <benefit>.
- AC1: <a statement that can be checked as true or false>
- AC2: ...
```

Use a stable prefix per area, such as `US-ACC` for accounts, so criteria can be cited from tests, commits and documents for the life of the project.

## What makes a criterion testable

Replace judgement words with observable facts. "Fast" becomes "under 3 seconds on a mid-range phone". "Handles errors" becomes "a wrong passphrase shows an error and changes nothing".

**Anything involving arithmetic gets a worked example with real numbers**, chosen so a wrong implementation fails it. It becomes a unit test verbatim and settles arguments about rounding and sign conventions before they start:

```
AC3: Worked example that must pass as a unit test. Send 1,000.00 SAR with a
15.00 SAR fee at a provider rate of 14.80, mid-market 15.00. Received is
14,800.00 PHP. Total cost is 425.00 PHP, which is 2.79%.
```

## Cross-cutting rules

Open the document with the rules every story inherits: how money is stored, how dates behave, what offline means, what every record carries, performance expectations, and what "delete" means. Without this section the rules get restated inconsistently per story, and the third restatement contradicts the first.

## Product calls made while writing

Writing criteria surfaces decisions nobody made. Make them, and mark each one visibly so it can be reversed:

```
- AC2: Recurring items are recorded only after the user confirms, with the
  amount editable. **[DECISION: confirm rather than auto-post, since amounts vary]**
```

Collect these in your handover message so they get reviewed rather than absorbed.

## Build order

End with a milestone table: number, stories, what the user can do when it is done, and status. Two rules keep it honest.

**Every milestone produces something usable.** "Database layer" is not a milestone. "Accounts and transactions with correct multi-currency math" is.

**Order by what the product is for.** The feature that makes the product worth using comes early, not after the infrastructure is perfect. If the differentiating feature keeps sliding, say so plainly.

Status text should carry the caveat, not hide it: "Done 2026-09-20, not yet run on a device" tells the truth that "Done" does not.

## Finishing

Say which stories are ready to build, which decisions you made while writing, and what the first milestone is.
