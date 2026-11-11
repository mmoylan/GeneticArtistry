// "Vitruvian Leaf" concepts: the minimal cannabis leaf drawn as the figure in Da Vinci's proportion study.
// The leaf's hub is the navel; the circle is centred on it and touches the top leaflet; the square runs from
// the top tip to the stem's foot, so circle and square overlap exactly as they do around the Vitruvian Man.
// Ghost outlines show the second pose (arms raised, legs apart).
// Run: node build-vitruvian.mjs  ->  svg/v*-color.svg, svg/v*-reverse.svg and sheet-vitruvian.html
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

// pose 2: the side leaflets lift like raised arms; the stem opens like legs apart
const RAISED = { 56: 36, '-56': -36, 82: 52, '-82': -52 };

const leaf = ({ fill = 'none', stroke = 'none', sw = 0, seam = 'none', seamW = 5, ghost = false } = {}) =>
  LEAFLETS.map(({ len, w, rot }) => {
    const r = ghost ? (RAISED[rot] ?? rot) : rot;
    if (ghost && RAISED[rot] === undefined) return '';
    const solid = fill !== 'none';
    return `<g transform="rotate(${r})"><path d="${petal(len, w)}" fill="${fill}" stroke="${solid && seam !== 'none' ? seam : stroke}" stroke-width="${solid && seam !== 'none' ? seamW : sw}" stroke-linejoin="round"${ghost ? ' vector-effect="non-scaling-stroke"' : ''}/></g>`;
  }).join('');

const SERIF = "Bitter, Georgia, 'Times New Roman', serif";
const SANS = "Montserrat, 'Segoe UI', Arial, sans-serif";
const text = (x, y, s, { size = 30, ls = 0.28, fam = SERIF, weight = 500, fill, anchor = 'middle', italic = false }) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${fam}" font-size="${size}" font-weight="${weight}"${italic ? ' font-style="italic"' : ''} letter-spacing="${f(size * ls)}" fill="${fill}">${s}</text>`;

