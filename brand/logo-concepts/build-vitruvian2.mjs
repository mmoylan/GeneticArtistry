// Vitruvian Leaf, v2: correct proportions.
// In the Vitruvian Man: square side = height H (head top to feet); the circle is centred on the navel, which sits
// ~0.6 H above the feet; its radius (~0.6 H) puts its bottom exactly on the square's bottom edge (the feet),
// so the circle is LARGER than the square: it rises above the head and pokes out past both sides.
//   A: the natural leaf (tip to stem foot = H), circle centred 0.6 H above the foot.
//   B: the hub is the navel, as in the figure, so the stem is lengthened to 1.5x the top leaflet (legs).
// Run: node build-vitruvian2.mjs  ->  svg/va-*, svg/vb-*, svg/vc-* and sheet-vitruvian2.html
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'svg'), { recursive: true });

const LEAFLETS = [
  { len: 300, w: 44, rot: 0 },
  { len: 262, w: 40, rot: -28 }, { len: 262, w: 40, rot: 28 },
  { len: 210, w: 34, rot: -56 }, { len: 210, w: 34, rot: 56 },
  { len: 150, w: 28, rot: -82 }, { len: 150, w: 28, rot: 82 },
];
const petal = (len, w) => `M0 0C${-w} ${-len * 0.3} ${-w} ${-len * 0.7} 0 ${-len}C${w} ${-len * 0.7} ${w} ${-len * 0.3} 0 0Z`;
const f = (n) => +n.toFixed(2);
let K = 1; // scale of the group being drawn; "px" stroke widths are divided by it (no vector-effect needed)
const RAISED = { 56: 36, '-56': -36, 82: 52, '-82': -52 };

const leaf = ({ fill = 'none', stroke = 'none', sw = 0, seam = 'none', seamW = 5, ghost = false, fixed = false } = {}) =>
  LEAFLETS.map(({ len, w, rot }) => {
    if (ghost && RAISED[rot] === undefined) return '';
    const r = ghost ? RAISED[rot] : rot;
    const solid = fill !== 'none';
    const useSeam = solid && seam !== 'none';
    return `<g transform="rotate(${r})"><path d="${petal(len, w)}" fill="${fill}" stroke="${useSeam ? seam : stroke}" stroke-width="${f(useSeam ? seamW : ghost || fixed ? sw / K : sw)}" stroke-linejoin="round"/></g>`;
  }).join('');

