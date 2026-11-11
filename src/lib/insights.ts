import { getCollection, getEntry } from 'astro:content';

/** Categories in the order set in the CMS (then by title). */
export async function getCategories() {
  const all = await getCollection('categories');
  return all.sort((a, b) => (a.data.order ?? 100) - (b.data.order ?? 100) || a.data.title.localeCompare(b.data.title));
}

/** Published insights, newest first. Pass a category id to filter. */
export async function getPosts(categoryId?: string) {
  const posts = await getCollection('blog', (p) => !p.data.draft && (!categoryId || p.data.category === categoryId));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The author (person) of a post, if it has one and they still exist. */
export async function getAuthorOf(post: { data: { author?: string } }) {
  return post.data.author ? ((await getEntry('people', post.data.author)) ?? undefined) : undefined;
}

/** The category entry for a post, if it has one and it still exists. */
export async function getCategoryOf(post: { data: { category?: string } }) {
  return post.data.category ? ((await getEntry('categories', post.data.category)) ?? undefined) : undefined;
}
