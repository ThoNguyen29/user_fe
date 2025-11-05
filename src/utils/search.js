// Lightweight wrapper that lazy-loads Fuse.js via ESM CDN
// Avoids adding local dependency while keeping fuzzy search quality

export async function fuzzySearch(items, query, keys) {
  if (!query) return items;
  const { default: Fuse } = await import('https://esm.sh/fuse.js@6');
  const fuse = new Fuse(items, {
    keys: keys || ['name', 'description'],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  const results = fuse.search(query);
  return results.map(r => r.item);
}


