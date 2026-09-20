# Claude development framework

Ten skills that carry a project from a rough idea to shipped code, and the documentation system they write into. Built from what worked while building a real app, and meant to be reused on the next one.

## Install

```bash
./install.sh              # link into ~/.claude/skills, available in every project
./install.sh --copy       # copy instead, for machines you do not control
./install.sh --project ~/code/my-app   # install into one project and commit it
./install.sh --uninstall
```

Restart Claude Code afterwards. Skills are invoked by name, or triggered automatically when a request matches.

## The skills

| Skill | What it does |
|---|---|
| `project-scaffold` | Sets up the six documents and the working rules |
| `spec-gather` | Turns an idea into a spec, with decisions and open questions |
| `story-write` | Turns scope into testable criteria and a milestone order |
| `feature-build` | Implements a milestone in layers, with tests |
| `test-write` | Decides what is worth testing, and writes it |
| `ui-verify` | Drives the running app and looks at it |
| `library-docs` | Reads the docs for the version actually installed |
| `bug-hunt` | Finds the root cause before changing anything |
| `ship-check` | Runs the gate, records the change, pushes safely |
| `project-status` | Keeps the overview honest |

## How they fit together

```
new project        project-scaffold
      |
idea to spec       spec-gather  ──►  story-write
      |
each milestone     feature-build ──► test-write ──► ui-verify ──► ship-check
      |                   └── library-docs when using an unfamiliar version
      |
something broke    bug-hunt
      |
milestone done     project-status  (and review PARKED.md)
```

## The documentation system

Six files, each answering one question, so every fact has one home.

| File | Answers |
|---|---|
| `OVERVIEW.md` | Where does this stand, and what matters most? |
| `SPEC.md` | What are we building, and what did we decide? |
| `USER-STORIES.md` | What counts as done, and in what order? |
| `CHANGELOG.md` | What changed, when, and why? |
| `PARKED.md` | What did we decide not to build, and what would change that? |
| `README.md` | How do I run and work on this? |

Templates are in `skills/project-scaffold/assets/`.

## What the skills insist on

These come from mistakes that cost real time:

- **Decisions are written with their consequence,** and kept when reversed. Otherwise the code looks arbitrary six months later.
- **Anything with arithmetic gets a worked example** in the criteria, which becomes a test. Rounding and sign arguments end there.
- **Business rules live under the interface,** where they can be tested once instead of copied into each screen.
- **Nothing is called done until it has been seen running.** Tests prove the rules, not that a screen is usable.
- **Status says how something was verified.** "Tested" and "run on a phone" are different claims.
- **Root cause before fix.** A symptom that matches a familiar bug may have a different cause.
- **Read the docs for the version installed.** Confident wrong code costs more than the minutes reading.

## Bundled scripts

- `skills/ui-verify/scripts/drive.mjs` drives a web app in a headless browser: tap by visible text, set framework-controlled inputs, capture screenshots, collect page errors. Needs `puppeteer-core` and a local Chrome.
- `skills/ship-check/scripts/scan-secrets.sh` scans a repository and its history for credentials before publishing.

## Making it yours

Skills are Markdown. Edit them. Project-specific rules, such as how money is stored or what must never be logged, belong in that project's README and agent notes rather than here, so these stay reusable.
