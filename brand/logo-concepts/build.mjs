// Generates the Genetic Artistry logo concepts from the site's minimal vector cannabis leaf.
// Run: node build.mjs   ->  svg/<concept>-color.svg, svg/<concept>-reverse.svg and sheet.html
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'svg'), { recursive: true });

// ---- the leaf: 7 palmate leaflets radiating from the origin (same drawing as the website's LeafArt) ----
const LEAFLETS = [
  { len: 300, w: 44, rot: 0 },
  { len: 262, w: 40, rot: -28 }, { len: 262, w: 40, rot: 28 },
  { len: 210, w: 34, rot: -56 }, { len: 210, w: 34, rot: 56 },
  { len: 150, w: 28, rot: -82 }, { len: 150, w: 28, rot: 82 },
];
const petal = (len, w) => `M0 0C${-w} ${-len * 0.3} ${-w} ${-len * 0.7} 0 ${-len}C${w} ${-len * 0.7} ${w} ${-len * 0.3} 0 0Z`;
const f = (n) => +n.toFixed(2);

/** the whole leaf as <g> content. fill/stroke are CSS colours; `seam` separates overlapping filled leaflets. */
const leaf = ({ fill = 'none', stroke = 'none', sw = 0, seam = 'none', seamW = 5, rib = '', only } = {}) =>
  LEAFLETS.filter((_, i) => !only || only.includes(i))
    .map(({ len, w, rot }) =>
      `<g transform="rotate(${rot})"><path d="${petal(len, w)}" fill="${fill}" stroke="${fill !== 'none' && seam !== 'none' ? seam : stroke}" stroke-width="${fill !== 'none' && seam !== 'none' ? seamW : sw}" stroke-linejoin="round"/>${rib ? `<path d="M0 -6V${-len * 0.8}" stroke="${rib}" stroke-width="2.2" stroke-linecap="round" fill="none"/>` : ''}</g>`)
    .join('');
const stem = (c, sw = 14, len = 96) => `<path d="M0 0V${len}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;

const SERIF = "Bitter, Georgia, 'Times New Roman', serif";
const SANS = "Montserrat, 'Segoe UI', Arial, sans-serif";
const text = (x, y, s, { size = 30, ls = 0.28, fam = SERIF, weight = 500, fill, anchor = 'middle' }) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fam}" font-size="${size}" font-weight="${weight}" letter-spacing="${f(size * ls)}" fill="${fill}">${s}</text>`;

const themes = {
  color: { bg: '#ffffff', fg: '#1f4d33', fg2: '#2f6b40', accent: '#c9b27a', ink: '#151c1a', soft: '#eef2ea' },
  reverse: { bg: '#12281c', fg: '#eef5ea', fg2: '#8fcf9a', accent: '#d6c28a', ink: '#eef5ea', soft: '#1d3a2a' },
};

