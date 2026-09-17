/**
 * Weekly discovery of new Essex County affordable-housing listings.
 *
 *   1. Ask each source (src/lib/discovery/sources.ts) for the properties it
 *      lists in Essex County.
 *   2. Drop anything already in `listings` or `pending_listings` (any status).
 *   3. For up to MAX_NEW_PER_RUN new ones: fetch the page, have Claude extract
 *      the listing fields (src/lib/discovery/extract.ts), and insert a
 *      `pending_listings` row — 'pending' for a reviewer, or 'skipped' when it
 *      isn't an Essex County income-restricted rental / is a duplicate.
 *   4. Email the reviewer the pending batch with Approve / Reject links
 *      (handled by src/app/api/review-listing/route.ts).
 *
 * Nothing goes live from here. Approval copies the row into `listings`.
 *
 * Env (real env wins over .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   required
 *   ANTHROPIC_API_KEY                                     required
 *   REVIEW_SECRET                                         signs approve/reject links
 *   SENDGRID_API_KEY, SENDGRID_FROM_EMAIL                 email the batch
 *   LINK_CHECK_TO_EMAIL                                   reviewer (default below)
 *   SITE_URL                                              default https://www.homereach.site
 *   MAX_NEW_PER_RUN                                       default 15
 *
 * The email always contains the whole outstanding queue (every row still
 * 'pending'), not just this run's finds, so a failed send never loses anything.
 *
 * Run locally:  npx tsx scripts/discover-listings.ts [--dry-run] [--email-only]
 *               --email-only skips crawling and just (re)sends the queue.
 * In CI:        .github/workflows/discover-listings.yml (Mondays)
 */
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import { extractListing, sanitize, MODEL } from '../src/lib/discovery/extract';
import { fetchHtml, htmlToText, SOURCES, type Candidate } from '../src/lib/discovery/sources';
import { reviewToken } from '../src/lib/discovery/review';

try {
  const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  /* no .env.local — rely on real env */
}

const DRY_RUN = process.argv.includes('--dry-run');
const EMAIL_ONLY = process.argv.includes('--email-only');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_NEW = Number(process.env.MAX_NEW_PER_RUN) || 15;
const SITE_URL = (process.env.SITE_URL || 'https://www.homereach.site').replace(/\/$/, '');

