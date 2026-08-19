import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Queues a 60-day outcome-survey follow-up for someone who explicitly opted in
 * on wizard step 7.
 *
 * Goes through a route handler rather than inserting from the browser so the
 * open endpoint can be rate limited — without it, anyone could enqueue
 * thousands of addresses for us to email later.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOLLOWUP_DAYS = 60;

// Best-effort per-IP limit, same shape as /api/send-results: in-memory, resets
// on cold start, not a substitute for an edge-level limiter.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const dueAt = new Date(Date.now() + FOLLOWUP_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from('followup_queue')
      .insert({ email, due_at: dueAt, source: 'wizard_optin' });

    // 23505 = unique violation: they're already queued, which is a success
    // from the user's point of view, not an error to surface.
    if (error && error.code !== '23505') {
      console.error('Follow-up opt-in failed:', error.message);
      return NextResponse.json({ error: 'Could not save your preference' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
