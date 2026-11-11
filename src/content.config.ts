import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().default(''),
    cover: z.string().optional(),
    category: z.string().optional(), // id of an entry in the categories collection
    author: z.string().optional(), // id of an entry in the people collection
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/* People (authors and team), managed in the CMS. */
const people = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    job_title: z.string().default(''),
    photo: z.string().optional(),
    bio: z.string().default(''),
    order: z.coerce.number().default(100),
  }),
});

/* Insight categories (e.g. Business Insights, Cultivation, Grow Journal), managed in the CMS. */
const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    order: z.coerce.number().default(100),
  }),
});

/* ---------- Page builder ----------
 * A page is an ordered list of typed blocks ("sections"). Editors add, remove and reorder them in /admin.
 * Every block shares `anchor`, `spacing` and `animation`; the rest is specific to its type.
 * Defaults for anything left blank live in the components, so partial content never breaks a page. */
const animation = z
  .object({
    entrance: z.enum(['none', 'fade', 'rise', 'left', 'right', 'zoom']).optional(),
    duration: z.coerce.number().optional(), // ms
    delay: z.coerce.number().optional(), // ms
    headline_words: z.boolean().optional(), // headline words rise in one by one
    item_motion: z.boolean().optional(), // cards / paragraphs reveal one after another
  })
  .optional();

const base = {
  anchor: z.string().optional(),
  spacing: z.enum(['none', 'compact', 'normal', 'roomy']).optional(),
  animation,
};
const str = z.string().optional();
const bool = z.boolean().optional();
const num = z.coerce.number().optional();
const leaf = z.enum(['draw', 'static', 'none']).optional();

const section = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'), ...base, eyebrow: str, title: str, lede: str, primary_label: str, primary_link: str, secondary_label: str, secondary_link: str, leaf, leaf_strength: z.enum(['subtle', 'medium', 'bold']).optional() }),
  z.object({ type: z.literal('about'), ...base, eyebrow: str, heading: str, body: str, plate_label: str, plate_caption: str, facts_label: str, facts: z.array(z.object({ label: str, value: str })).optional(), quote_label: str, quote: str, leaf }),
  z.object({ type: z.literal('process'), ...base, eyebrow: str, heading: str, intro: str, steps: z.array(z.object({ title: str, text: str })).optional(), cta_label: str, cta_link: str, rail: bool }),
  z.object({ type: z.literal('collection'), ...base, heading: str, intro: str, limit: num, plate_leaf: bool, cta_card: bool, cta_kicker: str, cta_label: str, cta_link: str }),
  z.object({ type: z.literal('values'), ...base, eyebrow: str, heading: str, intro: str, columns: z.enum(['auto', '2', '3', '4']).optional(), items: z.array(z.object({ icon: str, title: str, text: str })).optional() }),
  z.object({ type: z.literal('stats'), ...base, items: z.array(z.object({ value: num, suffix: str, label: str })).optional(), count_up: bool }),
  z.object({ type: z.literal('insights'), ...base, eyebrow: str, heading: str, count: num, category: str, button_label: str }),
  z.object({ type: z.literal('connect'), ...base, eyebrow: str, heading: str, show_email: bool, show_details: bool, show_social: bool, show_instagram: bool }),
  z.object({ type: z.literal('text'), ...base, eyebrow: str, heading: str, body: str, align: z.enum(['left', 'center']).optional() }),
  z.object({ type: z.literal('statement'), ...base, eyebrow: str, text: str }),
  z.object({ type: z.literal('image'), ...base, image: str, alt: str, caption: str, height: z.enum(['short', 'tall', 'screen']).optional(), parallax: bool }),
  z.object({ type: z.literal('cta'), ...base, heading: str, text: str, button_label: str, button_link: str }),
]);

const pages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    backdrop: z.enum(['none', 'subtle', 'medium']).optional(),
    backdrop_position: z.enum(['right', 'left', 'center']).optional(),
    sections: z.array(section).default([]),
  }),
});

export const collections = { blog, categories, people, pages };