const SERIF = "Bitter, Georgia, 'Times New Roman', serif";
const SANS = "Montserrat, 'Segoe UI', Arial, sans-serif";
const text = (x, y, s, { size = 30, ls = 0.28, fam = SERIF, weight = 500, fill, anchor = 'middle' }) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fam}" font-size="${size}" font-weight="${weight}" letter-spacing="${f(size * ls)}" fill="${fill}">${s}</text>`;
const themes = {
  color: { bg: '#ffffff', fg: '#1f4d33', fg2: '#2f6b40', accent: '#c9b27a', ink: '#151c1a', line: '#8a7a4c' },
  reverse: { bg: '#12281c', fg: '#eef5ea', fg2: '#8fcf9a', accent: '#d6c28a', ink: '#eef5ea', line: '#d6c28a' },
};
const wrap = (t, w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Genetic Artistry logo"><rect width="${w}" height="${h}" fill="${t.bg}"/>${body}</svg>\n`;
const ln = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${f(w / K)}" opacity="${o}" stroke-linecap="round"/>`;
const circ = (cx, cy, r, c, w, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${f(w / K)}" opacity="${o}"/>`;
const rect = (x, y, w, h, c, sw, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="${f(sw / K)}" opacity="${o}"/>`;
const caption = (t, y) =>
  text(240, y, 'GENETIC ARTISTRY', { size: 31, ls: 0.26, fill: t.ink }) + text(240, y + 36, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 });

/** Geometry. Units: hub of the leaf at (0,0), y down. S = square side. */
const GEO = {
  // A: natural leaf, stem 96. H = 300 + 96 = 396. Circle centre 0.6H above the foot.
  A: { stem: 96, S: 396, top: -300, foot: 96, R: 238, cy: 96 - 238, scale: 0.62, ty: 320 },
  // B: hub = navel. stem 450, tip 300 above hub, H = 750. Circle centred on the hub.
  B: { stem: 450, S: 750, top: -300, foot: 450, R: 450, cy: 0, scale: 0.33, ty: 236 },
};

function figure(t, key, { fill = true, plate = false } = {}) {
  const g = GEO[key];
  K = g.scale;
  const half = g.S / 2;
  const sqCy = (g.top + g.foot) / 2;
  const ticks = plate
    ? ln(Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180, r1 = g.R, r2 = g.R + (i % 2 === 0 ? 20 : 11);
        return `M${f(r1 * Math.sin(a))} ${f(g.cy - r1 * Math.cos(a))}L${f(r2 * Math.sin(a))} ${f(g.cy - r2 * Math.cos(a))}`;
      }).join(''), t.fg, 1.2, 0.9)
    : '';
  const legX = key === 'A' ? 26 : 70;
  return (
    `<g transform="translate(240 ${g.ty}) scale(${g.scale})">` +
    circ(0, g.cy, g.R, plate ? t.fg : t.line, plate ? 1.8 : 1.6, 0.95) +
    rect(-half, g.top, g.S, g.S, plate ? t.fg : t.line, plate ? 1.4 : 1.6, plate ? 0.85 : 0.95) +
    ticks +
    ln(`M${-g.R} ${g.cy}H${g.R}M0 ${g.cy - g.R}V${g.foot}`, t.line, 1, 0.65) +
    leaf({ stroke: t.fg2, sw: 1.3, ghost: true }) +
    ln(`M0 0L${-legX} ${g.foot}M0 0L${legX} ${g.foot}`, t.fg2, 1.3, 0.75) +
    (fill ? leaf({ fill: t.fg, seam: t.bg, seamW: 6 }) + `<path d="M0 0V${g.foot}" stroke="${t.fg}" stroke-width="${key === 'A' ? 14 : 16}" stroke-linecap="round" fill="none"/>`
          : leaf({ stroke: t.fg, sw: 3, fixed: true }) + ln(`M0 0V${g.foot}`, t.fg, 3, 1)) +
    // navel (circle centre) and the square's centre, as marked on the original drawing
    `<circle cx="0" cy="${g.cy}" r="${key === 'A' ? 10 : 9}" fill="${t.accent}" stroke="${t.bg}" stroke-width="3"/>` +
    `<circle cx="0" cy="${sqCy}" r="${key === 'A' ? 7 : 6}" fill="none" stroke="${t.line}" stroke-width="${f(2 / K)}"/>` +
    `</g>`
  );
}

const concepts = [
  { id: 'va-true-proportions', name: 'A. Natural leaf, true proportions', note: 'Square = the leaf (tip to foot). The circle is bigger: centred 0.6 of the way up, its bottom resting on the square\'s bottom edge, rising above the tip and past both sides. Circle centre (navel) sits above the square\'s centre, exactly as in Da Vinci\'s drawing.', draw: (t) => wrap(t, 480, 560, figure(t, 'A') + caption(t, 484)) },
  { id: 'vb-long-stem', name: 'B. Hub is the navel', note: 'Truest to the figure: the leaf\'s hub is the navel and the circle centre. That needs a long stem (1.5 times the top leaflet) for the legs, so it reads as a tall, slender plant.', draw: (t) => wrap(t, 480, 560, figure(t, 'B') + caption(t, 484)) },
  { id: 'vc-plate-proportions', name: 'C. Plate, true proportions', note: 'Direction A drawn as an outline plate with degree ticks, for packaging and prints.', draw: (t) => wrap(t, 480, 560, figure(t, 'A', { fill: false, plate: true }) + caption(t, 484)) },
];
for (const c of concepts) for (const [k, t] of Object.entries(themes)) writeFileSync(join(here, 'svg', `${c.id}-${k}.svg`), c.draw(t));

const card = (c) => `<section class="row"><div class="img light"><img src="svg/${c.id}-color.svg" alt="${c.name}"></div><div class="img dark"><img src="svg/${c.id}-reverse.svg" alt="${c.name}, reversed"></div><div class="txt"><h2>${c.name}</h2><p>${c.note}</p></div></section>`;
writeFileSync(join(here, 'sheet-vitruvian2.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Vitruvian Leaf, true proportions</title>
<link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400..700&family=Montserrat:wght@400..700&display=swap" rel="stylesheet">
<style>body{margin:0;padding:48px;background:#eef0ea;font-family:Montserrat,Arial,sans-serif;color:#151c1a}h1{font:600 32px Bitter,Georgia,serif;margin:0 0 6px}.sub{margin:0 0 30px;color:#4d5752;max-width:1100px}
.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr)) 300px;gap:20px;align-items:center;margin-bottom:22px}.img{border-radius:20px;overflow:hidden;display:grid;place-items:center;padding:6px}.light{background:#fff}.dark{background:#12281c}.img img{width:100%;height:auto;max-height:430px;object-fit:contain}
.txt h2{font:600 22px Bitter,Georgia,serif;margin:2px 0 8px}.txt p{margin:0;line-height:1.55;color:#3b4540;font-size:14px}</style></head>
<body><h1>Vitruvian Leaf: true proportions</h1><p class="sub">Square side = height. Circle larger than the square, centred on the navel (about 0.6 of the height), its bottom resting on the square's bottom edge, rising above the head and past both sides.</p>
${concepts.map(card).join('\n')}</body></html>`);
console.log('built', concepts.length);
