import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { fetchListings } from '@/lib/listings';
import { matchListings } from '@/lib/eligibility';
import type { Listing, WizardAnswers } from '@/lib/types';

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LISTINGS_IN_EMAIL = 10;

// Best-effort per-IP rate limit. In-memory, so it resets on cold start and
// doesn't share state across serverless instances — good enough to blunt
// casual abuse of this open endpoint, not a substitute for an edge/WAF-level
// limiter (e.g. Vercel Firewall, Upstash) if traffic grows.
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

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/** Only http(s) links are safe to render as an href in the email. */
function safeApplicationLink(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function listingCardHtml(l: Listing): string {
  const link = safeApplicationLink(l.application_link);
  const openBg = l.waitlist_open ? '#EFF6FF' : '#F0FDF4';
  const openText = l.waitlist_open ? '#1E40AF' : '#166534';
  const openLabel = l.waitlist_open ? 'Open' : 'Waitlist';
  return `
    <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <p style="font-family:Georgia,serif;font-size:18px;color:#0D1117;margin:0 0 4px 0;">${escapeHtml(l.name)}</p>
          <p style="font-size:13px;color:#64748B;margin:0 0 8px 0;">${escapeHtml(l.city)} &nbsp;&middot;&nbsp; ${escapeHtml(l.ami_bands.map((b) => `${b}%`).join('/'))} &nbsp;&middot;&nbsp; ${escapeHtml(l.program_type ?? '')}</p>
          <p style="font-size:14px;color:#334155;margin:0;">${l.rent ? `$${escapeHtml(l.rent)}/mo` : 'Contact for rent'}</p>
        </div>
        <div style="text-align:right;">
          <span style="background:${openBg};color:${openText};border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;">${openLabel}</span>
          ${link ? `<br/><a href="${escapeHtml(link)}" style="display:inline-block;margin-top:10px;background:#1E40AF;color:white;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">Apply</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const answers = (body?.answers ?? {}) as Partial<WizardAnswers>;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.error('Email not sent: SENDGRID_API_KEY / SENDGRID_FROM_EMAIL not configured');
      return NextResponse.json({ error: 'Email delivery is not configured' }, { status: 500 });
    }

    const { listings } = await fetchListings();
    const fullAnswers: WizardAnswers = {
      householdSize: answers.householdSize ?? null,
      income: answers.income ?? null,
      bedrooms: answers.bedrooms ?? null,
      towns: answers.towns ?? [],
      voucher: answers.voucher ?? null,
      priorityGroups: answers.priorityGroups ?? [],
      email: null,
    };
    const matches = matchListings(listings, fullAnswers).slice(0, MAX_LISTINGS_IN_EMAIL);

    const listingCards = matches.map((m) => listingCardHtml(m.listing)).join('');
    const bodyHtml = matches.length
      ? listingCards
      : `<p style="color:#64748B;font-size:14px;text-align:center;padding:24px 0;">No matches yet for your household — check homereach.site/results for all current listings.</p>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8FAFC;">
        <div style="background:#0A1628;padding:32px 40px;border-radius:12px 12px 0 0;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:32px;height:32px;background:#1E40AF;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="color:white;font-size:16px;">&#8962;</span>
            </div>
            <span style="color:#FFFFFF;font-weight:700;font-size:16px;">Home Reach</span>
          </div>
          <h1 style="color:#FFFFFF;font-family:Georgia,serif;font-size:28px;margin:16px 0 8px 0;">Your housing matches</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;margin:0;">Essex County, NJ &middot; Free, Always</p>
        </div>
        <div style="padding:32px 40px;background:#F8FAFC;">
          <p style="color:#334155;font-size:15px;margin:0 0 24px 0;">Based on your answers, here are affordable housing options in Essex County that may fit your household.</p>
          ${bodyHtml}
          <div style="margin-top:32px;text-align:center;">
            <a href="https://homereach.site/results" style="background:#1E40AF;color:white;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">View all listings</a>
          </div>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px;text-align:center;">Home Reach is a free, independent resource. We never store your email after sending.</p>
        </div>
      </div>
    `;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Your Essex County housing matches — Home Reach',
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong sending your results' }, { status: 500 });
  }
}
