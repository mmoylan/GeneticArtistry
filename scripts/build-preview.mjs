// Runs after `astro build`. Prepares what the live editor preview (public/admin/preview.js) needs:
//   dist/admin/preview.css        the site's own built CSS, plus a few preview-only tweaks
//   dist/admin/preview-data.json  header/footer markup, the style-scope ids of each block, and site content
// The preview then draws blocks with the same markup and CSS as the real site.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as L from 'lucide';

const dist = 'dist';
const read = (p) => readFileSync(p, 'utf8');
const html = read(join(dist, 'index.html'));
const gallery = read(join(dist, 'components', 'index.html'));
const post = (() => {
  const dir = join(dist, 'insights');
  const d = readdirSync(dir, { withFileTypes: true }).find((e) => e.isDirectory() && e.name !== 'category');
  return d ? read(join(dir, d.name, 'index.html')) : '';
})();
const pages = html + gallery + post;

// ---- 1. Astro scopes component CSS with data-astro-cid-XXXX. Find the id of each component from a distinctive element. ----
const markers = {
  hero: '<section class="hero"', about: 'class="bento"', process: 'class="rail', collection: '<section class="pad catalogue"',
  values: 'class="card value"', stats: '<section class="pad stats"', insights: '<section class="pad insights"',
  connect: '<div class="panel"', text: '<section class="pad textblock', statement: '<section class="pad statement"',
  image: '<section class="pad band"', cta: '<div class="band"', postcard: '<a class="card post"', author: '<div class="card author"',
  social: '<ul class="links"', header: '<header class="site-header"', footer: '<footer class="site-footer"',
  backdrop: '<div class="backdrop"', article: '<article class="backing top pad"',
};
const cid = {};
for (const [name, marker] of Object.entries(markers)) {
  const at = pages.indexOf(marker);
  if (at < 0) throw new Error(`preview: could not find "${marker}" in the built pages (block "${name}")`);
  const tag = pages.slice(at, pages.indexOf('>', at));
  const m = tag.match(/data-astro-cid-(\w+)/);
  if (!m) throw new Error(`preview: no style id on "${marker}"`);
  cid[name] = m[1];
}

// ---- 2. Header, footer, backdrop and social links exactly as the site renders them. ----
const grab = (re, what) => { const m = html.match(re); if (!m) throw new Error(`preview: cannot find ${what} in dist/index.html`); return m[0]; };
const chrome = {
  header: grab(/<header class="site-header"[\s\S]*?<\/header>/, 'header'),
  footer: grab(/<footer class="site-footer"[\s\S]*?<\/footer>/, 'footer'),
  backdrop: grab(/<div class="backdrop"[\s\S]*?<\/ga-parallax><\/div>/, 'backdrop'),
  social: (html.match(/<ul class="links"[\s\S]*?<\/ul>/) || [''])[0],
};

// ---- 3. CSS: everything the site ships, plus preview-only adjustments. ----
const cssDir = join(dist, '_astro');
// Astro inlines small stylesheets into <style> tags, so collect those from every built page too.
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? (e.name === 'admin' ? [] : walk(join(dir, e.name))) : e.name.endsWith('.html') ? [join(dir, e.name)] : []);
const sheets = new Set(readdirSync(cssDir).filter((f) => f.endsWith('.css')).map((f) => read(join(cssDir, f))));
for (const f of walk(dist)) for (const m of read(f).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) sheets.add(m[1]);
const css = [...sheets].join('\n');
const extra = `
/* ---- preview-only ---- */
html { scroll-behavior: auto; }
body { background: var(--bg); }
.ga-preview { position: relative; overflow-x: clip; }
.ga-preview header.site-header { position: absolute; }
.ga-preview .backdrop { position: absolute; }
.ga-preview .hero .panel { min-height: 32rem; }
/* The menu button needs the site's script; in the preview the menu simply stays closed on narrow panes. */
@media (max-width: 860px) { .ga-preview header.site-header nav { display: none; } }
.ga-preview ga-section[data-backing='on'] { backdrop-filter: none; }
`;
mkdirSync(join(dist, 'admin'), { recursive: true });
writeFileSync(join(dist, 'admin', 'preview.css'), css + extra);

// ---- 4. Content the blocks draw on (lines, posts, people, categories, icons). ----
const json = (p) => JSON.parse(read(p));
const byId = (dir) => Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => [f.replace(/\.json$/, ''), json(join(dir, f))]));

const posts = readdirSync('src/content/blog').filter((f) => f.endsWith('.md')).map((f) => {
  const src = read(join('src/content/blog', f));
  const fm = (src.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [, ''])[1];
  const out = { id: f.replace(/\.md$/, ''), tags: [] };
  let key = '';
  for (const line of fm.split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    const li = line.match(/^\s+-\s*(.*)$/);
    if (kv) { key = kv[1]; if (kv[2] !== '') out[key] = kv[2].replace(/^["']|["']$/g, ''); }
    else if (li && key === 'tags') out.tags.push(li[1].replace(/^["']|["']$/g, ''));
  }
  return out;
}).filter((p) => p.draft !== 'true').sort((a, b) => String(b.date).localeCompare(String(a.date)));

// Same names as src/components/BlockIcon.astro.
const iconMap = {
  leaf: 'Leaf', sprout: 'Sprout', flask: 'FlaskConical', dna: 'Dna', eye: 'Eye', 'hand-heart': 'HandHeart', heart: 'Heart',
  'shield-check': 'ShieldCheck', sparkles: 'Sparkles', scale: 'Scale', compass: 'Compass', brush: 'Brush', microscope: 'Microscope',
  sun: 'Sun', droplets: 'Droplets', 'book-open': 'BookOpen', handshake: 'Handshake', scissors: 'Scissors', award: 'Award', gem: 'Gem',
  feather: 'Feather', palette: 'Palette', lightbulb: 'Lightbulb', users: 'Users', target: 'Target', hourglass: 'Hourglass',
  search: 'Search', 'clipboard-list': 'ClipboardList', camera: 'Camera', fingerprint: 'Fingerprint', package: 'Package',
  'message-circle': 'MessageCircle', mail: 'Mail', star: 'Star',
};
const icons = {};
for (const [name, exp] of Object.entries(iconMap)) {
  const node = L[exp];
  if (!node) throw new Error(`preview: lucide has no icon "${exp}"`);
  icons[name] = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
}

const data = {
  cid, chrome, icons, posts,
  site: json('src/data/site.json'),
  lines: json('src/data/lines.json').lines,
  categories: byId('src/content/categories'),
  people: byId('src/content/people'),
};
writeFileSync(join(dist, 'admin', 'preview-data.json'), JSON.stringify(data));
console.log(`preview: wrote dist/admin/preview.css (${Math.round((css.length + extra.length) / 1024)} kB) and preview-data.json`);
