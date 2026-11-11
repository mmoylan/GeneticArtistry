// Leaf A: the chosen mark. Two leaflets of the site's leaf form the legs of an A, a tan crossbar finishes the letter.
// Company title only ("GENETIC ARTISTRY"), no subtitle. Transparent backgrounds.
//
//   node build-leaf-a.mjs              -> svg/leaf-a-<layout>-<scheme>.svg and sheet-leaf-a.html
//   node build-leaf-a.mjs --site       -> also writes the website's logo files (../../public/logo/*, ../../public/favicon.svg)
//
// Layouts: mark | below (text below) | above (text above) | horizontal | icon (rounded square, favicon / app icon)
// Schemes: color | ivory (for dark backgrounds) | mono-dark | mono-white (single colour: print, embroidery, stamps)
//
// The wordmark is live text (Bitter, Georgia fallback) with a fixed text length, so the layout does not depend on
// which font loads. Convert the text to outlines before print.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'svg'), { recursive: true });

// ---- the mark, drawn with its apex at (0,0). Bounding box: x -122..122, y -26..292 (244 x 318) ----
const PETAL = 'M0 0C-40 -93 -40 -217 0 -310C40 -217 40 -93 0 0Z'; // petal(310, 40) from the site's leaf drawing
const MARK = { x: -122, y: -26, w: 244, h: 318 };

const markInner = (c, id) =>
  `<defs><clipPath id="${id}-l"><rect x="-300" y="-60" width="299" height="420"/></clipPath><clipPath id="${id}-r"><rect x="1" y="-60" width="299" height="420"/></clipPath></defs>` +
  // the clips leave a 2-unit slit where the two legs overlap at the apex, so the A reads even in one flat colour
  `<g clip-path="url(#${id}-l)"><path transform="rotate(202)" d="${PETAL}" fill="${c.leg}"/></g>` +
  `<g clip-path="url(#${id}-r)"><path transform="rotate(158)" d="${PETAL}" fill="${c.leg}"/></g>` +
  `<rect x="-56" y="166" width="112" height="14" rx="7" fill="${c.bar}"/>` +
  `<circle cx="0" cy="-16" r="9" fill="${c.dot}"/>`;

const SCHEMES = {
  color: { leg: '#1f4d33', bar: '#c9b27a', dot: '#2f6b40', text: '#151c1a' },
  ivory: { leg: '#eef5ea', bar: '#d6c28a', dot: '#8fcf9a', text: '#eef5ea' },
  'mono-dark': { leg: '#151c1a', bar: '#151c1a', dot: '#151c1a', text: '#151c1a' },
  'mono-white': { leg: '#ffffff', bar: '#ffffff', dot: '#ffffff', text: '#ffffff' },
};
const ICON_SCHEMES = {
  color: { bg: '#1f4d33', leg: '#eef5ea', bar: '#d6c28a', dot: '#8fcf9a' },
  light: { bg: '#eef5ea', leg: '#1f4d33', bar: '#c9b27a', dot: '#2f6b40' },
};

// ---- wordmark: "GENETIC ARTISTRY", fixed length so spacing is the same in any font ----
const SERIF = "Bitter, Georgia, 'Times New Roman', serif";
const word = (x, baseline, size, fill, anchor = 'middle') => {
  const len = Math.round(size * 14.4);
  return { len, el: `<text x="${x}" y="${baseline}" text-anchor="${anchor}" font-family="${SERIF}" font-size="${size}" font-weight="500" fill="${fill}" textLength="${len}" lengthAdjust="spacing">GENETIC ARTISTRY</text>` };
};
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Genetic Artistry">${body}</svg>\n`;
const f = (n) => +n.toFixed(2);

function layout(kind, c, id) {
  const place = (s, ax, ay) => `<g transform="translate(${f(ax)} ${f(ay)}) scale(${s})">${markInner(c, id)}</g>`;
  if (kind === 'mark') {
    const pad = 12;
    return svg(MARK.w + pad * 2, MARK.h + pad * 2, place(1, MARK.w / 2 + pad, -MARK.y + pad));
  }
  if (kind === 'below' || kind === 'above') {
    const s = 1.1, F = 36, pad = 28, gap = 32, cap = F * 0.72;
    const { len, el } = word(0, 0, F, c.text);
    const W = len + 2 * pad, markH = MARK.h * s;
    if (kind === 'below') {
      const top = pad, baseline = top + markH + gap + cap, H = baseline + pad;
      return svg(W, f(H), place(s, W / 2, top - MARK.y * s) + word(W / 2, f(baseline), F, c.text).el);
    }
    const baseline = pad + cap, top = baseline + gap, H = top + markH + pad;
    return svg(W, f(H), word(W / 2, f(baseline), F, c.text).el + place(s, W / 2, top - MARK.y * s));
  }
  if (kind === 'horizontal') {
    const s = 0.78, F = 40, pad = 28, gap = 44;
    const { len } = word(0, 0, F, c.text);
    const markW = MARK.w * s, markH = MARK.h * s, H = markH + pad * 2, W = pad + markW + gap + len + pad;
    return svg(f(W), f(H), place(s, pad + markW / 2, pad - MARK.y * s) + word(f(pad + markW + gap), f(H / 2 + F * 0.36), F, c.text, 'start').el);
  }
  throw new Error('unknown layout ' + kind);
}

