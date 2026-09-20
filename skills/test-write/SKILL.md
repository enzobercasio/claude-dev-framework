---
name: test-write
description: Decide what to test and write those tests, from acceptance criteria and edge cases. Use this whenever tests are needed for new code, when someone asks for test coverage or "add tests", when a bug needs a regression test, or when deciding what is worth testing at all. Also use it before building anything with money, dates, currency conversion or other arithmetic a person would check by hand.
---

# Writing tests that earn their keep

A test suite is a claim about what the software does. Tests that restate the implementation make that claim louder without making it truer.

## What to test, in priority order

1. **Arithmetic and rules people would check by hand.** Money, rates, dates, tax, rounding, thresholds. These break quietly and cost trust.
2. **Every acceptance criterion the data layer enforces.** One test per rule, named after the rule.
3. **Edge cases that appear in real use.** Month ends, leap years, year boundaries, empty lists, a single item, negative amounts, missing reference data, the largest value someone might enter.
4. **Regressions.** Every bug that reached a person gets a test that fails without the fix.
5. **A performance sanity check** when a screen will hold a lot of rows. Load a realistic volume and assert the query stays under a bound.

## What not to test

Framework behaviour, database engines, and getters. Mocks that assert a function called another function test the wiring you just wrote, and they fail when you improve the code rather than when you break it.

## Naming

Name tests after the promise, not the function. `it('keeps the chosen day of the month, even after a short month')` tells a failing build what broke. `it('nextDue works')` does not. Cite the criterion identifier when there is one.

## Structure that keeps tests readable

Use table-driven cases for input and output pairs. Build small helpers for fixtures so a test body shows only what makes that case different.

For storage rules, run the real code against an in-memory database through the same interface the application uses. That tests the queries, constraints and transactions rather than a mock of them.

Inject the clock and ID generation so a test can advance time and expect stable identifiers. Tests that depend on the real clock fail at month end, usually while someone is trying to ship.

## Worked examples from the criteria

When a criterion carries a worked example, transcribe it exactly, and add a comment saying where it came from. Include a case that fails under the obvious wrong implementation, such as floating-point arithmetic, so the test defends the decision rather than just the result.

## After writing

Run the whole suite, not just the new file. Report the count and anything you chose not to cover, with the reason. Silence about a gap reads as coverage.
