/**
 * Genetic Artistry — scroll web components (vanilla custom elements, no dependencies).
 *
 *  <ga-reveal effect="up|fade|mask" delay="120">   fades/slides children in once
 *  <ga-section effect="rise" delay="0" duration="1000">  whole page-builder block entrance
 *  <ga-split>                                       headline, words rise in staggered
 *  <ga-scrub>                                       paragraph, words light up as you scroll
 *  <ga-parallax speed="0.2">                        drifts relative to scroll
 *  <ga-hscroll>                                     pinned section: vertical scroll drives a horizontal track
 *  <ga-counter to="47" suffix="+">                  counts up when visible
 *  <ga-progress>                                    thin gold page-progress bar
 */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

// One shared rAF-throttled scroll loop for all scroll-driven elements.
const tickers = new Set<() => void>();
let queued = false;
const run = () => {
  queued = false;
  tickers.forEach((fn) => fn());
};
const schedule = () => {
  if (!queued) {
    queued = true;
    requestAnimationFrame(run);
  }
};
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);

// Shared "became visible once" observer.
const seen = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        (e.target as HTMLElement).classList.add('in');
        (e.target as any).onEnter?.();
        seen.unobserve(e.target);
      }
    }
  },
  { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
);
const whenVisible = (el: Element) => (reduced ? el.classList.add('in') : seen.observe(el));

class GaReveal extends HTMLElement {
  connectedCallback() {
    const d = this.getAttribute('delay');
    if (d) this.style.transitionDelay = `${d}ms`;
    whenVisible(this);
  }
}

/**
 * <ga-section effect="none|fade|rise|left|right|zoom" delay="0" duration="1000">
 * Wraps a whole page-builder block. Has its own observer (threshold 0) so very tall blocks
 * still animate in; effect/delay/duration come from the block's Animation settings in the CMS.
 */
const sectionSeen = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        (e.target as HTMLElement).classList.add('in');
        sectionSeen.unobserve(e.target);
      }
    }
  },
  { threshold: 0, rootMargin: '0px 0px -8% 0px' },
);
class GaSection extends HTMLElement {
  connectedCallback() {
    const effect = this.getAttribute('effect') ?? 'none';
    const delay = this.getAttribute('delay');
    const duration = this.getAttribute('duration');
    if (delay) this.style.setProperty('--sec-delay', `${delay}ms`);
    if (duration) this.style.setProperty('--sec-dur', `${duration}ms`);
    if (effect === 'none' || reduced) return this.classList.add('in');
    sectionSeen.observe(this);
  }
}

class GaSplit extends HTMLElement {
  connectedCallback() {
    // Splits into words but keeps inline wrappers such as <em> intact.
    this.setAttribute('aria-label', (this.textContent ?? '').trim().replace(/\s+/g, ' '));
    let i = 0;
    const wrap = (text: string, tag?: string) =>
      text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => {
          const inner = tag ? `<${tag}>${w}</${tag}>` : w;
          return `<span class="w" aria-hidden="true"><span class="wi" style="transition-delay:${i++ * 70}ms">${inner}</span></span>`;
        })
        .join(' ');
    this.innerHTML = [...this.childNodes]
      .map((n) => (n.nodeType === 3 ? wrap(n.textContent ?? '') : wrap(n.textContent ?? '', (n as Element).tagName.toLowerCase())))
      .filter(Boolean)
      .join(' ');
    whenVisible(this);
  }
}

class GaScrub extends HTMLElement {
  private spans: HTMLElement[] = [];
  private update = () => this.draw();
  connectedCallback() {
    const text = (this.textContent ?? '').trim();
    this.setAttribute('aria-label', text);
    this.innerHTML = text
      .split(/\s+/)
      .map((w) => `<span class="sw" aria-hidden="true">${w}</span>`)
      .join(' ');
    this.spans = [...this.querySelectorAll<HTMLElement>('.sw')];
    if (reduced) return this.spans.forEach((s) => s.classList.add('on'));
    tickers.add(this.update);
    this.draw();
  }
  disconnectedCallback() {
    tickers.delete(this.update);
  }
  draw() {
    const r = this.getBoundingClientRect();
    const vh = innerHeight;
    const p = clamp((vh * 0.82 - r.top) / (vh * 0.32 + r.height));
    const lit = Math.round(p * this.spans.length);
    this.spans.forEach((s, i) => s.classList.toggle('on', i < lit));
  }
}

class GaParallax extends HTMLElement {
  private update = () => this.draw();
  connectedCallback() {
    if (reduced) return;
    tickers.add(this.update);
    this.draw();
  }
  disconnectedCallback() {
    tickers.delete(this.update);
  }
  draw() {
    const host = (this.parentElement as HTMLElement).getBoundingClientRect();
    const speed = parseFloat(this.getAttribute('speed') ?? '0.2');
    const off = host.top + host.height / 2 - innerHeight / 2;
    const rot = parseFloat(this.getAttribute('rotate') ?? '0');
    this.style.transform = `translate3d(0, ${(-off * speed).toFixed(1)}px, 0) rotate(${(off * rot).toFixed(2)}deg)`;
  }
}

