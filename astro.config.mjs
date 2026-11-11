import { defineConfig } from 'astro/config';

// Keep in sync with public/CNAME and public/admin/config.yml (site_url).
export default defineConfig({
  site: 'https://geneticartistry.com',
  // Old /blog addresses keep working.
  redirects: { '/blog': '/insights', '/blog/[...slug]': '/insights/[...slug]' },
});