if (!url || !serviceKey) {
  console.error('\nMissing config. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n');
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\nMissing ANTHROPIC_API_KEY.\n');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const anthropic = new Anthropic();

/** Filled by discover() for the email footer. */
const runStats = { skipped: 0, leftover: 0 };

const normKey = (name: string, city: string) => `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}|${city.toLowerCase()}`;
const escapeHtml = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function main() {
  if (!EMAIL_ONLY) await discover();
  await emailQueue();
}

async function discover() {
  console.log(`Discovering new Essex County listings (${DRY_RUN ? 'dry run' : 'live'}, max ${MAX_NEW} new)...\n`);

  // What we already know about.
  const [{ data: existing, error: e1 }, { data: pending, error: e2 }] = await Promise.all([
    supabase.from('listings').select('name, address, city, source_url'),
    supabase.from('pending_listings').select('name, city, source_url'),
  ]);
  if (e1 || e2) {
    console.error('Failed to read the DB:', e1?.message ?? e2?.message, '\n(Did you run supabase/migrations/0006_pending_listings.sql?)');
    process.exit(1);
  }
  const knownUrls = new Set<string>();
  const knownNames = new Set<string>();
  for (const r of [...(existing ?? []), ...(pending ?? [])]) {
    if (r.source_url) knownUrls.add(r.source_url);
    knownNames.add(normKey(r.name, r.city));
  }
  console.log(`Known: ${existing?.length ?? 0} listings, ${pending?.length ?? 0} previously reviewed/queued.\n`);

  // Gather candidates.
  const candidates: Candidate[] = [];
  for (const src of SOURCES) {
    console.log(`Scanning ${src.name}...`);
    try {
      candidates.push(...(await src.find((s) => console.log(s))));
    } catch (err) {
      console.log(`  ${src.name}: failed — ${(err as Error).message}`);
    }
  }
  const fresh = candidates.filter((c) => !knownUrls.has(c.source_url) && !(c.city && knownNames.has(normKey(c.name, c.city))));
  console.log(`\n${candidates.length} candidates found, ${fresh.length} not seen before. Processing up to ${MAX_NEW}.\n`);

  const batch = fresh.slice(0, MAX_NEW);
  let queued = 0;
  let skipped = 0;
  let failed = 0;
  const usage = { input: 0, output: 0 };

  for (const c of batch) {
    const html = await fetchHtml(c.source_url);
    if (!html) {
      console.log(`  ✗ ${c.name} — page failed to load`);
      failed++;
      continue;
    }
    const nearby = (existing ?? []).filter((e) => !c.city || e.city === c.city).map((e) => ({ name: e.name, address: e.address, city: e.city }));
    let result;
    try {
      result = await extractListing(anthropic, { candidate: c, pageText: htmlToText(html), existing: nearby });
    } catch (err) {
      // Account-level problems (no credits, bad key) won't fix themselves by
      // moving on to the next listing — stop with a clear message instead.
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
        console.error(`\nAnthropic rejected the API key: ${err.message}\nCheck the ANTHROPIC_API_KEY secret.`);
        process.exit(1);
      }
      if (err instanceof Anthropic.BadRequestError && /credit balance/i.test(err.message)) {
        console.error('\nThe Anthropic account is out of credits. Add credits at https://console.anthropic.com/settings/billing and re-run.');
        process.exit(1);
      }
      if (err instanceof Anthropic.RateLimitError) {
        console.log(`  ✗ ${c.name} — rate limited, waiting 30s`);
        await new Promise((r) => setTimeout(r, 30000));
        failed++;
        continue;
      }
      console.log(`  ✗ ${c.name} — API error: ${(err as Error).message}`);
      failed++;
      continue;
    }
    usage.input += result.usage.input;
    usage.output += result.usage.output;
    if (!result.extraction) {
      console.log(`  ✗ ${c.name} — extraction ${result.error}`);
      failed++;
      continue;
    }
    const x = result.extraction;
    const clean = sanitize(x);

    let skipReason: string | null = null;
    if (!x.is_income_restricted_rental) skipReason = 'Not an income-restricted rental';
    else if (!clean.city) skipReason = `Not in Essex County (page says "${x.city || 'unknown'}")`;
    else if (x.duplicate_of) skipReason = `Duplicate of existing listing "${x.duplicate_of}"`;
    else if (knownNames.has(normKey(x.name, clean.city))) skipReason = `Already listed as "${x.name}"`;

    const row = {
      status: skipReason ? 'skipped' : 'pending',
      name: x.name.trim() || c.name,
      address: x.address,
      city: clean.city ?? c.city ?? '',
      program_type: x.program_type,
      ami_bands: clean.ami_bands,
      bedroom_types: clean.bedroom_types,
      rent: clean.rent,
      waitlist_open: x.waitlist_open,
      application_link: x.application_link,
      phone: x.phone,
      priority_groups: clean.priority_groups,
      accessible: x.accessible,
      source: c.source,
      source_url: c.source_url,
      last_verified: new Date().toISOString().slice(0, 10),
      confidence: x.confidence,
      notes: x.notes,
      evidence: x.evidence,
      duplicate_of: x.duplicate_of,
      skip_reason: skipReason,
    };

    if (skipReason) {
      skipped++;
      console.log(`  – ${row.name} (${row.city}) — skipped: ${skipReason}`);
    } else {
      console.log(`  + ${row.name} (${row.city}) — ${x.program_type ?? 'program unknown'} · AMI ${row.ami_bands.join('/') || '?'} · ${row.bedroom_types.join('/') || 'beds ?'} · ${x.confidence}`);
    }

    if (DRY_RUN) continue;
    const { error } = await supabase.from('pending_listings').insert(row);
    if (error) {
      console.log(`    ! could not save: ${error.message}`);
      failed++;
      continue;
    }
    if (!skipReason) {
      queued++;
      knownNames.add(normKey(row.name, row.city));
    }
  }

  const cost = (usage.input * 5 + usage.output * 25) / 1_000_000;
  runStats.skipped = skipped;
  runStats.leftover = fresh.length - batch.length;
  console.log(`\nResult: ${queued} queued for review · ${skipped} skipped · ${failed} failed · ${runStats.leftover} left for next week.`);
  console.log(`Claude usage: ${usage.input} in / ${usage.output} out tokens (${MODEL}, ≈$${cost.toFixed(2)}).`);

}

