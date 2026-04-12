/**
 * Resolve an image URL for a medicine name (used when admin creates/renames a medicine).
 * Order: Pexels (if PEXELS_API_KEY) → Wikipedia article thumbnail (no key).
 */

const FETCH_MS = 12_000;

async function fetchJson(url, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function normalizeUrl(src) {
  if (!src || typeof src !== "string") return null;
  let s = src.trim();
  if (s.startsWith("//")) s = `https:${s}`;
  if (!/^https:\/\//i.test(s)) return null;
  return s;
}

async function tryPexels(name) {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) return null;
  const query = `${name} medicine tablet`;
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
  const data = await fetchJson(url, { headers: { Authorization: key } });
  const photo = data?.photos?.[0];
  return normalizeUrl(photo?.src?.large2x || photo?.src?.large || photo?.src?.medium);
}

async function wikipediaThumbnail(title) {
  const u = new URL("https://en.wikipedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "pageimages");
  u.searchParams.set("format", "json");
  u.searchParams.set("piprop", "thumbnail");
  u.searchParams.set("pithumbsize", "640");

  const data = await fetchJson(u.toString());
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || page.missing) return null;
  return normalizeUrl(page.thumbnail?.source);
}

async function tryWikipedia(name) {
  const search = new URL("https://en.wikipedia.org/w/api.php");
  search.searchParams.set("action", "query");
  search.searchParams.set("list", "search");
  search.searchParams.set("srsearch", name);
  search.searchParams.set("srlimit", "6");
  search.searchParams.set("format", "json");

  const sdata = await fetchJson(search.toString());
  const results = sdata?.query?.search || [];
  for (const row of results) {
    const thumb = await wikipediaThumbnail(row.title);
    if (thumb) return thumb;
  }
  return null;
}

export async function fetchMedicineImageUrl(name) {
  const q = String(name || "").trim();
  if (!q) return null;
  const fromPexels = await tryPexels(q);
  if (fromPexels) return fromPexels;
  return tryWikipedia(q);
}
