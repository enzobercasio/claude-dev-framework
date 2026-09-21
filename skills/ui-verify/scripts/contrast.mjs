import { session } from './drive.mjs';
import { PNG } from 'pngjs';

/**
 * Measures text contrast against the pixels actually behind it, on every screen you name, in one
 * colour scheme per run.
 *
 *   node contrast.mjs <baseUrl> <paths...> [--dark] [--profile=<dir>]
 *   node contrast.mjs http://localhost:8081 / /settings /accounts --dark
 *
 * Needs puppeteer-core and pngjs installed next to it.
 *
 * Why pixels rather than computed styles: walking up the DOM for a background colour misses a
 * gradient, a sibling drawn behind the text, and anything painted by a canvas. It reports
 * white-on-gradient as white-on-page, and a false alarm costs as much attention as a real finding.
 *
 * Thresholds are WCAG AA: 4.5 for body text, 3 for large text.
 */

const COLLECT = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.top < 0 || r.bottom > innerHeight) continue;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || parseFloat(st.opacity) === 0) continue;
    // Content behind a modal is dimmed on purpose, and measuring it reports the scrim as a
    // contrast failure on a screen the person is not looking at.
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    if (!hit || (hit !== el && !el.contains(hit) && !hit.contains(el))) continue;
    const text = el.textContent.trim();
    if (!text || /^[\\p{Extended_Pictographic}\\p{M}\\p{Co}\\u200d\\ufe0f\\s·]+$/u.test(text)) continue;
    out.push({
      text: text.slice(0, 38),
      color: st.color,
      opacity: parseFloat(st.opacity) || 1,
      size: parseFloat(st.fontSize),
      weight: parseInt(st.fontWeight) || 400,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    });
  }
  return out;
})()`;

const lum = (c) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const parseColor = (c) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  const p = m[1].split(',').map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
};

const args = process.argv.slice(2);
const dark = args.includes('--dark');
const profileArg = args.find((a) => a.startsWith('--profile='));
const positional = args.filter((a) => !a.startsWith('--'));
const [baseUrl, ...paths] = positional;
if (!baseUrl || !paths.length) {
  console.error('usage: node contrast.mjs <baseUrl> <paths...> [--dark] [--profile=<dir>]');
  process.exit(2);
}
const s = await session({
  baseUrl,
  out: './shots-contrast',
  profile: profileArg ? profileArg.slice('--profile='.length) : undefined,
  width: 400,
  height: 1100,
  dark,
});

const findings = [];
for (const path of paths) {
  await s.open(path, 8000);
  await new Promise((r) => setTimeout(r, 1200));
  const items = await s.page.evaluate(COLLECT);
  const buf = await s.page.screenshot({ type: 'png' });
  const png = PNG.sync.read(Buffer.from(buf));
  const scale = png.width / 400;

  for (const it of items) {
    const fg = parseColor(it.color);
    const x0 = Math.round(it.rect.x * scale), y0 = Math.round(it.rect.y * scale);
    const x1 = Math.min(png.width, Math.round((it.rect.x + it.rect.w) * scale));
    const y1 = Math.min(png.height, Math.round((it.rect.y + it.rect.h) * scale));
    // Sample a frame just outside the text box rather than inside it. Inside, a bold glyph or the
    // antialiasing around small letter-spaced capitals can outnumber the background it sits on.
    const pad = 4;
    const counts = new Map();
    for (let y = Math.max(0, y0 - pad); y < Math.min(png.height, y1 + pad); y++) {
      for (let x = Math.max(0, x0 - pad); x < Math.min(png.width, x1 + pad); x++) {
        if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
        const i = (png.width * y + x) << 2;
        const key = `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    if (!counts.size) continue;
    // Big bold glyphs can fill most of their own box, so the most common pixel would be the text
    // itself. Pixels close to the text colour are excluded before picking the background.
    const near = (k) => {
      const [r, g, b] = k.split(',').map(Number);
      return Math.abs(r - fg.r) + Math.abs(g - fg.g) + Math.abs(b - fg.b) < 60;
    };
    const candidates = [...counts.entries()].filter(([k]) => !near(k));
    if (!candidates.length) continue;
    const [best] = candidates.sort((a, b) => b[1] - a[1]);
    const [br, bg2, bb] = best[0].split(',').map(Number);
    const back = { r: br, g: bg2, b: bb };
    const blended = {
      r: fg.r * fg.a * it.opacity + back.r * (1 - fg.a * it.opacity),
      g: fg.g * fg.a * it.opacity + back.g * (1 - fg.a * it.opacity),
      b: fg.b * fg.a * it.opacity + back.b * (1 - fg.a * it.opacity),
    };
    const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(blended, back);
    if (cr < need) findings.push({ path, text: it.text, cr: +cr.toFixed(2), need, color: it.color, back: `rgb(${br},${bg2},${bb})`, size: it.size });
  }
}
await s.close();

const seen = new Set();
const unique = findings.filter((f) => { const k = f.path + f.text + f.cr; if (seen.has(k)) return false; seen.add(k); return true; });
console.log(`\n=== ${dark ? 'DARK' : 'LIGHT'}: ${unique.length} below threshold ===`);
for (const f of unique) console.log(`  ${f.path}  ${f.cr}/${f.need}  "${f.text}"  ${f.color} on ${f.back} @${f.size}px`);
