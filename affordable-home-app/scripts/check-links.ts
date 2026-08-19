/**
 * Weekly link-health check for every listing's source_url.
 *
 *   - Reads all listings from Supabase.
 *   - Fetches each source_url; flags BROKEN (4xx/5xx/timeout/error) and REVIEW
 *     (loads but no longer names the property).
 *   - Prints a report to the console.
 *   - Writes link_ok + last_checked to the DB (needs the service_role key and
 *     migration 0003_link_health.sql).
 *   - Emails the flagged listings if SendGrid is configured.
 *
 * It never deletes anything — a human decides what to remove.
 *
 * Run locally:  npx tsx scripts/check-links.ts
 * In CI:        .github/workflows/check-links.yml (weekly)
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import { checkLinks, severityOf, type LinkCheckResult } from '../src/lib/linkCheck';

// Load .env.local without a dependency (same approach as scripts/ingest.ts).
// Real env (e.g. CI secrets) always wins over the file.
try {
  const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  /* no .env.local — rely on real env */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const readKey = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !readKey) {
  console.error('\nMissing config. Need NEXT_PUBLIC_SUPABASE_URL and a Supabase key in .env.local (or the environment).\n');
  process.exit(1);
}

const supabase = createClient(url, readKey, { auth: { persistSession: false } });

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

async function main() {
  const { data, error } = await supabase.from('listings').select('id, name, city, source_url');
  if (error) {
    console.error('Failed to read listings:', error.message);
    process.exit(1);
  }
  const listings = data ?? [];
  console.log(`Checking ${listings.length} listing links...\n`);

  const results = await checkLinks(listings, { concurrency: 8, timeoutMs: 15000 });
  // Group by how loudly to surface each result. Only "action" (404/gone) is a
  // real remove-me signal; "info" (403/blocked, 5xx, timeouts) is usually just
  // anti-bot or transient and needs no action.
  const action = results.filter((r) => severityOf(r.category) === 'action');
  const review = results.filter((r) => severityOf(r.category) === 'review');
  const info = results.filter((r) => severityOf(r.category) === 'info');
  const okCount = results.filter((r) => severityOf(r.category) === 'ok').length;

  console.log(`Result: ${okCount} OK · ${action.length} likely GONE · ${review.length} to REVIEW · ${info.length} couldn't-verify (of ${results.length}).\n`);
  for (const r of action) console.log(`  GONE     ${r.name} (${r.city})  [${r.reason}]  ${r.source_url ?? ''}`);
  for (const r of review) console.log(`  REVIEW   ${r.name} (${r.city})  [${r.reason}]  ${r.source_url ?? ''}`);
  for (const r of info) console.log(`  (info)   ${r.name} (${r.city})  [${r.reason}]`);

  // Write status back (best-effort). Needs service_role + migration 0003.
  if (serviceKey) {
    const now = new Date().toISOString();
    const updates = await Promise.all(
      results.map((r) => supabase.from('listings').update({ link_ok: r.ok, last_checked: now }).eq('id', r.id)),
    );
    const writeErr = updates.find((u) => u.error)?.error;
    if (writeErr) {
      console.warn(`\nCould not write status to the DB (run supabase/migrations/0003_link_health.sql?): ${writeErr.message}`);
    } else {
      console.log(`\nWrote link_ok/last_checked on ${results.length} rows.`);
    }
  } else {
    console.log('\n(No SUPABASE_SERVICE_ROLE_KEY — skipped writing status to the DB.)');
  }

  // Email only when there's something a human should look at (gone or review).
  // "info" (blocked/transient) is left out of the email to avoid crying wolf.
  const sgKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  const to = process.env.LINK_CHECK_TO_EMAIL || 'olivergolub@gmail.com';
  const worthEmailing = action.length > 0 || review.length > 0;

  if (sgKey && from && worthEmailing) {
    sgMail.setApiKey(sgKey);
    const row = (r: LinkCheckResult, tag: string) =>
      `<tr><td>${tag}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.city)}</td><td>${escapeHtml(r.reason)}</td><td><a href="${escapeHtml(r.source_url ?? '')}">open</a></td></tr>`;
    const html = `
      <h2>Home Reach — weekly link check</h2>
      <p><strong>${action.length}</strong> likely gone · <strong>${review.length}</strong> to review · ${info.length} couldn't verify · ${okCount} OK (of ${results.length}).</p>
      ${action.length ? `<h3>Likely gone — consider removing</h3>
      <table cellpadding="6" style="border-collapse:collapse" border="1">
        <tr><th>Type</th><th>Listing</th><th>Town</th><th>Reason</th><th>URL</th></tr>
        ${action.map((r) => row(r, 'GONE')).join('')}
      </table>` : ''}
      ${review.length ? `<h3>Review — page changed</h3>
      <table cellpadding="6" style="border-collapse:collapse" border="1">
        <tr><th>Type</th><th>Listing</th><th>Town</th><th>Reason</th><th>URL</th></tr>
        ${review.map((r) => row(r, 'REVIEW')).join('')}
      </table>` : ''}
      <p style="color:#555;font-size:13px;margin-top:16px;">To remove one: delete its entry in scripts/seed-listings.ts, then run <code>npx tsx scripts/ingest.ts</code> (or set it aside in the DB). REVIEW = the page still loads but no longer names the property (often just a generic directory page) — check before removing. The ${info.length} "couldn't verify" are usually sites that block bots (403) or a temporary error — no action needed.</p>`;
    await sgMail.send({ to, from, subject: `Home Reach link check: ${action.length} likely gone, ${review.length} to review`, html });
    console.log(`\nEmailed the report to ${to}.`);
  } else if (worthEmailing) {
    console.log('\n(SendGrid not configured — report is above; no email sent.)');
  } else {
    console.log('\nNothing needs action — no email sent.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
