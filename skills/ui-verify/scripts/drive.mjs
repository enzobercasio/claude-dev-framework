#!/usr/bin/env node
/**
 * Drive a web app in a headless browser and capture what is on screen.
 *
 * Needs puppeteer-core and a local Chrome. Install once outside your project:
 *   npm install puppeteer-core
 * Override the browser with CHROME_PATH if it is somewhere unusual.
 *
 * Screenshot pages:
 *   node drive.mjs shots <baseUrl> <outDir> [paths...] [--dark] [--wait=8000]
 *
 * Drive a flow: import { session } from './drive.mjs'
 */
import { existsSync, mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error(`No Chrome found. Set CHROME_PATH. Looked in:\n${CHROME_CANDIDATES.join('\n')}`);
  return found;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Opens a browser and returns helpers. Remember to call close().
 * `profile` keeps storage between runs, which matters for apps that keep data on the device.
 */
export async function session({
  baseUrl,
  out = './shots',
  width = 400,
  height = 900,
  dark = false,
  profile,
  settleMs = 6000,
} = {}) {
  mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    userDataDir: profile,
    args: ['--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);

  const errors = [];
  page.on('pageerror', (e) => errors.push(`[crash] ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text().slice(0, 300)}`));
  // Accept confirmation dialogs so destructive flows can be exercised.
  page.on('dialog', async (d) => {
    errors.push(`[dialog] ${d.message().replace(/\n+/g, ' / ')}`);
    await d.accept();
  });

  const api = {
    page,
    errors,

    async open(path = '/', waitMs = settleMs) {
      await page.goto(baseUrl.replace(/\/$/, '') + path, { waitUntil: 'domcontentloaded' });
      await sleep(waitMs);
    },

    /** Everything on screen, as lines. This is what to assert against. */
    async text(lines = 40) {
      const body = await page.evaluate(() => document.body.innerText);
      return body.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, lines);
    },

    /**
     * Press the control whose visible text starts with `label`, ignoring leading icons and
     * trailing chevrons. `index` picks among matches in reading order, and -1 is the last.
     * The default is the first match, because a label often appears both in the content and in
     * a tab bar, and tapping the tab navigates away mid-flow, which is confusing to debug.
     */
    async tap(label, { index = 0, waitMs = 1200 } = {}) {
      const ok = await page.evaluate(
        ({ label, index }) => {
          const clean = (n) =>
            (n.innerText || '').trim().replace(/\s*[›>]\s*$/, '').replace(/^[^\w"'(\[]+/, '');
          const nodes = [...document.querySelectorAll('[role=button],[role=radio],[role=tab],[role=link],button,a')].filter(
            (n) => clean(n).startsWith(label),
          );
          const match = index < 0 ? nodes[nodes.length + index] : nodes[index];
          if (!match) return false;
          match.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          match.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
          match.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        },
        { label, index },
      );
      if (!ok) {
        const seen = await page.evaluate(() =>
          [...document.querySelectorAll('[role=button],[role=radio],[role=tab],button,a')]
            .map((n) => (n.innerText || '').replace(/\n/g, '/'))
            .filter(Boolean)
            .join(' ~ '),
        );
        throw new Error(`No control starting with "${label}".\nOn screen: ${seen}`);
      }
      await sleep(waitMs);
    },

    /**
     * Set an input found by its accessible label. Uses the native value setter so
     * framework-controlled inputs register the change.
     */
    async setField(label, value, { waitMs = 400, timeout = 20000 } = {}) {
      await page.waitForFunction(
        (label) => [...document.querySelectorAll('input,textarea')].some((i) => i.getAttribute('aria-label') === label),
        { timeout },
        label,
      );
      await page.evaluate(
        ({ label, value }) => {
          const el = [...document.querySelectorAll('input,textarea')].find((i) => i.getAttribute('aria-label') === label);
          const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        },
        { label, value },
      );
      await sleep(waitMs);
    },

    async shot(name) {
      const file = `${out}/${name}.png`;
      await page.screenshot({ path: file });
      return file;
    },

    async close() {
      if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
      else console.log('PAGE ERRORS: none');
      await browser.close();
    },
  };
  return api;
}

if (process.argv[2] === 'shots') {
  const args = process.argv.slice(3);
  const flags = args.filter((a) => a.startsWith('--'));
  const [baseUrl, out, ...paths] = args.filter((a) => !a.startsWith('--'));
  if (!baseUrl || !out) {
    console.error('usage: node drive.mjs shots <baseUrl> <outDir> [paths...] [--dark] [--wait=8000]');
    process.exit(1);
  }
  const waitFlag = flags.find((f) => f.startsWith('--wait='));
  const s = await session({ baseUrl, out, dark: flags.includes('--dark') });
  for (const path of paths.length ? paths : ['/']) {
    await s.open(path, waitFlag ? Number(waitFlag.split('=')[1]) : 8000);
    const name = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
    console.log(`${name}: ${(await s.text(12)).join(' | ')}`);
    console.log(`  saved ${await s.shot(name)}`);
  }
  await s.close();
}
