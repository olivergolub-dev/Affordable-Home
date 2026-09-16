/**
 * Link-health check for listing source URLs. Pure and dependency-free (uses the
 * global fetch), so it runs the same in a Node script, a CI job, or a route
 * handler. It does NOT decide to delete anything — it reports, a human acts.
 *
 * Crucially, it distinguishes "actually gone" from "couldn't verify". Many
 * housing directories return 403 to non-browser requests (anti-bot), which does
 * NOT mean the page is dead — so a 403 is informational, not an alarm. Only a
 * 404/410 (or a missing URL) is a real "this may need removing" signal.
 */

export type LinkCategory =
  | 'ok' // 2xx and the page still names the property
  | 'name_mismatch' // 2xx but the property name isn't on the page (often a generic list page)
  | 'redirected_away' // 2xx, but the site bounced us to a different page (index/home) that doesn't name the property — a soft 404
  | 'gone' // 404/410 — the strong "probably removed" signal
  | 'blocked' // 401/403/429 or other 4xx — site blocked the request; usually still fine in a browser
  | 'server_error' // 5xx — transient server problem
  | 'unreachable' // timeout / DNS / network error
  | 'missing_url'; // listing has no source_url at all

/** How loudly to surface a result. */
export type LinkSeverity = 'ok' | 'action' | 'review' | 'info';

export function severityOf(category: LinkCategory): LinkSeverity {
  if (category === 'ok') return 'ok';
  if (category === 'gone' || category === 'redirected_away' || category === 'missing_url') return 'action';
  if (category === 'name_mismatch') return 'review';
  return 'info'; // blocked / server_error / unreachable
}

export interface CheckableListing {
  id: string;
  name: string;
  city: string;
  source_url: string | null;
}

export interface LinkCheckResult {
  id: string;
  name: string;
  city: string;
  source_url: string | null;
  /** True when the URL resolved (status < 400). */
  ok: boolean;
  /** True when the page still mentions the property. */
  nameFound: boolean;
  /** Where the request ended up after redirects, when it differs from source_url. */
  finalUrl: string | null;
  status: number | null;
  category: LinkCategory;
  reason: string;
}

const USER_AGENT =
  'Mozilla/5.0 (compatible; HomeReachLinkCheck/1.0; +https://homereach.site)';

/** First word of the name that's ≥3 chars, lowercased — a loose "is this still about the property" probe. */
function firstToken(name: string): string | null {
  const m = name.toLowerCase().match(/[a-z0-9]{3,}/);
  return m ? m[0] : null;
}

/** True when two URLs point at the same path (ignoring scheme, www, trailing slash, query and hash). */
function samePath(a: string, b: string): boolean {
  try {
    const norm = (u: string) => new URL(u).pathname.replace(/\/+$/, '').toLowerCase();
    return norm(a) === norm(b);
  } catch {
    return a === b;
  }
}

function categorizeStatus(status: number): LinkCategory {
  if (status === 404 || status === 410) return 'gone';
  if (status >= 500) return 'server_error';
  return 'blocked'; // 401/403/429 and any other 4xx — typically anti-bot, not a dead page
}

async function checkOne(listing: CheckableListing, timeoutMs: number): Promise<LinkCheckResult> {
  const base = { id: listing.id, name: listing.name, city: listing.city, source_url: listing.source_url };
  if (!listing.source_url) {
    return { ...base, ok: false, nameFound: false, finalUrl: null, status: null, category: 'missing_url', reason: 'No source URL' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(listing.source_url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
    });
    if (res.status >= 400) {
      const category = categorizeStatus(res.status);
      const label = category === 'gone' ? 'gone' : category === 'server_error' ? 'server error' : 'blocked (anti-bot?)';
      return { ...base, ok: false, nameFound: false, finalUrl: null, status: res.status, category, reason: `HTTP ${res.status} — ${label}` };
    }
    let nameFound = true;
    try {
      const body = (await res.text()).toLowerCase();
      const token = firstToken(listing.name);
      nameFound = token ? body.includes(token) : true;
    } catch {
      nameFound = true; // couldn't read the body — don't penalize the listing
    }
    // Directories often "soft-404" a removed property by redirecting to the
    // town index or the home page with a 200. Same path with only host/scheme
    // changes (http→https, www) is not a redirect away.
    const finalUrl = res.url && res.url !== listing.source_url ? res.url : null;
    const redirectedAway = finalUrl != null && !samePath(listing.source_url, finalUrl);
    if (nameFound) {
      return { ...base, ok: true, nameFound, finalUrl, status: res.status, category: 'ok', reason: 'OK' };
    }
    if (redirectedAway) {
      return {
        ...base,
        ok: false,
        nameFound,
        finalUrl,
        status: res.status,
        category: 'redirected_away',
        reason: `Redirected to ${finalUrl} — property no longer on page (likely removed)`,
      };
    }
    return {
      ...base,
      ok: true,
      nameFound,
      finalUrl,
      status: res.status,
      category: 'name_mismatch',
      reason: `HTTP ${res.status} but property name not found on page`,
    };
  } catch (err) {
    const isTimeout = (err as Error)?.name === 'AbortError';
    return {
      ...base,
      ok: false,
      nameFound: false,
      finalUrl: null,
      status: null,
      category: 'unreachable',
      reason: isTimeout ? 'Timed out' : `Unreachable (${(err as Error)?.message ?? 'network error'})`,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Check every listing's source_url with a bounded concurrency pool. Never throws. */
export async function checkLinks(
  listings: CheckableListing[],
  opts: { concurrency?: number; timeoutMs?: number } = {},
): Promise<LinkCheckResult[]> {
  const concurrency = opts.concurrency ?? 8;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const results: LinkCheckResult[] = new Array(listings.length);
  let next = 0;

  async function worker() {
    for (;;) {
      const idx = next++;
      if (idx >= listings.length) return;
      results[idx] = await checkOne(listings[idx], timeoutMs);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, listings.length) }, worker));
  return results;
}
