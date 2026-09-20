---
name: bug-hunt
description: Diagnose a failure to its root cause before changing anything, then fix it and prove it. Use this whenever something is broken, erroring, crashing, failing or behaving unexpectedly, when someone pastes an error message or stack trace, when a build or command stops working that used to work, or when a fix needs a regression test. Also use it before changing code in response to a symptom you have not reproduced.
---

# Finding the actual cause

The temptation is to recognise the error, apply the usual fix, and move on. When the cause is different from the usual one, that leaves the original problem in place plus a change nobody understands.

## Order of work

**Reproduce it first.** Run the failing thing yourself. An error you have not seen is a rumour. If you cannot reproduce it, say so and ask for what you need rather than guessing.

**Read the whole error.** The first line names the symptom; the useful part is usually further down: the module that failed to resolve, the path, the version, the call that started it.

**Ask what changed.** Most breakage follows a change: a dependency, a configuration file, an environment, a command someone ran. Package manager logs, shell history and `git log` answer this quickly and beat speculation.

**Prove the cause before fixing.** You should be able to say "X happened, which caused Y". If you can only say "it looks like Y", keep going. A fix aimed at a symptom often hides it.

**Check for a bigger cause.** When a symptom appears in one place, look for the same mistake elsewhere. Several instances usually share a root.

## Fixing

Choose the smallest change that removes the cause. Reverting something that should never have happened beats layering a workaround on top.

When the cause is outside your code, fix the cause where it lives: restore the files a bad command rewrote, pin the version, correct the configuration. Then leave a note so the same command does not get run again.

**Write a regression test** that fails without the fix, whenever the bug is in logic rather than environment. Bugs that reached a person tend to return.

## Before you change system state

Restarting, deleting, reinstalling and rewriting configuration are all easy to do and sometimes impossible to undo. Check that your evidence supports that specific action. A symptom that pattern-matches a known failure may have a different cause, and the cleanup can cost more than the bug.

## Reporting

Say what the cause was, what you changed, and how you proved it is fixed. Name anything you noticed but did not fix. If the cause was something a person did, say it plainly and without blame, and say how to avoid it, because they will hit it again otherwise.