class GaHScroll extends HTMLElement {
  private track!: HTMLElement;
  private dist = 0;
  private update = () => this.draw();
  connectedCallback() {
    this.track = this.querySelector<HTMLElement>('.track')!;
    this.mq = matchMedia('(min-width: 860px)');
    this.mq.addEventListener('change', () => this.layout());
    addEventListener('resize', () => this.layout());
    addEventListener('load', () => this.layout());
    tickers.add(this.update);
    this.layout();
    // Keyboard a11y: when focus lands on an off-screen card, scroll the page so it slides into view.
    this.addEventListener('focusin', (e) => {
      if (!this.on) return;
      const card = (e.target as HTMLElement).closest<HTMLElement>('.track > *');
      if (!card) return;
      const center = card.offsetLeft + card.offsetWidth / 2 - innerWidth / 2;
      const p = clamp(center / this.dist);
      const pageTop = this.getBoundingClientRect().top + scrollY;
      scrollTo({ top: pageTop + p * (this.offsetHeight - innerHeight), behavior: reduced ? 'auto' : 'smooth' });
    });
  }
  private mq!: MediaQueryList;
  private on = false;
  layout() {
    this.on = this.mq.matches && !reduced;
    this.toggleAttribute('active', this.on);
    if (!this.on) {
      this.style.height = '';
      this.track.style.transform = '';
      return;
    }
    this.dist = Math.max(0, this.track.scrollWidth - innerWidth);
    this.style.height = `${this.dist + innerHeight}px`;
    this.draw();
  }
  draw() {
    if (!this.on) return;
    const r = this.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    this.track.style.transform = `translate3d(${(-p * this.dist).toFixed(1)}px,0,0)`;
    this.style.setProperty('--p', p.toFixed(4));
  }
}

class GaCounter extends HTMLElement {
  connectedCallback() {
    // `static` shows the final number straight away (editor turned counting off).
    if (this.hasAttribute('static')) return;
    this.textContent = '0' + (this.getAttribute('suffix') ?? '');
    whenVisible(this);
  }
  onEnter() {
    const to = parseFloat(this.getAttribute('to') ?? '0');
    const suffix = this.getAttribute('suffix') ?? '';
    if (reduced) return void (this.textContent = to + suffix);
    const t0 = performance.now();
    const dur = 1800;
    const step = (t: number) => {
      const k = clamp((t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 4);
      this.textContent = Math.round(to * eased) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

class GaProgress extends HTMLElement {
  private update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    this.style.setProperty('--p', String(max > 0 ? clamp(scrollY / max) : 0));
    document.documentElement.toggleAttribute('data-scrolled', scrollY > 40);
  };
  connectedCallback() {
    tickers.add(this.update);
    this.update();
  }
}

/** <ga-theme> wraps buttons[data-theme-value]; sets <html data-theme> and remembers it. */
class GaTheme extends HTMLElement {
  connectedCallback() {
    const root = document.documentElement;
    const buttons = [...this.querySelectorAll<HTMLButtonElement>('button[data-theme-value]')];
    const sync = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeValue === root.dataset.theme)));
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        root.dataset.theme = b.dataset.themeValue;
        try { localStorage.setItem('ga-theme', b.dataset.themeValue!); } catch {}
        document.dispatchEvent(new Event('ga-theme-change'));
      }),
    );
    document.addEventListener('ga-theme-change', sync); // keeps header + footer switchers in step
    sync();
  }
}

/**
 * <ga-draw>            line-art that draws itself as you scroll (scrub)
 * <ga-draw autoplay>   draws once when it first becomes visible
 */
class GaDraw extends HTMLElement {
  private paths: SVGGeometryElement[] = [];
  private update = () => this.draw();
  connectedCallback() {
    this.paths = [...this.querySelectorAll<SVGGeometryElement>('path,line,circle')];
    this.paths.forEach((p) => p.setAttribute('pathLength', '1'));
    if (reduced) return;
    if (this.hasAttribute('autoplay')) return whenVisible(this);
    tickers.add(this.update);
    this.draw();
  }
  disconnectedCallback() {
    tickers.delete(this.update);
  }
  draw() {
    const r = this.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.45 + r.height * 0.5));
    this.style.setProperty('--d', (1 - p).toFixed(3));
  }
}

const defs: [string, CustomElementConstructor][] = [
  ['ga-draw', GaDraw],
  ['ga-theme', GaTheme],
  ['ga-reveal', GaReveal],
  ['ga-section', GaSection],
  ['ga-split', GaSplit],
  ['ga-scrub', GaScrub],
  ['ga-parallax', GaParallax],
  ['ga-hscroll', GaHScroll],
  ['ga-counter', GaCounter],
  ['ga-progress', GaProgress],
];
defs.forEach(([n, c]) => customElements.get(n) || customElements.define(n, c));
