---
name: ship-check
description: Run the checks that must pass before committing, pushing or publishing, and record the change. Use this whenever someone asks to commit, push, ship, release or "save this work", before creating a repository or making one public, and at the end of any piece of work that touched code. Also use it before handing work to someone else, to catch what tests alone miss.
---

# Before it leaves your machine

The cost of a broken commit is paid by whoever pulls it next, usually while trying to do something else.

## The gate

Run in this order, because each is cheaper than the next:

1. **Type check.** Catches the most for the least time.
2. **Lint.** Fix what it reports rather than silencing it. A suppression comment is a decision and needs a reason next to it.
3. **Tests.** The whole suite, not the files you touched.
4. **Look at it running** if the change touches an interface. See `ui-verify`.

If any fail, fix them. Reporting "committed, though two tests fail" makes the next person debug your work.

## Record the change

Add an entry to `CHANGELOG.md` in the same commit as the change. A commit without one leaves the project with history nobody can read without `git log`.

Group entries under **Decided**, **Added**, **Changed**, **Removed**, **Fixed**. Write what changed and why in a sentence or two. The why is the part git cannot reconstruct.

When work finishes a milestone, update the status in `USER-STORIES.md` and the overview with `project-status`. Stale status is worse than none, because people rely on it.

## Before a first push, or before anything becomes public

Publishing is hard to take back, and search engines index quickly. Run `scripts/scan-secrets.sh`, which checks tracked files and full history for keys, tokens and credential files, then reports what an ignore file should cover.

Beyond secrets, check for anything a person would not want published: real names, addresses, internal URLs, customer data in fixtures, and database or backup files holding real records.

Make sure the ignore file covers what the project could produce later: environment files, service credentials, local databases, backups and exports. Preventing a commit is easy; removing one from history is not.

## Commit messages

One line saying what changed and why, in the imperative. Add a short body when the reasoning is not obvious. Follow the project's existing style, including any attribution lines the environment asks for.

## Pushing and publishing

Commit and push when asked, and say which branch. Creating a repository, making one public, or publishing a package is outward facing: confirm first unless already told to proceed, and confirm visibility explicitly.

After pushing, verify rather than assume. Check that the remote has what you expect, and that a repository meant to be private actually is.

## Reporting

Say what you ran and what passed, in one line each. Name anything you could not verify. "Tests and types pass, not run on a device" is an honest summary. "Done" is not.