const wrap = (t, w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Genetic Artistry logo"><rect width="${w}" height="${h}" fill="${t.bg}"/>${body}</svg>\n`;

// ---------------------------------------------------------------------------------------------------
const concepts = [
  {
    id: '01-solid-leaf',
    name: 'Solid Leaf',
    note: 'The leaf as a confident solid mark, leaflets separated by hairline seams. Stacked wordmark. The simplest, most flexible option.',
    draw: (t) => {
      const g = `<g transform="translate(240 250) scale(.58)">${leaf({ fill: t.fg, seam: t.bg, seamW: 6 })}${stem(t.fg, 15)}</g>`;
      return wrap(t, 480, 520, g + text(240, 396, 'GENETIC ARTISTRY', { size: 31, ls: 0.26, fill: t.ink }) + text(240, 436, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 }));
    },
  },
  {
    id: '02-line-badge',
    name: 'Line Badge',
    note: 'Fine outline leaf inside a ringed seal with the name set around it. Works as a stamp, sticker or packaging seal.',
    draw: (t) => {
      const g =
        `<circle cx="240" cy="240" r="214" fill="none" stroke="${t.fg}" stroke-width="3"/><circle cx="240" cy="240" r="200" fill="none" stroke="${t.fg}" stroke-width="1"/>` +
        `<defs><path id="arc-top-${t.bg.slice(1)}" d="M72 240A168 168 0 0 1 408 240"/><path id="arc-bot-${t.bg.slice(1)}" d="M62 240A178 178 0 0 0 418 240"/></defs>` +
        `<text font-family="${SERIF}" font-size="30" font-weight="500" letter-spacing="8" fill="${t.ink}" text-anchor="middle"><textPath href="#arc-top-${t.bg.slice(1)}" startOffset="50%">GENETIC ARTISTRY</textPath></text>` +
        `<text font-family="${SANS}" font-size="13.5" font-weight="600" letter-spacing="5" fill="${t.fg2}" text-anchor="middle"><textPath href="#arc-bot-${t.bg.slice(1)}" startOffset="50%">SMALL-BATCH GENETICS</textPath></text>` +
        `<g transform="translate(240 296) scale(.58)">${leaf({ stroke: t.fg, sw: 3.2 })}${stem(t.fg, 3.2, 80)}</g>` +
        `<circle cx="72" cy="240" r="4" fill="${t.accent}"/><circle cx="408" cy="240" r="4" fill="${t.accent}"/>`;
      return wrap(t, 480, 480, g);
    },
  },
  {
    id: '03-leaf-a',
    name: 'Leaf A',
    note: 'Two leaflets become the legs of an A, a crossbar in tan finishes the letter. Initial and leaf in one mark.',
    draw: (t) => {
      const legs = [158, 202]
        .map((r) => `<g transform="translate(240 96) rotate(${r})"><path d="${petal(310, 40)}" fill="${t.fg}" stroke="${t.bg}" stroke-width="5" stroke-linejoin="round"/></g>`)
        .join('');
      const g = legs + `<rect x="184" y="262" width="112" height="14" rx="7" fill="${t.accent}"/>` + `<circle cx="240" cy="80" r="9" fill="${t.fg2}"/>`;
      return wrap(t, 480, 520, g + text(240, 460, 'GENETIC ARTISTRY', { size: 31, ls: 0.26, fill: t.ink }) + text(240, 494, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 }));
    },
  },
  {
    id: '04-brush-leaf',
    name: 'Brush Leaf',
    note: 'The whole leaf becomes the bristles of a paintbrush, with a ferrule and handle where the stem would be. Genetics as art in one drawing.',
    draw: (t) => {
      const bristles = `<g transform="translate(240 268) scale(.56)">${leaf({ fill: t.fg, seam: t.bg, seamW: 6 })}</g>`;
      const ferrule = `<rect x="221" y="262" width="38" height="44" rx="7" fill="${t.accent}"/><rect x="221" y="276" width="38" height="4" fill="${t.bg}" opacity=".55"/><rect x="221" y="288" width="38" height="4" fill="${t.bg}" opacity=".55"/>`;
      const handle = `<path d="M227 306H253L247 436Q240 448 233 436Z" fill="${t.fg2}"/>`;
      return wrap(t, 480, 560, bristles + ferrule + handle + text(240, 514, 'GENETIC ARTISTRY', { size: 29, ls: 0.26, fill: t.ink }));
    },
  },
  {
    id: '05-split-leaf',
    name: 'Split Leaf',
    note: 'Half solid, half outline: two parents, one new line. A genetics idea told in a single drawing.',
    draw: (t) => {
      const id = 'cp' + t.bg.slice(1);
      const g =
        `<defs><clipPath id="${id}-l"><rect x="-300" y="-340" width="300" height="460"/></clipPath><clipPath id="${id}-r"><rect x="0" y="-340" width="300" height="460"/></clipPath></defs>` +
        `<g transform="translate(240 262) scale(.58)">` +
        `<g clip-path="url(#${id}-l)">${leaf({ fill: t.fg, seam: t.bg, seamW: 6 })}</g>` +
        `<g clip-path="url(#${id}-r)">${leaf({ stroke: t.fg, sw: 4 })}</g>` +
        `<path d="M0 -320V96" stroke="${t.accent}" stroke-width="5" stroke-linecap="round"/>` +
        `</g>`;
      return wrap(t, 480, 520, g + text(240, 410, 'GENETIC ARTISTRY', { size: 31, ls: 0.26, fill: t.ink }) + text(240, 448, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 }));
    },
  },
  {
    id: '06-arch-gallery',
    name: 'Arch Gallery',
    note: 'The leaf hung in a gallery arch, like a piece on a wall. Calm and premium; ideal for packaging and signage.',
    draw: (t) => {
      const g =
        `<path d="M128 400V216A112 112 0 0 1 352 216V400Z" fill="${t.soft}" stroke="${t.fg}" stroke-width="3"/>` +
        `<path d="M144 400V218A96 96 0 0 1 336 218V400Z" fill="none" stroke="${t.accent}" stroke-width="1.6"/>` +
        `<g transform="translate(240 336) scale(.46)">${leaf({ stroke: t.fg, sw: 4 })}${stem(t.fg, 4, 70)}</g>`;
      return wrap(t, 480, 520, g + text(240, 452, 'GENETIC ARTISTRY', { size: 29, ls: 0.26, fill: t.ink }) + text(240, 486, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 }));
    },
  },
  {
    id: '07-dot-leaf',
    name: 'Dot Leaf',
    note: 'The leaf drawn as a constellation of dots, like markers on a genetic map. Light, modern and very easy to animate.',
    draw: (t) => {
      const dots = LEAFLETS.map(({ len, rot }) => {
        const n = Math.round(len / 36);
        return Array.from({ length: n }, (_, k) => {
          const u = (k + 1) / n;
          const r = 9.5 - u * 5.5;
          return `<circle cx="0" cy="${f(-len * 0.96 * u)}" r="${f(r)}" fill="${u > 0.9 ? t.accent : t.fg}" transform="rotate(${rot})"/>`;
        }).join('');
      }).join('');
      const g = `<g transform="translate(240 262) scale(.6)">${dots}<circle r="15" fill="${t.fg2}"/>${stem(t.fg, 9, 90)}</g>`;
      return wrap(t, 480, 520, g + text(240, 400, 'GENETIC ARTISTRY', { size: 31, ls: 0.26, fill: t.ink }) + text(240, 438, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 }));
    },
  },
  {
    id: '08-icon-lockup',
    name: 'Icon + Lockup',
    note: 'A rounded-square app/avatar icon with a cream leaf, plus a horizontal lockup for headers, invoices and email.',
    draw: (t) => {
      const sq = t.bg === '#ffffff' ? t.fg : t.accent;
      const lf = t.bg === '#ffffff' ? '#f6f3ea' : '#12281c';
      const g =
        `<rect x="40" y="40" width="200" height="200" rx="48" fill="${sq}"/>` +
        `<g transform="translate(140 164) scale(.33)">${leaf({ fill: lf, seam: sq, seamW: 7 })}${stem(lf, 18, 96)}</g>` +
        text(276, 150, 'Genetic', { size: 66, ls: -0.01, weight: 600, fill: t.ink, anchor: 'start' }) +
        text(280, 200, 'ARTISTRY', { size: 25, ls: 0.5, fam: SANS, weight: 600, fill: t.fg2, anchor: 'start' });
      return wrap(t, 700, 280, g);
    },
  },
];

