# Genetic Artistry

Component-driven website built with [Astro](https://astro.build) and managed with [Sveltia CMS](https://github.com/sveltia/sveltia-cms).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
```

Edit content locally at `http://localhost:4321/admin` (Sveltia can open a local project folder via "Work with Local Repository" in Chrome/Edge).

## Structure

| Path | Purpose |
| --- | --- |
| `src/components/` | Page blocks (Hero, Specimen/About, Process, Catalogue, Values, Stats, Insights, Connect, TextBlock, Statement, ImageBand, CtaBand), the `Sections.astro` renderer, plus Header, Footer, SocialLinks, InstagramFeed, PostCard, Logo |
| `src/pages/` | Home (`index.astro`), any other page (`[page].astro`), Insights list, category and post pages (`/insights`), and the component gallery (`/components`) |
| `src/content/pages/` | Pages as ordered lists of blocks (`home.json` is the home page), edited through the CMS |
| `src/content/blog/` | Insight posts (Markdown), edited through the CMS as **Insights** |
| `src/content/people/` | People (name, title, photo, short bio) used as authors, edited as **People** |
| `src/content/categories/` | Insight categories (Business Insights, Cultivation, Grow Journal…), edited as **Insight Categories** |
| `src/data/site.json` | Company text, contact info, social links, footer disclaimer, Instagram feed ID (edited through the CMS) |
| `src/data/lines.json` | The genetic lines shown by the Collection block |
| `public/admin/` | Sveltia CMS entry point and `config.yml` |
| `public/logo/` | Logo SVGs: `logo-mark`, `logo-text-below`, `logo-text-above` |

## Page builder

Pages are an ordered list of **blocks**. In `/admin` → **Pages**, open a page (the one called `home` is the home page; any other page is published at `/<slug>`), then add, delete and drag blocks to rearrange them.

- **Block types:** Hero, About, Values, Process, Collection, Numbers, Insights, Contact panel, Text, Statement, Image, Call to action. See `/components` for a live gallery of each.
- **Shared settings on every block:** *Space above and below* (none / compact / normal / roomy), an optional *Anchor name* (for links like `/#contact`), and an **Animation** group:
  - *Block entrance*: none, fade, rise, slide from left or right, zoom, with *speed* and *delay* in milliseconds
  - *Headline words rise one by one*: on or off
  - *Cards and paragraphs appear in turn*: on or off
- **Block-specific motion:** Hero leaf (draws itself / still / none, and subtle to bold), Process line (draws across or static), Numbers (count up or show final), Image (parallax on or off).
- Motion switches off automatically for visitors who prefer reduced motion.
- **Add a new block type:** build the component, register it in `src/components/Sections.astro`, add its schema in `src/content.config.ts` and its fields in `public/admin/config.yml`.

## Design system

- **Type:** Bitter (display) + Montserrat (text and labels). Tokens live in `src/styles/global.css`.
- **Colour schemes:** Sage (default), Paper, Night and High contrast, defined in `src/styles/themes.css`. Visitors switch via the Theme menu in the header or the footer. The first visit follows the OS (`prefers-color-scheme`, and High contrast for `prefers-contrast: more`). To add a scheme, add a `[data-theme='name']` block and a button in `ThemeSwitcher.astro`.
- **Accessibility:** all text pairings are checked against WCAG AA (body text reaches AAA). Skip link, visible focus rings, 44px targets, semantic landmarks, reduced-motion support, no-JS fallback.
- **Scroll web components** (`src/scripts/components.ts`, vanilla custom elements): `<ga-section>`, `<ga-reveal>`, `<ga-split>`, `<ga-scrub>`, `<ga-parallax>`, `<ga-draw>`, `<ga-hscroll>`, `<ga-counter>`, `<ga-progress>`, `<ga-theme>`. Use them in any page or component.
- **Content:** page text lives in `src/content/pages/*.json` (edited as blocks), collection lines in `src/data/lines.json`, company details in `src/data/site.json`. All of it is placeholder text to replace, and all editable in `/admin`.

## Instagram feed

1. Create a free feed at [behold.so](https://behold.so) for the Instagram account.
2. In `/admin` → Site Settings → Instagram Feed, paste the **Feed ID**.

Without a Feed ID the site just shows a link to the profile.

## Deploy (GitHub Pages + Cloudflare) and CMS login

The domain is set in three places; change all of them together: `public/CNAME`, `site` in `astro.config.mjs`, and `site_url`/`display_url` in `public/admin/config.yml` (plus `ALLOWED_ORIGIN` in `oauth-worker/wrangler.toml`). It is currently the placeholder `geneticartistry.com`.

### 1. Publish
1. Push this repo to GitHub (`mmoylan/GeneticArtistry`). Free accounts need a public repo for Pages.
2. GitHub → **Settings → Pages → Source: GitHub Actions**. Every push to `main` (including CMS saves) runs `.github/workflows/deploy.yml`.
3. In the same Pages screen enter the custom domain, then tick **Enforce HTTPS** once the certificate is ready.

### 2. Cloudflare DNS
- Apex domain: four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- `www`: `CNAME` → `mmoylan.github.io`.
- Keep them **DNS only** (grey cloud) until GitHub issues the certificate, then switch to **Proxied** and set SSL/TLS mode to **Full** (not Flexible, which loops).

### 3. CMS login (OAuth Worker)
1. GitHub → **Settings → Developer settings → OAuth Apps → New**. Homepage URL: your site. Callback URL: `https://ga-cms-auth.<your-subdomain>.workers.dev/callback`. Create it and generate a client secret.
2. In `oauth-worker/`:
   ```
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```
   `deploy` prints the Worker URL; use it for the OAuth app callback above and for `base_url` in `public/admin/config.yml`.
3. Open `/admin` on the live site and choose **Sign in with GitHub**.

Fallback: on the login screen choose "Sign in with token" and paste a GitHub personal access token with repo access.

## Logo notes

`public/logo/*.svg` are generated geometric vectors. The wordmark is live text (Cormorant Garamond with Georgia fallback); convert it to outlines in Inkscape/Illustrator before sending to print.
