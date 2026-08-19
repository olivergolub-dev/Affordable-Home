/**
 * Sends the 60-day outcome-survey follow-up.
 *
 * Two sources feed one queue:
 *   1. Wizard opt-ins — rows already in followup_queue (source 'wizard_optin').
 *   2. Account holders — enqueued here once their account is 60+ days old
 *      (source 'account'). The unique index on email means someone who both
 *      opted in and has an account is only ever queued, and mailed, once.
 *
 * After each send the row's `email` is set to NULL and `sent_at` stamped, so
 * we keep the count but not the address — which is what the privacy copy
 * promises.
 *
 * Run:   npx tsx scripts/send-followups.ts            (sends)
 *        npx tsx scripts/send-followups.ts --dry-run  (shows what would send)
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY (reads the queue and the account list) and
 * SENDGRID_API_KEY + SENDGRID_FROM_EMAIL to actually send.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Load .env.local without a dependency (same approach as the other scripts).
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
const FOLLOWUP_DAYS = 60;
const SITE_URL = 'https://homereach.site';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('\nMissing config. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

/** Mask an address for logs — we never print a full address. */
function mask(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}***@${domain ?? '?'}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function emailHtml(): string {
  const link = `${SITE_URL}/survey?src=email_60d`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0A1628;padding:28px 32px;border-radius:12px 12px 0 0;">
        <span style="color:#FFFFFF;font-weight:700;font-size:16px;">Home Reach</span>
        <h1 style="color:#FFFFFF;font-family:Georgia,serif;font-size:24px;margin:14px 0 0;">How did your housing search go?</h1>
      </div>
      <div style="padding:28px 32px;background:#F8FAFC;border-radius:0 0 12px 12px;">
        <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">
          You used Home Reach a couple of months ago to look for affordable housing in Essex County.
          We&rsquo;d like to know whether it actually helped &mdash; it&rsquo;s one question, and your answer is anonymous.
        </p>
        <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Knowing how many people actually get housed is how we show this tool works, and where it doesn&rsquo;t.
        </p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${escapeHtml(link)}" style="background:#1E40AF;color:white;padding:14px 30px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">Answer one question</a>
        </div>
        <p style="color:#94A3B8;font-size:12px;line-height:1.6;margin:0;text-align:center;">
          This is the only follow-up we send. Your email address is deleted now that this message has gone out.
        </p>
      </div>
    </div>`;
}

/** Queue account holders whose account is old enough and who aren't queued yet. */
async function enqueueAccountHolders(): Promise<number> {
  const cutoff = Date.now() - FOLLOWUP_DAYS * 24 * 60 * 60 * 1000;
  let queued = 0;
  let page = 1;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.warn(`Could not list account holders: ${error.message}`);
      return queued;
    }
    const users = data?.users ?? [];
    if (users.length === 0) break;

    for (const user of users) {
      if (!user.email || !user.created_at) continue;
      if (new Date(user.created_at).getTime() > cutoff) continue; // too new

      const dueAt = new Date(new Date(user.created_at).getTime() + FOLLOWUP_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { error: insErr } = await admin
        .from('followup_queue')
        .insert({ email: user.email.toLowerCase(), due_at: dueAt, source: 'account' });
      // 23505 = already queued (opted in earlier, or queued on a previous run).
      if (!insErr) queued++;
      else if (insErr.code !== '23505') console.warn(`  enqueue failed for ${mask(user.email)}: ${insErr.message}`);
    }

    if (users.length < 200) break;
    page++;
  }
  return queued;
}

async function main() {
  console.log(DRY_RUN ? 'DRY RUN — nothing will be sent.\n' : '');

  const queued = await enqueueAccountHolders();
  if (queued > 0) console.log(`Queued ${queued} account holder(s) whose account is ${FOLLOWUP_DAYS}+ days old.`);

  const { data: due, error } = await admin
    .from('followup_queue')
    .select('id, email, source')
    .is('sent_at', null)
    .not('email', 'is', null)
    .lte('due_at', new Date().toISOString());

  if (error) {
    console.error(`Could not read the queue: ${error.message}`);
    process.exit(1);
  }

  const rows = due ?? [];
  console.log(`${rows.length} follow-up(s) due.`);
  if (rows.length === 0) return;

  const sgKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;

  if (DRY_RUN) {
    for (const r of rows) console.log(`  would send to ${mask(r.email as string)} (${r.source})`);
    return;
  }
  if (!sgKey || !from) {
    console.error('\nSENDGRID_API_KEY / SENDGRID_FROM_EMAIL not set — cannot send. (Try --dry-run.)');
    process.exit(1);
  }

  sgMail.setApiKey(sgKey);
  const html = emailHtml();
  let sent = 0;

  for (const row of rows) {
    const email = row.email as string;
    try {
      await sgMail.send({ to: email, from, subject: 'How did your housing search go?', html });
      // Drop the address immediately; keep the row as an anonymous record.
      const { error: updErr } = await admin
        .from('followup_queue')
        .update({ sent_at: new Date().toISOString(), email: null })
        .eq('id', row.id);
      if (updErr) console.warn(`  sent to ${mask(email)} but could not mark it: ${updErr.message}`);
      sent++;
    } catch (err) {
      console.warn(`  failed for ${mask(email)}: ${err instanceof Error ? err.message : 'error'}`);
    }
  }

  console.log(`\nSent ${sent} of ${rows.length}. Addresses deleted after sending.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
