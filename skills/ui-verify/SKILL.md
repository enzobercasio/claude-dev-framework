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

## Measuring contrast

Eyes adapt. A palette that looks fine to you after an hour of staring at it can be unreadable to someone on a bus in daylight, and the failures cluster where nobody looks: a muted label a fraction under the line, a chip whose own translucent background dims the text it carries, a dark theme built by dimming the light one.

`scripts/contrast.mjs` walks the screens you name and measures every text against the pixels actually behind it:

```bash
node contrast.mjs http://localhost:8081 / /settings /accounts
node contrast.mjs http://localhost:8081 / /settings /accounts --dark
```

Install `pngjs` beside `puppeteer-core`. Run it once per scheme; the two rarely fail in the same places.

Measure pixels, not computed styles. Walking up the DOM for a background colour misses gradients and anything drawn by a sibling, and reports white-on-gradient as white-on-page. A false alarm costs as much attention as a real finding, so the checker has to earn trust.

Three things it will tell you that a palette review will not:

- **Opacity is part of the colour.** A label drawn at 85% on a coloured block is not the colour in your theme file. Text that passes at full opacity can fail as drawn.
- **A translucent chip changes its own backdrop.** White at 18% over a mid-tone lightens what its white label sits on.
- **Dark is not light dimmed.** Near black, every hue collapses towards the same grey: tints that are clearly different in light mode can sit at a contrast ratio of 1.0 against each other in dark, which is no difference at all. Dark tints have to be brighter than the surface they sit on.

Then put the thresholds in a unit test over the palette, covering the pairs the interface actually puts together, at the opacities they are really drawn at. Check the test by restoring the old colours: if it does not fail, it is not testing anything. The browser check finds the problem once; the test keeps it from coming back.

## What a browser structurally cannot find

Some controls are drawn by the operating system inside your layout: date and time pickers, the keyboard, scroll indicators, the caret, the status bar, menus. They take their appearance from the *phone's* setting, not your app's. If your app lets someone choose light or dark independently of the system, every one of these is a bug waiting on the mismatch: an app set to light on a phone set to dark draws white text on your white card and the control disappears.

A browser has none of these controls, so no amount of browser checking will show it. The web build usually substitutes its own element, which has the same bug in a different property, and fixing one does not fix the other.

When the framework offers a theme override, grep for every OS-drawn control and pass it the app's resolved scheme explicitly. Do this as a sweep the first time you find one, rather than fixing them as they are reported, because they are all the same bug and they will be reported one at a time by whoever is using a phone.

## Then actually look

Read the screenshots. Take the text output as proof the flow ran, and the image as proof it is usable. Check the things tests never cover: does the layout hold at phone width, is anything cut off, is contrast readable in both themes, does the empty state tell a new user what to do, are numbers formatted the way a person writes them.

## What to exercise

Walk one full path a real person takes, end to end, rather than each screen in isolation. Then check the states that only appear in real use: nothing yet, one item, many items, an error, and an action that asks for confirmation.

When a flow involves money, read the numbers and verify one by hand. A screen that renders beautifully with a wrong total is worse than one that fails.

## Reporting

Say what you did, what you saw, and what you did not check. Include the numbers you verified. If something looks wrong but is out of scope, say so rather than fixing it silently.
