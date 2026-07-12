'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setEmail } from '@/lib/wizardStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WizardStep7() {
  const router = useRouter();
  const [email, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);

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
          body: JSON.stringify({ email: trimmed, answers: readAnswers() }),
        });
      } catch (e) {
        console.error('Email send failed', e);
      }
      setSending(false);
    }
    router.push('/results');
  };

  return (
    <WizardShell step={7} backHref="/wizard/step6">
      <StepTitle>Want your results emailed to you?</StepTitle>
      <StepSubtitle>Optional. We send your results once and never store your address.</StepSubtitle>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmailInput(e.target.value)}
        aria-label="Email address"
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '20px 24px', fontSize: 18, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>We never sell or store your email.</p>
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