const themes = {
  color: { bg: '#ffffff', fg: '#1f4d33', fg2: '#2f6b40', accent: '#c9b27a', ink: '#151c1a', line: '#8a7a4c' },
  reverse: { bg: '#12281c', fg: '#eef5ea', fg2: '#8fcf9a', accent: '#d6c28a', ink: '#eef5ea', line: '#d6c28a' },
};
const wrap = (t, w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Genetic Artistry logo"><rect width="${w}" height="${h}" fill="${t.bg}"/>${body}</svg>\n`;

// px-width line helpers (vector-effect keeps the weight fixed when the group is scaled)
const ln = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}" vector-effect="non-scaling-stroke" stroke-linecap="round"/>`;
const circ = (r, c, w, o = 1, cx = 0, cy = 0) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}" vector-effect="non-scaling-stroke"/>`;
const sq = (c, w, o = 1) => `<rect x="-226" y="-300" width="452" height="452" fill="none" stroke="${c}" stroke-width="${w}" opacity="${o}" vector-effect="non-scaling-stroke"/>`;
const tips = (c, r = 6) => LEAFLETS.map(({ len, rot }) => {
  const a = (rot * Math.PI) / 180;
  return `<circle cx="${f(len * Math.sin(a))}" cy="${f(-len * Math.cos(a))}" r="${r}" fill="${c}"/>`;
}).join('');
const legs = (c, w, o) => ln('M0 0L-36 150M0 0L36 150', c, w, o);
const stemSolid = (c, w) => `<path d="M0 0V150" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;

const markCaption = (t, y) =>
  text(240, y, 'GENETIC ARTISTRY', { size: 31, ls: 0.26, fill: t.ink }) + text(240, y + 36, 'SMALL-BATCH GENETICS', { size: 12.5, ls: 0.34, fam: SANS, weight: 600, fill: t.fg2 });

const concepts = [
  {
    id: 'v1-vitruvian-leaf',
    name: 'Vitruvian Leaf',
    note: 'The solid leaf stands in the circle and square like the Vitruvian Man: tips on the circle, foot on the square. Ghost outlines show the second pose, arms raised and legs apart.',
    draw: (t) => {
      const g =
        `<g transform="translate(240 268) scale(.5)">` +
        circ(300, t.line, 1.6, 0.9) + sq(t.line, 1.6, 0.9) +
        ln('M-226 0H226M0 -300V152', t.line, 1, 0.7) +
        circ(150, t.line, 1, 0.45) + circ(262, t.line, 1, 0.35) +
        leaf({ stroke: t.fg2, sw: 1.4, ghost: true }).replace(/opacity="1"/g, '') +
        legs(t.fg2, 1.4, 0.8) +
        leaf({ fill: t.fg, seam: t.bg, seamW: 6 }) + stemSolid(t.fg, 14) +
        `<circle r="9" fill="${t.accent}" stroke="${t.bg}" stroke-width="3"/>` +
        `</g>`;
      return wrap(t, 480, 560, g + markCaption(t, 484));
    },
  },
  {
    id: 'v2-vitruvian-plate',
    name: 'Vitruvian Plate',
    note: 'The same idea as a technical plate: outline leaf, degree ticks round the circle, dimension marks and a plate number. Scholarly and premium for packaging and prints.',
    draw: (t) => {
      const ticks = Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const r1 = 300, r2 = i % 2 === 0 ? 322 : 311;
        return `M${f(r1 * Math.sin(a))} ${f(-r1 * Math.cos(a))}L${f(r2 * Math.sin(a))} ${f(-r2 * Math.cos(a))}`;
      }).join('');
      const g =
        `<g transform="translate(240 262) scale(.48)">` +
        circ(300, t.fg, 1.8) + sq(t.fg, 1.4, 0.85) + ln(ticks, t.fg, 1.2, 0.9) +
        ln('M-226 0H226M0 -300V152', t.line, 1, 0.8) +
        ln('M-226 -300L226 152M226 -300L-226 152', t.line, 0.8, 0.35) +
        leaf({ stroke: t.fg2, sw: 1.2, ghost: true }) + legs(t.fg2, 1.2, 0.7) +
        leaf({ stroke: t.fg, sw: 3.2 }).replace(/<g transform="rotate\(([-\d.]+)\)"><path ([^>]*?)\/>/g, '<g transform="rotate($1)"><path $2 vector-effect="non-scaling-stroke"/>') +
        stemSolid(t.fg, 3) + tips(t.accent, 7) +
        `<circle r="9" fill="${t.accent}"/>` +
        `</g>`;
      return wrap(t, 480, 560, g + text(60, 62, 'PLATE I', { size: 11, ls: 0.4, fam: SANS, weight: 700, fill: t.fg2, anchor: 'start' }) + text(420, 62, 'N° 7', { size: 11, ls: 0.4, fam: SANS, weight: 700, fill: t.fg2, anchor: 'end' }) + markCaption(t, 484));
    },
  },
  {
    id: 'v3-vitruvian-seal',
    name: 'Vitruvian Seal',
    note: 'A compact disc version for avatars, stamps and favicons: cream leaf, fine circle and square, one tan hub.',
    draw: (t) => {
      const disc = t.bg === '#ffffff' ? t.fg : t.accent;
      const lf = t.bg === '#ffffff' ? '#f6f3ea' : '#12281c';
      const gl = t.bg === '#ffffff' ? '#cfe0c8' : '#12281c';
      const g =
        `<circle cx="240" cy="236" r="206" fill="${disc}"/>` +
        `<g transform="translate(240 244) scale(.4)">` +
        circ(300, gl, 1.4, 0.9) + sq(gl, 1.4, 0.9) + ln('M-226 0H226M0 -300V152', gl, 1, 0.6) +
        leaf({ fill: lf, seam: disc, seamW: 7 }) + stemSolid(lf, 18) +
        `<circle r="11" fill="${t.bg === '#ffffff' ? t.accent : t.bg}"/>` +
        `</g>`;
      return wrap(t, 480, 560, g + markCaption(t, 484));
    },
  },
  {
    id: 'v4-vitruvian-lockup',
    name: 'Vitruvian Lockup',
    note: 'Horizontal lockup for headers, invoices and email: the geometric mark beside a two-line wordmark.',
    draw: (t) => {
      const g =
        `<g transform="translate(140 140) scale(.37)">` +
        circ(300, t.line, 1.6, 0.9) + sq(t.line, 1.6, 0.9) + ln('M-226 0H226M0 -300V152', t.line, 1, 0.6) +
        leaf({ fill: t.fg, seam: t.bg, seamW: 7 }) + stemSolid(t.fg, 16) +
        `<circle r="10" fill="${t.accent}" stroke="${t.bg}" stroke-width="3"/>` +
        `</g>` +
        text(276, 138, 'Genetic', { size: 66, ls: -0.01, weight: 600, fill: t.ink, anchor: 'start' }) +
        text(280, 188, 'ARTISTRY', { size: 25, ls: 0.5, fam: SANS, weight: 600, fill: t.fg2, anchor: 'start' });
      return wrap(t, 700, 280, g);
    },
  },
];

for (const c of concepts) for (const [k, t] of Object.entries(themes)) writeFileSync(join(here, 'svg', `${c.id}-${k}.svg`), c.draw(t));

const card = (c) => `<section class="row"><div class="img light"><img src="svg/${c.id}-color.svg" alt="${c.name}, full colour"></div><div class="img dark"><img src="svg/${c.id}-reverse.svg" alt="${c.name}, reversed"></div><div class="txt"><p class="n">${c.id.slice(0, 2).toUpperCase()}</p><h2>${c.name}</h2><p>${c.note}</p></div></section>`;
writeFileSync(
  join(here, 'sheet-vitruvian.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Genetic Artistry: Vitruvian Leaf</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bitter:wght@400..700&family=Montserrat:wght@400..700&display=swap" rel="stylesheet">
<style>body{margin:0;padding:48px;background:#eef0ea;font-family:Montserrat,Arial,sans-serif;color:#151c1a}h1{font:600 34px Bitter,Georgia,serif;margin:0 0 6px}.sub{margin:0 0 36px;color:#4d5752;max-width:1100px}
.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr)) 280px;gap:20px;align-items:center;margin-bottom:22px}.img{border-radius:20px;overflow:hidden;display:grid;place-items:center;padding:6px}.light{background:#fff}.dark{background:#12281c}.img img{width:100%;height:auto;max-height:430px;object-fit:contain}
.txt h2{font:600 24px Bitter,Georgia,serif;margin:2px 0 8px}.txt p{margin:0;line-height:1.55;color:#3b4540;font-size:14.5px}.n{font-weight:700;letter-spacing:.2em;color:#2f6b40;font-size:12px!important;margin-bottom:6px!important}</style></head>
<body><h1>Genetic Artistry: Vitruvian Leaf</h1><p class="sub">The minimal cannabis leaf as the figure in Da Vinci's proportion study. The leaf's hub is the navel, the circle touches the top leaflet and the square runs from the top tip to the foot of the stem, overlapping as they do around the Vitruvian Man. Faint outlines show the second pose: arms raised, legs apart.</p>
${concepts.map(card).join('\n')}</body></html>`,
);
console.log('built', concepts.length, 'Vitruvian concepts');
