---
name: spec-gather
description: Turn a rough product idea into a written specification with decisions, scope and open questions. Use this whenever someone wants to brainstorm a new product or feature, says they want to "think through" or "scope" an idea before building, asks for a spec, PRD or requirements document, or starts describing something they want to build without saying how. Also use it when an existing SPEC.md needs a decision recorded or scope changed.
---

# Gathering a specification

A spec earns its place by making disagreements visible before code is written. The output is a document someone can argue with, not a summary of what was said.

## Where it goes

`SPEC.md` at the repository root. If `project-scaffold` has run, the file already exists with headings to fill in.

## How to work

**Draft first, then ask.** Write a complete draft with your assumptions marked, rather than interviewing someone through twenty questions before showing anything. People correct a draft far more easily than they answer abstract questions. Mark every assumption inline so the reader knows what to attack.

**Ask in small batches, with a recommendation.** When you do ask, ask up to four questions at a time, each with two to four concrete options, your recommendation first and labelled. Say what each choice would cost or rule out. A question with no recommendation pushes work back onto the person who came to you for help.

**Only ask what changes the work.** If a choice has an obvious default and reversing it later is cheap, pick it, say you picked it, and move on. Reserve questions for decisions that change what gets built.

## What a spec contains

- **Vision**: who this is for and what it fixes, in a short paragraph.
- **Users**: the two or three kinds of people who will use it, with what each needs.
- **Problems**: what is broken today. This is what the features answer to.
- **Features**: grouped by area, including the ones deliberately left for later.
- **Scope**: what the first version includes and what is deferred. Freeze it explicitly, with a date.
- **Non-goals**: what this will not do. These prevent more arguments than the feature list.
- **Decisions**: a table of topic, decision and consequence. This is the most valuable part.
- **Technical approach**: stack and the rules that follow from it.
- **Data model sketch**: the main records and their relationships.
- **Open questions**: what still needs an answer, and who can give it.

## Recording decisions

Every decision gets its consequence written next to it. "Local-first data" is not a decision; "local-first data, so there is no login and sync must be designed for from day one" is.

When a decision is reversed later, keep the history: "Revised 2026-09-20, first from English only, then to a user setting." Someone will ask why the code looks the way it does, and the answer needs to survive.

Mark facts you have not verified as needing verification, especially anything about regulations, pricing, licensing or third-party limits. Do not let a guess harden into a requirement because it sat in a document unchallenged.

## Scope changes after a freeze

When someone asks for something outside frozen scope, build it if they want it, and record it as what it is: an addition made after the freeze, with the date and who asked. Silent scope growth is how a small project stops shipping. A line in the spec costs nothing and explains a lot later.

## Finishing

End by naming the decisions you recorded, the assumptions you made, and the questions that would change the work if answered differently. Then point at `story-write` to turn the scope into acceptance criteria.
