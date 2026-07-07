import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { createClient } from '@supabase/supabase-js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, answers } = await req.json();
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

    const { data: listings } = await supabase.from('listings').select('*');
    const matches = (listings || []).slice(0, 10);

    const listingCards = matches.map((l: any) => `
      <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <p style="font-family:Georgia,serif;font-size:18px;color:#0D1117;margin:0 0 4px 0;">${l.name}</p>
            <p style="font-size:13px;color:#64748B;margin:0 0 8px 0;">${l.city || ''} &nbsp;·&nbsp; ${l.ami_band || ''} &nbsp;·&nbsp; ${l.program_type || ''}</p>
            <p style="font-size:14px;color:#334155;margin:0;">${l.rent ? `$${l.rent}/mo` : 'Contact for rent'}</p>
          </div>
          <div style="text-align:right;">
            <span style="background:${l.wailist_open === false || l.wailist_open === 'false' ? '#EFF6FF' : '#F0FDF4'};color:${l.wailist_open === false || l.wailist_open === 'false' ? '#1E40AF' : '#166534'};border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;">
              ${l.wailist_open === false || l.wailist_open === 'false' ? 'Open' : 'Waitlist'}
            </span>
            ${l.application_link ? `<br/><a href="${l.application_link}" style="display:inline-block;margin-top:10px;background:#1E40AF;color:white;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">Apply</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8FAFC;">
        <div style="background:#0A1628;padding:32px 40px;border-radius:12px 12px 0 0;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="width:32px;height:32px;background:#1E40AF;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="color:white;font-size:16px;">⌂</span>
            </div>
            <span style="color:#FFFFFF;font-weight:700;font-size:16px;">Home Reach</span>
          </div>
          <h1 style="color:#FFFFFF;font-family:Georgia,serif;font-size:28px;margin:16px 0 8px 0;">Your housing matches</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;margin:0;">Essex County, NJ · Free, Always</p>
        </div>
        <div style="padding:32px 40px;background:#F8FAFC;">
          <p style="color:#334155;font-size:15px;margin:0 0 24px 0;">Based on your answers, here are affordable housing options in Essex County that may fit your household.</p>
          ${listingCards}
          <div style="margin-top:32px;text-align:center;">
            <a href="https://homereach.site/results" style="background:#1E40AF;color:white;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">View all listings</a>
          </div>
          <p style="color:#94A3B8;font-size:12px;margin-top:32px;text-align:center;">Home Reach is a free, independent resource. We never store your email after sending.</p>
        </div>
      </div>
    `;

    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: 'Your Essex County housing matches — Home Reach',
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
