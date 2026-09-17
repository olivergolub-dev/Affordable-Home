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
 * Run locally:  npx tsx scripts/discover-listings.ts [--dry-run]
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

const normKey = (name: string, city: string) => `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}|${city.toLowerCase()}`;
const escapeHtml = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function main() {
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
  const queued: { id: string; row: Record<string, unknown>; extraction: { confidence: string; notes: string; evidence: string } }[] = [];
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
    const result = await extractListing(anthropic, { candidate: c, pageText: htmlToText(html), existing: nearby });
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
    const { data: inserted, error } = await supabase.from('pending_listings').insert(row).select('id').single();
    if (error) {
      console.log(`    ! could not save: ${error.message}`);
      failed++;
      continue;
    }
    if (!skipReason) {
      queued.push({ id: inserted.id, row, extraction: { confidence: x.confidence, notes: x.notes, evidence: x.evidence } });
      knownNames.add(normKey(row.name, row.city));
    }
  }

  const cost = (usage.input * 5 + usage.output * 25) / 1_000_000;
  console.log(`\nResult: ${queued.length} queued for review · ${skipped} skipped · ${failed} failed · ${fresh.length - batch.length} left for next week.`);
  console.log(`Claude usage: ${usage.input} in / ${usage.output} out tokens (${MODEL}, ≈$${cost.toFixed(2)}).`);

  // Tell the reviewer.
  const sgKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  const to = process.env.LINK_CHECK_TO_EMAIL || 'olivergolub@gmail.com';
  const secret = process.env.REVIEW_SECRET;

  if (queued.length === 0) {
    console.log('\nNothing new to review — no email sent.');
    return;
  }
  if (!sgKey || !from) {
    console.log('\n(SendGrid not configured — the pending rows are in Supabase → pending_listings. Exiting 3 so the run is flagged.)');
    process.exit(3);
  }

  const link = (id: string, action: 'approve' | 'reject') =>
    secret ? `${SITE_URL}/api/review-listing?id=${id}&action=${action}&token=${reviewToken(secret, id, action)}` : null;

  const cards = queued
    .map(({ id, row, extraction }) => {
      const approve = link(id, 'approve');
      const reject = link(id, 'reject');
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
        <div style="font-size:13px;color:#666;margin-bottom:8px">${escapeHtml(row.source)} · confidence: ${escapeHtml(extraction.confidence)} · <a href="${escapeHtml(row.source_url)}">source page</a></div>
        <table style="font-size:14px;border-collapse:collapse">${facts}</table>
        <p style="font-size:13px;margin:8px 0"><em>${escapeHtml(extraction.notes)}</em></p>
        <p style="font-size:12px;color:#555;margin:0 0 10px">Evidence: “${escapeHtml(extraction.evidence)}”</p>
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
    <h2>Home Reach — ${queued.length} new listing${queued.length === 1 ? '' : 's'} to review</h2>
    <p>Found this week from ${SOURCES.map((s) => s.name).join(' and ')}. Nothing is on the site yet — approving publishes it immediately; rejecting hides it for good. Check the source page before approving.</p>
    ${cards}
    <p style="color:#555;font-size:13px">${skipped} other new pages were skipped automatically (not Essex County, not income-restricted, or duplicates). ${fresh.length - batch.length} more candidates are queued for next week.</p>`;

  sgMail.setApiKey(sgKey);
  await sgMail.send({ to, from, subject: `Home Reach: ${queued.length} new listing${queued.length === 1 ? '' : 's'} to review`, html });
  console.log(`\nEmailed ${to}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
