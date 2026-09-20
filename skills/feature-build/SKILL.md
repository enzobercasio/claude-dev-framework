---
name: feature-build
description: Implement a feature or milestone from its acceptance criteria, in layers, with tests and verification. Use this whenever someone asks to build, implement or add a feature, to work through a story or milestone, or says "build X" about an application. Also use it when picking up planned work such as "build all M2 requirements" or "start the next milestone".
---

# Building a feature

Work outward from the rules to the screens. Logic that lives in a screen cannot be tested, gets copied into the next screen, and drifts.

## Before writing code

Read the acceptance criteria for what you are building. If none exist, write them first with `story-write`. Building against a vague request produces something nobody can accept.

Check how the project already does things: money handling, IDs, timestamps, error types, naming. Consistency matters more than your preference.

If the feature uses a library you have not used at this exact version, load `library-docs` first. Guessing an API wastes more time than reading.

## Layer order

1. **Domain.** Pure functions and types with no database and no framework. Money arithmetic, date rules, conversions, validation shapes. This is where correctness is won, and it is the cheapest thing to test.
2. **Storage.** Schema changes as a new migration, never an edit to one that shipped. Repositories hold the business rules. Give them a small database interface so tests can run the same code against an in-memory database.
3. **Data access.** The thin layer screens use: loaders, hooks, caches, invalidation.
4. **Screens.** Layout, input, feedback. A screen should read as a description of the interface, not of the rules.

Write tests beside each layer as you finish it, not at the end. See `test-write`.

## Rules worth holding to

**Business rules belong in one place.** If two screens can both create a record, the validation goes underneath them both. Every rule in a repository should be traceable to a criterion.

**Money is integer minor units plus a currency code.** Never floating point. Convert with exact fractions and round once, half to even. A rate times an amount in floating point produces 199.9999 where the answer is 200.

**Every stored record gets an ID, created and updated timestamps, and a soft-delete field**, even when nothing needs them yet. Adding sync or undo later to a table without them means a migration under pressure.

**Validate at the boundary, in the user's words.** Error messages are interface text. "Enter an amount greater than zero, like 250" beats "invalid input".

**Never log amounts, balances or anything personal.** Logs get shipped to crash reporters.

## Decisions during the build

You will hit questions the criteria do not answer. Decide, using the smallest choice that keeps the door open, and say so plainly in your handover rather than burying it. Mark the decision in the changelog with its reasoning.

If you find a real problem with the request, say it in a sentence or two, then build the whole thing anyway under a stated assumption. Scaling work down is the other person's call.

## Before saying it is done

Run the project's checks: tests, type checking, lint. All must pass.

Then look at the thing running, with `ui-verify`. Passing tests say the rules hold. They say nothing about whether the screen is usable, the empty state reads well, or the layout survives dark mode.

Report what you built, the decisions you made, and anything you could not verify. "Not yet run on a device" is information the reader needs.
