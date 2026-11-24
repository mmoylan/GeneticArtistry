/*
 * Live preview for the CMS editor. Registers a preview template for pages, insights and people.
 *
 * Each block is drawn with the same markup as its Astro component in src/components, and styled by the
 * site's own built CSS (/admin/preview.css, made by scripts/build-preview.mjs after every build).
 * Motion is left off in the preview so what you see is the finished layout.
 *
 * KEEP IN SYNC: when you change a block's markup in src/components/*.astro, change its function here too.
 * To add a block: add a function to `blocks`, add its marker to scripts/build-preview.mjs.
 */
(function () {
  var CMS = window.CMS;
  if (!CMS || !window.createClass || !window.h) return;
  var h = window.h;

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300..700;1,300..600&family=Montserrat:wght@400..800&display=swap');
  CMS.registerPreviewStyle('/admin/preview.css');

  var dataPromise = fetch('/admin/preview-data.json').then(function (r) { return r.json(); }).catch(function () { return null; });
  var D = null; // site data, once loaded

  // ---------- helpers ----------
  var g = function (v, def) { return v == null ? def : v; };
  var esc = function (s) { return String(g(s, '')).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var em = function (s) { return esc(s).replace(/&lt;(\/?)em&gt;/g, '<$1em>'); }; // allow only <em> in headings
  var mdParse = function (s) {
    if (!s) return '';
    if (window.marked && window.marked.parse) return window.marked.parse(String(s));
    return String(s).split(/\n{2,}/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  };
  var fmtDate = function (d) {
    var dt = new Date(String(d).slice(0, 10) + 'T00:00:00Z');
    return isNaN(dt) ? '' : dt.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' });
  };
  var initials = function (name) { return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); };

  // Raw HTML (markdown output) must not receive style-scope attributes, so it is parked and put back after scoping.
  var holes = [];
  var hole = function (html) { holes.push(html); return '<!--hole' + (holes.length - 1) + '-->'; };
  var scope = function (html, id) {
    return html.replace(/<([a-z][a-z0-9-]*)(?=[\s>\/])/gi, function (m, tag) { return '<' + tag + ' data-astro-cid-' + id; });
  };
  var unhole = function (html) { return html.replace(/<!--hole(\d+)-->/g, function (m, i) { return holes[+i]; }); };

  // The decorative leaf (src/components/LeafArt.astro). pathLength=1 stands in for what <ga-draw> sets in the browser.
  var LEAFLETS = [[300, 44, 0], [262, 40, -28], [262, 40, 28], [210, 34, -56], [210, 34, 56], [150, 28, -82], [150, 28, 82]];
  var leaf = function (cls, stroke) {
    var inner = LEAFLETS.map(function (l) {
      var len = l[0], w = l[1];
      return '<g transform="rotate(' + l[2] + ')"><path pathLength="1" d="M0 0C' + -w + ' ' + -len * 0.3 + ' ' + -w + ' ' + -len * 0.7 + ' 0 ' + -len + 'C' + w + ' ' + -len * 0.7 + ' ' + w + ' ' + -len * 0.3 + ' 0 0Z"/><path pathLength="1" d="M0 0V' + -len * 0.88 + '" opacity=".55"/></g>';
    }).join('');
    return '<svg class="' + cls + '" viewBox="-230 -320 460 420" fill="none" stroke="currentColor" stroke-width="' + stroke + '" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" focusable="false">' + inner + '<path pathLength="1" d="M0 0V96"/></svg>';
  };
  var icon = function (name) {
    var inner = D.icons[name];
    return inner ? '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>' : '';
  };

  // data-key-path ties a piece of the preview to its editor field; Sveltia uses it to scroll the preview to the field you
  // focus, and to focus the field when you click here. Paths look like sections.3.title or sections.3.items.1.
  var K = function (ctx, sub) { return ' data-key-path="' + ctx.k + (sub ? '.' + sub : '') + '"'; };
  var eyebrow = function (t, k) { return t ? '<ga-reveal' + (k || '') + '><p class="eyebrow">' + esc(t) + '</p></ga-reveal>' : ''; };
  var title = function (tag, t, id, cls, k) { return t ? '<' + tag + ' id="' + id + '"' + (cls ? ' class="' + cls + '"' : '') + (k || '') + '><ga-split>' + em(t) + '</ga-split></' + tag + '>' : ''; };

  // ---------- one function per block, mirroring src/components/<Block>.astro ----------
  var blocks = {
    hero: function (d, ctx) {
      var strength = { subtle: 0.3, medium: 0.5, bold: 0.8 }[g(d.leaf_strength, 'subtle')] || 0.3;
      var lf = g(d.leaf, 'draw'), t = g(d.title, 'Maximize ROI. <em>Minimize</em> waste.');
      var ey = g(d.eyebrow, 'Cannabis consulting, education & genetics');
      var lede = g(d.lede, 'Hands-on consulting, practical education and lean efficiency training for cannabis operators.');
      var pl = g(d.primary_label, 'Explore our services'), sl = g(d.secondary_label, 'Book a discovery call');
      return '<section class="hero"' + ctx.id + '><div class="panel bleed"><div class="art" aria-hidden="true"' + K(ctx, 'leaf') + ' style="--leaf-op:' + strength + '"><div class="glow a"></div><div class="glow b"></div><div class="grid"></div>' +
        (lf !== 'none' ? '<ga-parallax speed="-0.1">' + (lf === 'draw' ? '<ga-draw>' : '') + leaf('leaf', 1.1) + (lf === 'draw' ? '</ga-draw>' : '') + '</ga-parallax>' : '') +
        '</div><div class="content">' +
        eyebrow(ey, K(ctx, 'eyebrow')) +
        '<h1' + K(ctx, 'title') + '><ga-split>' + em(t) + '</ga-split></h1>' +
        (lede ? '<ga-reveal' + K(ctx, 'lede') + '><p class="lede">' + esc(lede) + '</p></ga-reveal>' : '') +
        ((pl || sl) ? '<ga-reveal class="cta">' + (pl ? '<a class="b solid" href="#"' + K(ctx, 'primary_label') + '>' + esc(pl) + '</a>' : '') + (sl ? '<a class="b" href="#"' + K(ctx, 'secondary_label') + '>' + esc(sl) + '</a>' : '') + '</ga-reveal>' : '') +
        '</div></div></section>';
    },

    about: function (d, ctx) {
      var facts = g(d.facts, []), quote = g(d.quote, '');
      var plateLabel = g(d.plate_label, 'Plate I — The leaf'), plateCaption = g(d.plate_caption, 'Each line is judged leaf by leaf: structure first, then aroma, then vigour.');
      var hasPlate = !!(plateLabel || plateCaption), solo = hasPlate && !facts.length && !quote, lf = g(d.leaf, 'draw');
      var body = d.body ? hole('<div class="muted prose"' + K(ctx, 'body') + '>' + mdParse(d.body) + '</div>') : '';
      var bento = '';
      if (hasPlate || facts.length || quote) {
        bento = '<div class="bento">' +
          (hasPlate ? '<ga-reveal class="plate card' + (solo ? ' solo' : '') + '"' + K(ctx, 'plate_label') + '>' + (plateLabel ? '<p class="label muted">' + esc(plateLabel) + '</p>' : '') + (plateCaption ? '<p class="display caption"' + K(ctx, 'plate_caption') + '>' + esc(plateCaption) + '</p>' : '') +
            (lf === 'draw' ? '<ga-draw aria-hidden="true" class="bgleaf">' + leaf('art-leaf', 1.2) + '</ga-draw>' : lf === 'static' ? '<div aria-hidden="true" class="bgleaf">' + leaf('art-leaf', 1.2) + '</div>' : '') + '</ga-reveal>' : '') +
          (facts.length ? '<ga-reveal class="card anatomy"' + K(ctx, 'facts') + '>' + (g(d.facts_label, 'Anatomy') ? '<p class="label muted">' + esc(g(d.facts_label, 'Anatomy')) + '</p>' : '') + '<dl>' + facts.map(function (f, j) { return '<div' + K(ctx, 'facts.' + j) + '><dt class="label"' + K(ctx, 'facts.' + j + '.label') + '>' + esc(f.label) + '</dt><dd' + K(ctx, 'facts.' + j + '.value') + '>' + esc(f.value) + '</dd></div>'; }).join('') + '</dl></ga-reveal>' : '') +
          (quote ? '<ga-reveal class="card manifesto"' + K(ctx, 'quote') + '>' + (g(d.quote_label, 'Philosophy') ? '<p class="label muted">' + esc(g(d.quote_label, 'Philosophy')) + '</p>' : '') + '<p class="display quote">' + esc(quote) + '</p></ga-reveal>' : '') + '</div>';
      }
      return '<section class="pad"' + ctx.id + '><div class="wrap"><div class="intro">' + eyebrow(g(d.eyebrow, 'About'), K(ctx, 'eyebrow')) + title('h2', g(d.heading, 'One breeder. Every plant a canvas.'), ctx.uid + '-title', '', K(ctx, 'heading')) + body + '</div>' + bento + '</div></section>';
    },

    process: function (d, ctx) {
      var steps = g(d.steps, []), wide = steps.length >= 2 && steps.length <= 5, rail = g(d.rail, true);
      var host = rail ? 'ga-draw' : 'div';
      return '<section class="pad"' + ctx.id + '><div class="wrap">' + eyebrow(g(d.eyebrow, 'How we work'), K(ctx, 'eyebrow')) + title('h2', g(d.heading, 'From sketch to seed'), ctx.uid + '-title', '', K(ctx, 'heading')) +
        (d.intro ? '<ga-reveal' + K(ctx, 'intro') + '><p class="lede muted intro">' + esc(d.intro) + '</p></ga-reveal>' : '') +
        '<' + host + ' class="rail-host" style="--cols:' + steps.length + ';--n:' + Math.max(steps.length - 1, 1) + '"><div class="rail' + (wide ? '' : ' off') + '" aria-hidden="true"><i></i></div><ol' + K(ctx, 'steps') + (wide ? '' : ' class="many"') + '>' +
        steps.map(function (s, i) { return '<li style="--i:' + i + '"' + K(ctx, 'steps.' + i) + '><ga-reveal><span class="circle" aria-hidden="true">' + (i + 1) + '</span><h3' + K(ctx, 'steps.' + i + '.title') + '>' + esc(s.title) + '</h3><p class="muted"' + K(ctx, 'steps.' + i + '.text') + '>' + esc(s.text) + '</p></ga-reveal></li>'; }).join('') +
        '</ol></' + host + '>' + (d.cta_label ? '<ga-reveal' + K(ctx, 'cta_label') + '><a class="btn solid" href="#">' + esc(d.cta_label) + '</a></ga-reveal>' : '') + '</div></section>';
    },

    collection: function (d, ctx) {
      var all = D.lines, limit = g(d.limit, 0), list = limit > 0 ? all.slice(0, limit) : all;
      var ctaCard = g(d.cta_card, true), kicker = g(d.cta_kicker, 'Partnerships'), ctaLabel = g(d.cta_label, 'Ask about genetics licensing and collaboration');
      return '<section class="pad catalogue"' + ctx.id + '><div class="wrap"><div class="head"><div><ga-reveal><p class="eyebrow">' + String(list.length).padStart(2, '0') + ' lines</p></ga-reveal>' +
        title('h2', g(d.heading, 'The collection'), ctx.uid + '-title', '', K(ctx, 'heading')) + '</div>' + (d.intro ? '<ga-reveal' + K(ctx, 'intro') + '><p class="muted intro">' + esc(d.intro) + '</p></ga-reveal>' : '') + '</div><ul class="grid">' +
        list.map(function (l, i) {
          return '<li><ga-reveal><article class="card line" style="--c1:' + esc(l.c1) + ';--c2:' + esc(l.c2) + '"><div class="plate" aria-hidden="true">' + (g(d.plate_leaf, true) ? '<ga-draw>' + leaf('lf', 1.4) + '</ga-draw>' : '') +
            '<span class="n label">№ ' + String(i + 1).padStart(2, '0') + '</span><i class="chip" style="background:linear-gradient(135deg,var(--c1),var(--c2))"></i></div>' +
            '<p class="label meta"><span>' + esc(l.type) + '</span><span class="status">' + esc(l.status) + '</span></p><h3>' + esc(l.name) + '</h3><p class="lineage">' + esc(l.lineage) + '</p><p class="muted notes">' + esc(l.notes) + '</p></article></ga-reveal></li>';
        }).join('') +
        (ctaCard ? '<li><ga-reveal' + K(ctx, 'cta_label') + '><a class="card cta" href="#">' + (kicker ? '<span class="label">' + esc(kicker) + '</span>' : '') + '<span class="display">' + esc(ctaLabel) + '</span><span class="arrow" aria-hidden="true">→</span></a></ga-reveal></li>' : '') +
        '</ul></div></section>';
    },

    values: function (d, ctx) {
      var items = g(d.items, []), cols = ['2', '3', '4'].indexOf(String(g(d.columns, 'auto'))) >= 0 ? String(d.columns) : '';
      var ey = g(d.eyebrow, 'What we stand for'), heading = g(d.heading, ''), intro = d.intro ? hole('<div class="muted body">' + mdParse(d.intro) + '</div>') : '';
      var head = (ey || heading || intro) ? '<div class="head"><div>' + eyebrow(ey, K(ctx, 'eyebrow')) + title('h2', heading, ctx.uid + '-title', '', K(ctx, 'heading')) + '</div>' + (intro ? '<ga-reveal' + K(ctx, 'intro') + '>' + intro + '</ga-reveal>' : '') + '</div>' : '';
      return '<section class="pad"' + ctx.id + '><div class="wrap">' + head + '<ul class="grid' + (cols ? ' fixed' : '') + '"' + K(ctx, 'items') + (cols ? ' style="--cols:' + cols + '"' : '') + '>' +
        items.map(function (v, j) { return '<li' + K(ctx, 'items.' + j) + '><ga-reveal><div class="card value">' + (v.icon && v.icon !== 'none' ? '<span class="tile"' + K(ctx, 'items.' + j + '.icon') + '>' + icon(v.icon) + '</span>' : '') + '<h3' + K(ctx, 'items.' + j + '.title') + '>' + esc(v.title) + '</h3>' + (v.text ? '<p class="muted"' + K(ctx, 'items.' + j + '.text') + '>' + esc(v.text) + '</p>' : '') + '</div></ga-reveal></li>'; }).join('') +
        '</ul></div></section>';
    },

    stats: function (d, ctx) {
      return '<section class="pad stats"' + ctx.id + ' aria-label="By the numbers"><div class="wrap"><dl' + K(ctx, 'items') + '>' +
        g(d.items, []).map(function (s, j) { return '<ga-reveal class="card"' + K(ctx, 'items.' + j) + '><dd class="display"' + K(ctx, 'items.' + j + '.value') + '><ga-counter>' + esc(s.value) + esc(s.suffix) + '</ga-counter></dd><dt class="label muted"' + K(ctx, 'items.' + j + '.label') + '>' + esc(s.label) + '</dt></ga-reveal>'; }).join('') + '</dl></div></section>';
    },

    insights: function (d, ctx) {
      var count = Math.max(1, g(d.count, 3)), list = D.posts.filter(function (p) { return !d.category || p.category === d.category; }).slice(0, count);
      if (!list.length) return '<section class="pad"><div class="wrap"><p class="muted">The Insights block shows nothing yet: there are no published posts' + (d.category ? ' in this category' : '') + '.</p></div></section>';
      var cat = d.category && D.categories[d.category];
      return '<section class="pad insights"' + ctx.id + '><div class="wrap"><div class="head"><div>' + eyebrow(g(d.eyebrow, 'Insights'), K(ctx, 'eyebrow')) + title('h2', g(d.heading, 'Notes from the grow room'), ctx.uid + '-title', '', K(ctx, 'heading')) + '</div>' +
        (g(d.button_label, 'All insights') ? '<a class="btn" href="#"' + K(ctx, 'button_label') + '>' + esc(g(d.button_label, 'All insights')) + '</a>' : '') + '</div><ul class="grid">' +
        list.map(function (p) { return '\u0001POST' + JSON.stringify(p.id) + '\u0002'; }).join('') + '</ul></div></section>';
    },

    connect: function (d, ctx) {
      var email = D.site.contact.email, phone = D.site.contact.phone, loc = D.site.contact.location;
      var hasDetails = g(d.show_details, true) && (phone || loc), showSocial = g(d.show_social, true) && D.chrome.social;
      var ey = g(d.eyebrow, 'Contact'), heading = g(d.heading, "Let's make something <em>rare.</em>");
      return '<section class="pad"' + ctx.id + '><div class="wrap"><div class="panel">' + eyebrow(ey, K(ctx, 'eyebrow')) + title('h2', heading, ctx.uid + '-title', 'mega', K(ctx, 'heading')) +
        (g(d.show_email, true) && email ? '<ga-reveal><a class="mail display" href="#">' + esc(email) + '</a></ga-reveal>' : '') +
        ((hasDetails || showSocial) ? '<div class="cols">' + (hasDetails ? '<ga-reveal><h3 class="label">Reach out</h3><ul class="plain">' + (phone ? '<li><a href="#">' + esc(phone) + '</a></li>' : '') + (loc ? '<li>' + esc(loc) + '</li>' : '') + '</ul></ga-reveal>' : '') +
          (showSocial ? '<ga-reveal><h3 class="label">Follow</h3>' + hole(D.chrome.social) + '</ga-reveal>' : '') + '</div>' : '') +
        '</div></div></section>';
    },

    text: function (d, ctx) {
      var body = d.body ? hole('<div class="prose">' + mdParse(d.body) + '</div>') : '';
      return '<section class="pad textblock ' + g(d.align, 'left') + '"' + ctx.id + '><div class="wrap"><div class="col">' + eyebrow(d.eyebrow, K(ctx, 'eyebrow')) + title('h2', d.heading, ctx.uid + '-title', '', K(ctx, 'heading')) + (body ? '<ga-reveal' + K(ctx, 'body') + '>' + body + '</ga-reveal>' : '') + '</div></div></section>';
    },

    statement: function (d, ctx) {
      if (!d.text) return '';
      return '<section class="pad statement"' + ctx.id + '><div class="wrap">' + eyebrow(d.eyebrow, K(ctx, 'eyebrow')) + '<p class="display big"' + K(ctx, 'text') + '><ga-scrub>' + esc(d.text) + '</ga-scrub></p></div></section>';
    },

    image: function (d, ctx) {
      if (!d.image) return '<section class="pad"><div class="wrap"><p class="muted">Choose an image to see it here.</p></div></section>';
      var src = ctx.asset(d.image);
      return '<section class="pad band"' + ctx.id + '><div class="wrap"><figure' + K(ctx, 'image') + '><div class="frame ' + g(d.height, 'tall') + '"><ga-parallax><img src="' + esc(src) + '" alt="' + esc(d.alt) + '"></ga-parallax></div>' +
        (d.caption ? '<figcaption class="label muted"' + K(ctx, 'caption') + '>' + esc(d.caption) + '</figcaption>' : '') + '</figure></div></section>';
    },

    cta: function (d, ctx) {
      if (!d.heading && !d.text) return '';
      return '<section class="pad"' + ctx.id + '><div class="wrap"><div class="band">' + title('h2', d.heading, ctx.uid + '-title', '', K(ctx, 'heading')) + (d.text ? '<ga-reveal' + K(ctx, 'text') + '><p class="lede">' + esc(d.text) + '</p></ga-reveal>' : '') +
        (d.button_label ? '<ga-reveal' + K(ctx, 'button_label') + '><a class="go" href="#">' + esc(d.button_label) + '</a></ga-reveal>' : '') + '</div></div></section>';
    },
  };

  var DEFAULT_ANCHOR = { about: 'specimen', process: 'process', collection: 'collection', connect: 'connect' };
  var BACKED = ['about', 'values', 'process', 'collection', 'stats', 'insights', 'text', 'statement'];

  // A post card for the Insights block (src/components/PostCard.astro).
  var postCard = function (id) {
    var p = D.posts.filter(function (x) { return x.id === id; })[0];
    if (!p) return '';
    var cat = p.category && D.categories[p.category], author = p.author && D.people[p.author];
    return scope('<li><a class="card post" href="#">' + (cat ? '<span class="label cat">' + esc(cat.title) + '</span>' : '') + '<time class="label muted">' + esc(fmtDate(p.date)) + (p.tags.length ? ' · ' + esc(p.tags.join(', ')) : '') + '</time><h3>' + esc(p.title) + '</h3>' +
      (p.description ? '<p class="muted">' + esc(p.description) + '</p>' : '') + (author ? '<p class="label muted by">By ' + esc(author.name) + '</p>' : '') + '<span class="more label" aria-hidden="true">Read →</span></a></li>', D.cid.postcard);
  };

  // ---------- full pages ----------
  var chrome = function (backdropLevel, backdropPos, bodyHtml) {
    var op = { subtle: 0.35, medium: 0.55 }[backdropLevel];
    var backdrop = op ? D.chrome.backdrop.replace(/data-pos="\w+"/, 'data-pos="' + backdropPos + '"').replace(/--bd-op:[\d.]+/, '--bd-op:' + op) : '';
    return backdrop + D.chrome.header + '<main id="main">' + bodyHtml + '</main>' + D.chrome.footer;
  };

  function renderPage(entry, getAsset) {
    holes = [];
    var data = entry.get('data').toJS(), sections = g(data.sections, []);
    var used = {}, first = sections[0] && sections[0].type;
    var html = sections.map(function (s, i) {
      var fn = blocks[s.type];
      if (!fn) return '';
      var anchor = String(s.anchor || DEFAULT_ANCHOR[s.type] || '').trim().replace(/^#/, '');
      if (anchor && used[anchor]) anchor = '';
      if (anchor) used[anchor] = 1;
      var ctx = { k: 'sections.' + i, uid: 'b' + i, id: anchor ? ' id="' + esc(anchor) + '"' : '', asset: function (p) { try { var a = getAsset(p); return a ? (a.url || String(a)) : p; } catch (e) { return p; } } };
      var inner = fn(s, ctx);
      if (!inner) return '';
      var backing = g(s.backing, 'auto');
      var on = backing === 'on' || (backing === 'auto' && BACKED.indexOf(s.type) >= 0);
      var sec = scope(inner, D.cid[s.type]);
      return '<ga-section data-key-path="sections.' + i + '" data-spacing="' + g(s.spacing, 'normal') + '" data-backing="' + (on ? 'on' : 'off') + '" data-headline="off" data-items="off">' + sec + '</ga-section>';
    }).join('');
    html = html.replace(/\u0001POST"([^"]+)"\u0002/g, function (m, id) { return postCard(id); });
    var body = '<div data-key-path="sections"' + (first && first !== 'hero' ? ' class="page-offset"' : '') + '>' + (html || '<section class="pad"><div class="wrap"><p class="muted">This page has no blocks yet. Add one under Sections.</p></div></section>') + '</div>';
    // Page-level fields (title, description, background leaf) have no block of their own: they map to the header.
    return unhole(chrome(g(data.backdrop, 'subtle'), g(data.backdrop_position, 'left'), body).replace('<header class="site-header"', '<header data-key-path="title" class="site-header"'));
  }

  function authorCard(person, asset) {
    var photo = person.photo ? '<img src="' + esc(asset(person.photo)) + '" alt="">' : '<span class="initials" aria-hidden="true">' + esc(initials(person.name)) + '</span>';
    return scope('<div class="card author"><p class="label muted">Written by</p><div class="photo" data-key-path="photo">' + photo + '</div><p class="display name" data-key-path="name">' + esc(person.name) + '</p>' +
      (person.job_title ? '<p class="label role" data-key-path="job_title">' + esc(person.job_title) + '</p>' : '') + (person.bio ? '<p class="muted bio" data-key-path="bio">' + esc(person.bio) + '</p>' : '') + '</div>', D.cid.author);
  }

  function renderPost(entry, getAsset) {
    holes = [];
    var d = entry.get('data').toJS();
    var asset = function (p) { try { var a = getAsset(p); return a ? (a.url || String(a)) : p; } catch (e) { return p; } };
    var cat = d.category && D.categories[d.category], author = d.author && D.people[d.author], tags = g(d.tags, []);
    var article = scope('<article class="backing top pad"><div class="wrap"><a class="back label" href="#">← All insights</a>' + (cat ? '<p class="cat" data-key-path="category"><a class="label" href="#">' + esc(cat.title) + '</a></p>' : '') +
      '<h1 data-key-path="title">' + esc(g(d.title, 'Untitled')) + '</h1><p class="meta label muted" data-key-path="date"><time>' + esc(d.date ? fmtDate(d.date) : '') + '</time>' + (tags.length ? '<span> · ' + esc(tags.join(', ')) + '</span>' : '') + '</p>' +
      (d.cover ? '<img data-key-path="cover" src="' + esc(asset(d.cover)) + '" alt="" class="cover">' : '') + '<div class="layout"><div class="prose" data-key-path="body">' + hole(mdParse(d.body)) + '</div>' +
      (author ? '<aside class="rail" data-key-path="author" aria-label="About the author">' + authorCard(author, asset) + '</aside>' : '') + '</div></div></article>', D.cid.article);
    return unhole(chrome('subtle', 'left', article));
  }

  function renderPerson(entry, getAsset) {
    holes = [];
    var d = entry.get('data').toJS();
    var asset = function (p) { try { var a = getAsset(p); return a ? (a.url || String(a)) : p; } catch (e) { return p; } };
    return '<div style="max-width:22rem;margin:2rem auto">' + authorCard({ name: g(d.name, 'Name'), job_title: d.job_title, bio: d.bio, photo: d.photo }, asset) + '</div>';
  }

  // ---------- registration ----------
  var make = function (render) {
    return window.createClass({
      getInitialState: function () { return { ready: !!D }; },
      componentDidMount: function () {
        var self = this;
        if (!D) dataPromise.then(function (d) { D = d; self.setState({ ready: !!d }); });
      },
      render: function () {
        if (!D) return h('p', { style: { font: '14px sans-serif', padding: '1rem' } }, 'Loading preview…');
        var html;
        try { html = render(this.props.entry, this.props.getAsset); }
        catch (e) { html = '<p style="font:14px sans-serif;padding:1rem;color:#a00">Preview error: ' + esc(e && e.message) + '</p>'; }
        // Links are for show: with no href they cannot navigate, and clicks still reach Sveltia (which focuses the matching field).
        html = html.replace(/\shref="[^"]*"/g, '');
        // Keyboard access (per the Sveltia docs): Tab to an element and press Enter to jump to its field. Not the whole-list wrapper.
        html = html.replace(/ data-key-path="(?!sections")([^"]+)"/g, ' data-key-path="$1" tabindex="0"');
        return h('div', { className: 'ga-preview', dangerouslySetInnerHTML: { __html: html } });
      },
    });
  };

  CMS.registerPreviewTemplate('pages', make(renderPage));
  CMS.registerPreviewTemplate('blog', make(renderPost));
  CMS.registerPreviewTemplate('people', make(renderPerson));
})();
