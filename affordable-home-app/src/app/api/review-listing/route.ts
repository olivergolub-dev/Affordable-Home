import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyReviewToken, type ReviewAction } from '@/lib/discovery/review';

/**
 * One-click approve / reject for listings found by the weekly discovery job.
 * Links are minted by scripts/discover-listings.ts and signed with
 * REVIEW_SECRET, so only the reviewer who receives the email can act on them.
 *
 * Approve copies the pending row into `listings` (live immediately).
 * Reject just marks it, so the job never surfaces that page again.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY and REVIEW_SECRET as server-side env vars
 * (never NEXT_PUBLIC_). Without them the route refuses politely.
 */

export const dynamic = 'force-dynamic';

const LISTING_COLUMNS = [
  'name', 'address', 'city', 'program_type', 'ami_bands', 'bedroom_types', 'rent', 'waitlist_open',
  'application_link', 'phone', 'priority_groups', 'accessible', 'source', 'source_url', 'last_verified',
] as const;

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} — Home Reach</title>
<style>body{font-family:system-ui,sans-serif;max-width:560px;margin:60px auto;padding:0 20px;color:#222;line-height:1.5}h1{font-size:22px}a{color:#3D6B4C}</style></head>
<body><h1>${title}</h1>${body}<p style="margin-top:32px;font-size:13px;color:#666"><a href="/">Home Reach</a></p></body></html>`;
  return new NextResponse(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export async function GET(req: NextRequest) {
  const secret = process.env.REVIEW_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret || !serviceKey || !url) {
    return page('Review links are not set up', '<p>REVIEW_SECRET and SUPABASE_SERVICE_ROLE_KEY need to be set on the server.</p>', 503);
  }

  const id = req.nextUrl.searchParams.get('id') ?? '';
  const action = req.nextUrl.searchParams.get('action') as ReviewAction | null;
  const token = req.nextUrl.searchParams.get('token') ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id) || (action !== 'approve' && action !== 'reject') || !verifyReviewToken(secret, id, action, token)) {
    return page('Invalid link', '<p>This review link is missing something or has been tampered with.</p>', 400);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: row, error } = await admin.from('pending_listings').select('*').eq('id', id).maybeSingle();
  if (error) return page('Something went wrong', `<p>${escape(error.message)}</p>`, 500);
  if (!row) return page('Not found', '<p>That pending listing no longer exists.</p>', 404);

  const label = `<strong>${escape(row.name)}</strong> (${escape(row.city)})`;
  if (row.status !== 'pending') {
    return page('Already reviewed', `<p>${label} was already marked <strong>${escape(row.status)}</strong>${row.reviewed_at ? ` on ${new Date(row.reviewed_at).toLocaleDateString('en-US')}` : ''}.</p>`);
  }

  const now = new Date().toISOString();
  if (action === 'reject') {
    const { error: e } = await admin.from('pending_listings').update({ status: 'rejected', reviewed_at: now }).eq('id', id);
    if (e) return page('Something went wrong', `<p>${escape(e.message)}</p>`, 500);
    return page('Rejected', `<p>${label} will not be published and won't be suggested again.</p>`);
  }

  // Approve: copy into listings (upsert on name+city so a re-approve can't duplicate).
  const listing = Object.fromEntries(LISTING_COLUMNS.map((c) => [c, row[c]]));
  const { data: inserted, error: insErr } = await admin
    .from('listings')
    .upsert(listing, { onConflict: 'name,city' })
    .select('id')
    .single();
  if (insErr) return page('Could not publish', `<p>${escape(insErr.message)}</p>`, 500);

  const { error: updErr } = await admin
    .from('pending_listings')
    .update({ status: 'approved', reviewed_at: now, listing_id: inserted.id })
    .eq('id', id);
  if (updErr) return page('Published, but…', `<p>${label} is live, but marking it reviewed failed: ${escape(updErr.message)}</p>`);

  return page('Published', `<p>${label} is now live on <a href="/results">the results page</a>.</p><p style="font-size:14px;color:#555">To edit any field later, change it in Supabase → listings, or add it to scripts/seed-listings.ts.</p>`);
}

function escape(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
