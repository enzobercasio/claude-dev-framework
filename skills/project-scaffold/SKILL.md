---
name: project-scaffold
description: Set up a project's documentation system and working rules at the start, or add it to a project that lacks one. Use this when starting a new project or repository, when someone asks how to organise a project, when a codebase has no spec, changelog or overview, or before beginning serious work on something that has only code. Also use it when adopting this way of working on an existing project.
---

# Setting up a project to be worked on

Six documents, each answering one question. The value is that each fact has exactly one home, so nothing has to be restated and nothing contradicts.

| File | Answers |
|---|---|
| `OVERVIEW.md` | Where does this stand, and what matters most? |
| `SPEC.md` | What are we building, and what did we decide? |
| `USER-STORIES.md` | What counts as done, and in what order? |
| `CHANGELOG.md` | What changed, when, and why? |
| `PARKED.md` | What did we decide not to build, and what would change that? |
| `README.md` | How do I run and work on this? |

Add `AGENTS.md` pointing at the overview and the rules, so anyone arriving mid-project starts in the right place.

## Setting it up

Copy the templates from `assets/` for the files that are missing, then fill in what you already know from the conversation or the codebase. Leave placeholders only where you genuinely lack the answer, and say which ones you left.

Do not overwrite an existing document. If a project already has a changelog in another format, keep it and adapt.

## Why these six

**Decisions need somewhere to live.** Without a home, the reasoning behind a choice survives only in the head of whoever made it. Six months later the code looks arbitrary and gets "fixed" back to the thing that did not work.

**"Done" needs a definition written before the work**, not after, or the definition bends to match what was built.

**Status rots towards optimism** unless something forces an honest update.

**Rejected ideas come back.** Writing down what would change the decision means the second conversation starts where the first ended.

## The working rules

Put these in the README, because they apply to every change:

- Every change gets a changelog entry in the same commit.
- Business rules live under the interface, not inside screens, and each has a test.
- Anything about money, dates or arithmetic gets a worked example in the criteria and a test.
- Say what has been verified and how, rather than implying more.

Add whatever the project's domain demands: how money is stored, what every record carries, what must never be logged.

## The workflow these support

`spec-gather` writes the spec. `story-write` turns scope into criteria and milestones. `feature-build` implements a milestone, with `test-write` and `library-docs`. `ui-verify` looks at it running. `ship-check` runs the gate and records the change. `project-status` keeps the overview true. `bug-hunt` handles what breaks.

## Reporting

List what you created, what you filled in, and what still needs answers. Then suggest the next step, usually gathering the spec.
