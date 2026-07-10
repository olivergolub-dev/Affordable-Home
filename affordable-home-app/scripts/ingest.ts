/**
 * Home Reach ingestion script.
 *
 * Loads listings into Supabase. This is the ONLY place that uses the
 * service_role key, and it runs on your machine — never in the browser.
 *
 * Usage:
 *   1. Create the table:   run supabase/migrations/0001_listings.sql in the
 *      Supabase SQL editor (once).
 *   2. Add to .env.local:  SUPABASE_SERVICE_ROLE_KEY=<your service_role secret>
 *      (NEXT_PUBLIC_SUPABASE_URL is already there. .env* is gitignored.)
 *   3. Run:                npx tsx scripts/ingest.ts
 *
 * Idempotent: upserts on (name, city) so re-running updates rather than
 * duplicates. Requires a unique index — the script adds one if missing via the
 * onConflict target below (create it once in SQL, see note at bottom).
 *
 * COMPLIANCE: this pulls from robots-permitted public sources only. It must not
 * scrape MyHousingSearch.com's disallowed endpoints (/dbh/ViewUnit,
 * /dbh/SearchHousingSubmit.html, /tenant/Search.html.ESP). To add a live
 * source, write a fetcher that returns SeedListing[] and concat it below.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { SEED_LISTINGS, type SeedListing } from './seed-listings';

// Load .env.local without a dependency.
function loadEnvLocal() {
  try {
    const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* no .env.local — rely on real env */
  }
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '\nMissing config. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.\n' +
      'Find the service_role secret in Supabase → Project Settings → API.\n',
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const rows: SeedListing[] = [...SEED_LISTINGS];
  // Future: rows.push(...(await scrapeNewarkHA()), ...(await scrapeDCA()));

  console.log(`Upserting ${rows.length} listings...`);
  const { data, error } = await admin
    .from('listings')
    .upsert(rows, { onConflict: 'name,city', ignoreDuplicates: false })
    .select('id');

  if (error) {
    console.error('Ingest failed:', error.message);
    console.error(
      '\nIf the error mentions "no unique constraint", run this once in the SQL editor:\n' +
        '  create unique index if not exists listings_name_city_uniq on public.listings (name, city);\n',
    );
    process.exit(1);
  }

  console.log(`Done. ${data?.length ?? 0} listings in the table.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
