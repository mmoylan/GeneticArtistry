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
| `src/components/` | Reusable pieces: Header, Hero, Section, ContactCard, SocialLinks, InstagramFeed, PostCard, Logo |
| `src/pages/` | Home (`index.astro`), blog list and post pages |
| `src/content/blog/` | Blog posts (Markdown), edited through the CMS |
| `src/data/site.json` | Company text, contact info, social links, Instagram feed ID (edited through the CMS) |
| `public/admin/` | Sveltia CMS entry point and `config.yml` |
| `public/logo/` | Logo SVGs: `logo-mark`, `logo-text-below`, `logo-text-above` |

## Design system

- **Type:** Fraunces (display, huge fluid scale, italic accents, outlined decorative type) + Manrope (text and labels). Tokens live in `src/styles/global.css`.
- **Colour schemes:** Obsidian, Ivory, Midnight, Plum and High contrast, defined in `src/styles/themes.css`. Visitors switch via the Theme menu in the header or the footer. The first visit follows the OS (`prefers-color-scheme`, and High contrast for `prefers-contrast: more`). To add a scheme, add a `[data-theme='name']` block and a button in `ThemeSwitcher.astro`.
- **Accessibility:** all text pairings are checked against WCAG AA (body text reaches AAA). Skip link, visible focus rings, 44px targets, semantic landmarks, reduced-motion support, no-JS fallback, keyboard access to the pinned horizontal collection.
- **Scroll web components** (`src/scripts/components.ts`, vanilla custom elements): `<ga-reveal>`, `<ga-split>`, `<ga-scrub>`, `<ga-parallax>`, `<ga-hscroll>`, `<ga-counter>`, `<ga-progress>`, `<ga-theme>`. Use them in any page or component.
- **Content:** homepage copy lives in `src/data/story.json`, collection lines in `src/data/lines.json`. All of it is placeholder text to replace, and all editable in `/admin`.

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
