'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setEmail } from '@/lib/wizardStore';
import { analytics } from '@/lib/analytics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WizardStep7() {
  const router = useRouter();
  const [email, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  // Opt-in to one follow-up in ~2 months asking how the search actually went.
  // Off by default — this is the only thing that lets us keep an address, so
  // it has to be a deliberate choice, never a pre-ticked one.
  const [followUp, setFollowUp] = useState(false);

  useEffect(() => {
    if (readAnswers().householdSize == null) router.replace('/wizard');
  }, [router]);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    const valid = EMAIL_RE.test(trimmed);
    posthog.capture('eligibility_wizard_completed', { provided_email: valid, step: 7 });

    if (valid) {
      // Per privacy policy: we never attach the email to the analytics
      // identity. It's used once, server-side, to send this one message.
      setEmail(trimmed);
      setSending(true);
      try {
        await fetch('/api/send-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed, answers: readAnswers(), distinctId: analytics.getDistinctId() }),
        });
      } catch (e) {
        console.error('Email send failed', e);
      }

      if (followUp) {
        posthog.capture('followup_opted_in', { step: 7 });
        try {
          await fetch('/api/followup-optin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmed }),
          });
        } catch (e) {
          console.error('Follow-up opt-in failed', e);
        }
      }
      setSending(false);
    }
    router.push('/results');
  };

  return (
    <WizardShell step={7} backHref="/wizard/step6">
      <StepTitle>Want your results emailed to you?</StepTitle>
      <StepSubtitle>Optional. We send your results once and don&apos;t keep your address &mdash; unless you ask us to check in later.</StepSubtitle>
      <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
        Email address
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmailInput(e.target.value)}
        aria-describedby="email-help"
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '20px 24px', fontSize: 18, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
      <p id="email-help" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>We never sell your email, and we only keep it if you tick the box below.</p>

      <label
        htmlFor="followup"
        style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '16px 18px', marginBottom: 28 }}
      >
        <input
          id="followup"
          type="checkbox"
          checked={followUp}
          onChange={(e) => setFollowUp(e.target.checked)}
          style={{ width: 18, height: 18, marginTop: 2, accentColor: '#1E40AF', flexShrink: 0, cursor: 'pointer' }}
        />
        <span>
          <span style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 3 }}>
            Check in with me in about two months
          </span>
          <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            One email asking how your housing search went. It helps us show whether this site actually works. We keep your address only until that message is sent, then delete it.
          </span>
        </span>
      </label>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, marginBottom: 28 }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 14 }}>
          Want to keep your results? Create a free account to save them, bookmark listings, and get alerts when new matches appear.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            href="/login?mode=signup"
            onClick={() => posthog.capture('account_cta_clicked', { source: 'wizard_step7', action: 'signup' })}
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Create account
          </Link>
          <Link
            href="/login"
            onClick={() => posthog.capture('account_cta_clicked', { source: 'wizard_step7', action: 'login' })}
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          >
            Log in
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <ContinueButton onClick={handleSubmit} disabled={sending}>
          {sending ? 'Sending...' : 'See my matches'}
        </ContinueButton>
      </div>
      <button
        onClick={() => { posthog.capture('eligibility_wizard_completed', { provided_email: false, step: 7 }); router.push('/results'); }}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 14, cursor: 'pointer', width: '100%', padding: '8px' }}
      >
        Skip and see results
      </button>
    </WizardShell>
  );
}
