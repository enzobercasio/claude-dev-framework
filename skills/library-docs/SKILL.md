---
name: library-docs
description: Check the documentation for the exact installed version of a library before using its API. Use this before writing code against any framework, SDK or package whose current API you are not certain of, when a library has released a major version recently, when code fails with "not a function", "cannot find module" or unexpected API errors, and when a project pins a version newer than you have seen. Also use it before upgrading dependencies.
---

# Read the version you actually have

Training data ages. A framework that changed its API last month will still be written the old way in your memory, and confident wrong code costs more than the minutes reading would have taken.

## Find the installed version first

Check what the project actually has, not what its manifest requests. A range like `~57.0.0` says little about what is installed:

```bash
node -p "require('<package>/package.json').version"
cat node_modules/<package>/package.json | grep '"version"'
pip show <package> | head -3
```

Check whether the project ships agent notes. Many frameworks now include a file saying "read the versioned docs before writing code", and it usually points at the right URL.

## Read the versioned documentation

Prefer a URL that pins the version, such as a `/versions/v57.0.0/` path, over the latest docs, which describe a version you may not have.

Read for three things: the exact function signatures you will call, anything marked deprecated or removed, and the breaking changes between the version you remember and the one installed.

Treat summaries carefully. A snippet can carry a line that belongs to a different project shape, such as a path to a file this project does not have. Take the API and leave the scaffolding.

## Before you install anything

Use the framework's own installer when it has one, because it picks versions that work together. A plain package install can pull a version that does not match the rest of the project.

Never run a dependency "fix" that resolves warnings by changing major versions. Downgrading a framework to satisfy an audit warning breaks the app in ways that take far longer to undo than the warning was worth.

## When the API still surprises you

Read the installed source. It is on disk and it is the truth:

```bash
grep -rn "export declare function <name>" node_modules/<package>/build/*.d.ts
```

Platform differences are worth checking here too. A function that exists on one platform can throw on another, and a type definition often reveals an option that solves the problem.

## Reporting

Say which version you read for, and cite behaviour you confirmed rather than remembered. If the docs contradicted what you expected, say so, since the person may be carrying the same wrong assumption.
