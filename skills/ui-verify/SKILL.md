---
name: ui-verify
description: Drive a running app and look at it before calling work done. Use this after building or changing any user interface, when someone asks whether a change works, to check screens, layout, empty states, dark mode or a user flow end to end, or when a fix needs confirming in the real app rather than in tests. Also use it whenever you are about to tell someone a screen works without having seen it.
---

# Looking at the thing running

Passing tests say the rules hold. They say nothing about whether a screen is usable, whether the empty state reads well, or whether text is unreadable in dark mode. Claiming a screen works without seeing it is how broken screens ship.

## Pick the cheapest honest check

- **A web build in a headless browser** is fastest and needs no device. Best for layout, flows, states and copy.
- **A simulator or emulator** when the platform matters: native pickers, keyboards, permissions, gestures.
- **A real device** for anything about feel, performance or hardware.

Say which one you used. "Verified in a browser" and "verified on a phone" are different claims, and the reader is entitled to know which one you are making.

## Driving the app

`scripts/drive.mjs` wraps a headless browser with helpers that survive real interfaces: elements whose text starts with an emoji, rows with trailing chevrons, and inputs that a framework controls. Rebuilding these by hand wastes a session and produces flaky checks.

Install once, anywhere outside the project: `npm install puppeteer-core`.

Screenshot a set of pages:

```bash
node drive.mjs shots http://localhost:8081 ./shots / /settings /accounts
node drive.mjs shots http://localhost:8081 ./shots-dark / --dark
```

Drive a flow by importing the helpers:

```js
import { session } from './drive.mjs';
const s = await session({ baseUrl: 'http://localhost:8081', out: './shots' });
await s.open('/');
await s.tap('Add transaction');
await s.setField('Amount in SAR', '1,250.50');
await s.tap('Save');
console.log(await s.text());
await s.shot('after-save');
await s.close();
```

`tap` matches an accessible control by its visible text, ignoring leading icons. `setField` sets a value the way a framework-controlled input expects. `text()` returns what is on screen, which is what you assert against. Every page error is collected and printed at the end, so a silent crash cannot pass as success.

## Then actually look

Read the screenshots. Take the text output as proof the flow ran, and the image as proof it is usable. Check the things tests never cover: does the layout hold at phone width, is anything cut off, is contrast readable in both themes, does the empty state tell a new user what to do, are numbers formatted the way a person writes them.

## What to exercise

Walk one full path a real person takes, end to end, rather than each screen in isolation. Then check the states that only appear in real use: nothing yet, one item, many items, an error, and an action that asks for confirmation.

When a flow involves money, read the numbers and verify one by hand. A screen that renders beautifully with a wrong total is worse than one that fails.

## Reporting

Say what you did, what you saw, and what you did not check. Include the numbers you verified. If something looks wrong but is out of scope, say so rather than fixing it silently.
