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

## Instagram feed

1. Create a free feed at [behold.so](https://behold.so) for the Instagram account.
2. In `/admin` → Site Settings → Instagram Feed, paste the **Feed ID**.

Without a Feed ID the site just shows a link to the profile.

## Deploy (Netlify) and CMS login

1. Push this repo to GitHub, then in Netlify choose **Add new site → Import from Git**.
2. In Netlify: **Site configuration → Access & security → OAuth → Install provider → GitHub** (this lets `/admin` sign in with GitHub).
3. Update `site` in `astro.config.mjs` and `site_url` in `public/admin/config.yml` to the real domain.

Alternative sign-in: on the `/admin` login screen choose "Sign in with token" and paste a GitHub personal access token with repo access.

## Logo notes

`public/logo/*.svg` are generated geometric vectors. The wordmark is live text (Cormorant Garamond with Georgia fallback); convert it to outlines in Inkscape/Illustrator before sending to print.