async function emailQueue() {
  const sgKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  const to = process.env.LINK_CHECK_TO_EMAIL || 'olivergolub@gmail.com';
  const secret = process.env.REVIEW_SECRET;

  const { data: queue, error } = await supabase
    .from('pending_listings')
    .select('*')
    .eq('status', 'pending')
    .order('discovered_at', { ascending: true });
  if (error) {
    console.error('Could not read the review queue:', error.message);
    process.exit(1);
  }
  const rows = queue ?? [];
  if (rows.length === 0) {
    console.log('\nNothing waiting for review — no email sent.');
    return;
  }
  console.log(`\n${rows.length} listing(s) waiting for review.`);
  if (DRY_RUN) return;
  if (!sgKey || !from) {
    console.log('(SendGrid not configured — see Supabase → pending_listings. Exiting 3 so the run is flagged.)');
    process.exit(3);
  }

  const link = (id: string, action: 'approve' | 'reject') =>
    secret ? `${SITE_URL}/api/review-listing?id=${id}&action=${action}&token=${reviewToken(secret, id, action)}` : null;

  const cards = rows
    .map((row) => {
      const approve = link(row.id, 'approve');
      const reject = link(row.id, 'reject');
      const facts = [
        ['Program', row.program_type],
        ['Address', row.address],
        ['AMI bands', (row.ami_bands as number[]).map((b) => `${b}%`).join(', ') || '—'],
        ['Bedrooms', (row.bedroom_types as string[]).join(', ') || '—'],
        ['Priority', (row.priority_groups as string[]).join(', ') || '—'],
        ['Rent', row.rent != null ? `$${row.rent}/mo` : 'contact for rent'],
        ['Waitlist open', row.waitlist_open ? 'yes' : 'not stated'],
        ['Phone', row.phone],
        ['Accessible', row.accessible ? 'yes' : 'not stated'],
      ]
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `<tr><td style="color:#666;padding:2px 10px 2px 0">${k}</td><td>${escapeHtml(v)}</td></tr>`)
        .join('');
      return `
      <div style="border:1px solid #ddd;border-radius:8px;padding:14px;margin:0 0 14px">
        <h3 style="margin:0 0 4px">${escapeHtml(row.name)} <span style="font-weight:normal;color:#666">— ${escapeHtml(row.city)}</span></h3>
        <div style="font-size:13px;color:#666;margin-bottom:8px">${escapeHtml(row.source)} · confidence: ${escapeHtml(row.confidence)} · found ${new Date(row.discovered_at).toLocaleDateString('en-US')} · <a href="${escapeHtml(row.source_url)}">source page</a></div>
        <table style="font-size:14px;border-collapse:collapse">${facts}</table>
        <p style="font-size:13px;margin:8px 0"><em>${escapeHtml(row.notes)}</em></p>
        <p style="font-size:12px;color:#555;margin:0 0 10px">Evidence: “${escapeHtml(row.evidence)}”</p>
        ${
          approve && reject
            ? `<a href="${approve}" style="background:#3D6B4C;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;margin-right:8px">Approve — publish</a>
               <a href="${reject}" style="background:#eee;color:#333;padding:8px 14px;border-radius:6px;text-decoration:none">Reject</a>`
            : `<span style="font-size:12px;color:#98493F">Set REVIEW_SECRET to get one-click approve/reject links.</span>`
        }
      </div>`;
    })
    .join('');

  const html = `
    <h2>Home Reach — ${rows.length} listing${rows.length === 1 ? '' : 's'} waiting for review</h2>
    <p>Found by the weekly scan of ${SOURCES.map((s) => s.name).join(' and ')}. Nothing is on the site yet — approving publishes it immediately; rejecting hides it for good. Check the source page before approving.</p>
    ${cards}
    <p style="color:#555;font-size:13px">${runStats.skipped} other new pages were skipped automatically this run (not Essex County, not income-restricted, or duplicates). ${runStats.leftover} more candidates are queued for next week.</p>`;

  sgMail.setApiKey(sgKey);
  try {
    await sgMail.send({ to, from, subject: `Home Reach: ${rows.length} listing${rows.length === 1 ? '' : 's'} to review`, html });
  } catch (err) {
    const code = (err as { code?: number }).code;
    console.error(`\nSendGrid rejected the email (${code ?? 'error'}). ${code === 401 || code === 403 ? 'The SENDGRID_API_KEY secret is invalid or revoked — create a new key in SendGrid and update the secret.' : (err as Error).message}`);
    console.error('The queue is safe in Supabase → pending_listings; re-run with --email-only after fixing.');
    process.exit(3);
  }
  console.log(`Emailed ${to}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