function icon(c, id) {
  const s = 0.95, size = 512;
  const ax = size / 2, ay = (size - MARK.h * s) / 2 - MARK.y * s;
  return svg(size, size, `<rect width="${size}" height="${size}" rx="112" fill="${c.bg}"/><g transform="translate(${ax} ${f(ay)}) scale(${s})">${markInner(c, id)}</g>`);
}

const files = {};
for (const kind of ['mark', 'below', 'above', 'horizontal'])
  for (const [name, c] of Object.entries(SCHEMES)) files[`leaf-a-${kind}-${name}.svg`] = layout(kind, c, `la${kind[0]}`);
for (const [name, c] of Object.entries(ICON_SCHEMES)) files[`leaf-a-icon-${name}.svg`] = icon(c, 'lai');
for (const [name, body] of Object.entries(files)) writeFileSync(join(here, 'svg', name), body);

// ---- website files ----
if (process.argv.includes('--site')) {
  const pub = join(here, '..', '..', 'public');
  mkdirSync(join(pub, 'logo'), { recursive: true });
  const map = {
    'logo-mark.svg': 'leaf-a-mark-color', 'logo-mark-ivory.svg': 'leaf-a-mark-ivory',
    'logo-text-below.svg': 'leaf-a-below-color', 'logo-text-below-ivory.svg': 'leaf-a-below-ivory',
    'logo-text-above.svg': 'leaf-a-above-color', 'logo-text-above-ivory.svg': 'leaf-a-above-ivory',
    'logo-horizontal.svg': 'leaf-a-horizontal-color', 'logo-horizontal-ivory.svg': 'leaf-a-horizontal-ivory',
    'logo-mono-dark.svg': 'leaf-a-below-mono-dark', 'logo-mono-white.svg': 'leaf-a-below-mono-white',
  };
  for (const [out, src] of Object.entries(map)) writeFileSync(join(pub, 'logo', out), files[src + '.svg']);
  writeFileSync(join(pub, 'favicon.svg'), files['leaf-a-icon-color.svg']);
  console.log('wrote website logo files to', pub);
}

// ---- comparison sheet ----
const cells = [['color', '#ffffff'], ['ivory', '#12281c'], ['mono-dark', '#f3efe6'], ['mono-white', '#1f4d33']];
const row = (kind, title, note) =>
  `<section><h2>${title}</h2><p>${note}</p><div class="grid">${cells.map(([s, bg]) => `<div style="background:${bg}"><img src="svg/leaf-a-${kind}-${s}.svg" alt="${title}, ${s}"><span>${s}</span></div>`).join('')}</div></section>`;
writeFileSync(join(here, 'sheet-leaf-a.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Leaf A variations</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400..700&family=Montserrat:wght@400..700&display=swap" rel="stylesheet">
<style>body{margin:0;padding:44px;background:#eef0ea;font-family:Montserrat,Arial,sans-serif;color:#151c1a}h1{font:600 32px Bitter,Georgia,serif;margin:0 0 4px}.sub{margin:0 0 30px;color:#4d5752}
section{margin-bottom:30px}h2{font:600 20px Bitter,Georgia,serif;margin:0 0 2px}section>p{margin:0 0 10px;color:#4d5752;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.grid div{border-radius:18px;display:grid;place-items:center;padding:22px 14px 30px;position:relative;min-height:240px}.grid img{max-width:100%;max-height:230px;width:auto;height:auto}
.grid span{position:absolute;bottom:9px;left:14px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.55;color:#888}.icons .grid{grid-template-columns:repeat(2,1fr);max-width:620px}.icons img{width:160px}
.sm{display:flex;gap:26px;align-items:center;margin-top:12px}.sm img{height:40px}.sm .fav{height:32px;width:32px}</style></head>
<body><h1>Genetic Artistry: Leaf A</h1><p class="sub">Company title only. Four layouts, each in colour, ivory (for dark backgrounds) and two single-colour versions. Transparent backgrounds.</p>
${row('mark', 'Mark only', 'For favicons, social avatars, stamps, embroidery and anywhere the name appears next to it.')}
${row('below', 'Title below', 'The primary stacked logo.')}
${row('above', 'Title above', 'Alternate stacked logo.')}
${row('horizontal', 'Horizontal', 'For the website header, email, invoices and letterhead.')}
<section class="icons"><h2>App icon / favicon</h2><p>Rounded square, in a dark and a light version.</p><div class="grid">
<div style="background:#eef0ea"><img src="svg/leaf-a-icon-color.svg" alt="Icon, dark"><span>dark</span></div><div style="background:#12281c"><img src="svg/leaf-a-icon-light.svg" alt="Icon, light"><span>light</span></div></div></section>
</body></html>`);
console.log('built', Object.keys(files).length, 'Leaf A files');
