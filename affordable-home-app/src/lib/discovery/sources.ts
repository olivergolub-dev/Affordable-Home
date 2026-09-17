/**
 * Candidate finders for the weekly discovery job. Each source returns the
 * property pages it lists for Essex County — just name, town and URL. The
 * detailed fields are extracted later (see extract.ts) only for pages we
 * haven't seen before, so a source can be broad and cheap.
 *
 * COMPLIANCE: every source here allows crawling in its robots.txt for the
 * paths used (checked 2026-09-16). Keep it that way — see the note in
 * scripts/ingest.ts about MyHousingSearch. Requests are sequential with a
 * small delay; this is a once-a-week job, not a scraper.
 */
import { normalizeMunicipality, type EssexMunicipality } from './essex';

export interface Candidate {
  name: string;
  /** Town when the index page states it; null means the extractor decides from the page. */
  city: EssexMunicipality | null;
  /** Canonical property page — also the dedupe key. */
  source_url: string;
  /** Human-readable source name, matches listings.source. */
  source: string;
}

const USER_AGENT = 'Mozilla/5.0 (compatible; HomeReachDiscovery/1.0; +https://homereach.site)';
const DELAY_MS = 750;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchHtml(url: string, timeoutMs = 20000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Visible text of a page, scripts/styles stripped, whitespace collapsed, capped. */
export function htmlToText(html: string, maxChars = 14000): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
  return text.length > maxChars ? text.slice(0, maxChars) + '\n[truncated]' : text;
}

/** JSON-LD ItemList entries on a page ({name, url}), or []. */
function jsonLdItems(html: string): { name: string; url: string }[] {
  const out: { name: string; url: string }[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const lists = (Array.isArray(data) ? data : [data]).filter((d) => d && d['@type'] === 'ItemList');
      for (const list of lists) {
        for (const item of list.itemListElement ?? []) {
          if (typeof item?.name === 'string' && typeof item?.url === 'string') out.push({ name: item.name, url: item.url });
        }
      }
    } catch {
      /* not JSON — ignore */
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Affordable Housing Hub — https://affordablehousinghub.org
// County page lists towns; each town page lists properties (34/page, ?page=N),
// both as schema.org ItemList JSON-LD. robots.txt allows /housing/*.
// ---------------------------------------------------------------------------
const HUB = 'https://affordablehousinghub.org';
const HUB_ESSEX = `${HUB}/housing/new-jersey/essex`;

export async function findAffordableHousingHub(log: (s: string) => void = () => {}): Promise<Candidate[]> {
  const county = await fetchHtml(HUB_ESSEX);
  if (!county) {
    log('  Hub: could not load county page');
    return [];
  }
  const towns = jsonLdItems(county).filter((t) => t.url.startsWith(`${HUB_ESSEX}/`));
  const seen = new Set<string>();
  const out: Candidate[] = [];

  for (const town of towns) {
    const city = normalizeMunicipality(town.name);
    if (!city) {
      log(`  Hub: skipping unrecognized town "${town.name}"`);
      continue;
    }
    for (let page = 1; page <= 15; page++) {
      await sleep(DELAY_MS);
      const html = await fetchHtml(page === 1 ? town.url : `${town.url}?page=${page}`);
      if (!html) break;
      const items = jsonLdItems(html).filter((i) => i.url.startsWith(`${town.url}/`));
      let added = 0;
      for (const i of items) {
        if (seen.has(i.url)) continue;
        seen.add(i.url);
        out.push({ name: i.name.trim(), city, source_url: i.url, source: 'Affordable Housing Hub' });
        added++;
      }
      if (items.length === 0 || added === 0) break; // past the last page (the site repeats it)
    }
  }
  log(`  Hub: ${out.length} properties across ${towns.length} town pages`);
  return out;
}

// ---------------------------------------------------------------------------
// Fair Share Housing Center — https://www.fairsharehousing.org/rentals
// Cards: <article><h3><a href="...">Name</a></h3><p>Located in X County, ...</p>
// robots.txt allows /rentals.
// ---------------------------------------------------------------------------
const FAIR_SHARE_RENTALS = 'https://www.fairsharehousing.org/rentals';

export async function findFairShare(log: (s: string) => void = () => {}): Promise<Candidate[]> {
  const html = await fetchHtml(FAIR_SHARE_RENTALS);
  if (!html) {
    log('  Fair Share: could not load rentals page');
    return [];
  }
  const out: Candidate[] = [];
  for (const m of html.matchAll(/<article[\s\S]*?<\/article>/g)) {
    const card = m[0];
    if (!/essex county/i.test(card)) continue;
    const link = card.match(/<h3>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!link) continue;
    const name = htmlToText(link[2], 200);
    // The card's own link is the developer's site; we still want a Fair Share
    // anchor as the source page when one exists. Fall back to the card link.
    const own = card.match(/href="(\/rental\/[^"]+|https:\/\/www\.fairsharehousing\.org\/rental\/[^"]+)"/);
    const url = own ? new URL(own[1], FAIR_SHARE_RENTALS).toString() : link[1];
    // The card only names the county; the extractor determines the town.
    out.push({ name, city: null, source_url: url, source: 'Fair Share Housing Center' });
  }
  log(`  Fair Share: ${out.length} Essex County rentals`);
  return out;
}

export const SOURCES: { name: string; find: (log: (s: string) => void) => Promise<Candidate[]> }[] = [
  { name: 'Affordable Housing Hub', find: findAffordableHousingHub },
  { name: 'Fair Share Housing Center', find: findFairShare },
];