for (const c of concepts) for (const [k, t] of Object.entries(themes)) writeFileSync(join(here, 'svg', `${c.id}-${k}.svg`), c.draw(t));

// ---- comparison sheet ----
const card = (c) => `<section class="row"><div class="img light"><img src="svg/${c.id}-color.svg" alt="${c.name}, full colour"></div><div class="img dark"><img src="svg/${c.id}-reverse.svg" alt="${c.name}, reversed"></div><div class="txt"><p class="n">${c.id.slice(0, 2)}</p><h2>${c.name}</h2><p>${c.note}</p></div></section>`;
writeFileSync(
  join(here, 'sheet.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Genetic Artistry logo concepts</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400..700&family=Montserrat:wght@400..700&display=swap" rel="stylesheet">
<style>body{margin:0;padding:48px;background:#eef0ea;font-family:Montserrat,Arial,sans-serif;color:#151c1a}h1{font:600 34px Bitter,Georgia,serif;margin:0 0 6px}.sub{margin:0 0 36px;color:#4d5752}
.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr)) 280px;gap:20px;align-items:center;margin-bottom:22px}.img{border-radius:20px;overflow:hidden;display:grid;place-items:center;padding:6px}.light{background:#fff}.dark{background:#12281c}.img img{width:100%;height:auto;max-height:430px;object-fit:contain}
.txt h2{font:600 24px Bitter,Georgia,serif;margin:2px 0 8px}.txt p{margin:0;line-height:1.55;color:#3b4540;font-size:14.5px}.n{font-weight:700;letter-spacing:.2em;color:#2f6b40;font-size:12px!important;margin-bottom:6px!important}</style></head>
<body><h1>Genetic Artistry: logo concepts</h1><p class="sub">Eight directions built from the site's minimal vector cannabis leaf. Each is shown in full colour and reversed on dark green. Wordmarks are live text (Bitter and Montserrat) and need outlining for print.</p>
${concepts.map(card).join('\n')}</body></html>`,
);
console.log('built', concepts.length, 'concepts');
