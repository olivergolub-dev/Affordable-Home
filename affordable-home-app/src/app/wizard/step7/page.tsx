"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import posthog from 'posthog-js';

export default function WizardStep7() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    posthog.capture('eligibility_wizard_completed', { provided_email: !!email, step: 7 });
    if (email) {
      posthog.identify(email, { email });
      sessionStorage.setItem('wizard_email', email);
      setSending(true);
      try {
        const parseArray = (key: string): string[] => {
          try { return JSON.parse(sessionStorage.getItem(key) || '[]'); }
          catch { return []; }
        };
        const answers = {
          income: sessionStorage.getItem('wizard_income') || '',
          householdSize: sessionStorage.getItem('wizard_household_size') || '',
          bedrooms: sessionStorage.getItem('wizard_bedrooms') || '',
          towns: parseArray('wizard_towns'),
          voucher: sessionStorage.getItem('wizard_voucher') || '',
          circumstances: parseArray('wizard_circumstances'),
        };
        await fetch('/api/send-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, answers }),
        });
      } catch (e) {
        console.error('Email send failed', e);
      }
      setSending(false);
    }
    router.push('/results');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A1628', color: '#FFFFFF' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 clamp(16px,4vw,40px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>Home Reach</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>[ 07 / 07 ]</span>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Exit</a>
        </div>
      </header>
      <div style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #1E40AF, #60A5FA)' }} />
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
        <button onClick={() => router.push('/wizard/step6')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 48 }}>← Back</button>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', marginBottom: 20 }}>[ 07 ] &mdash;&mdash; STEP 7 OF 7</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.05, color: '#FFFFFF', marginBottom: 16, fontWeight: 300 }}>
          Want your results emailed to you?
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 48 }}>
          Optional. We send your results once and never store your address.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '20px 24px', fontSize: 18, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}
          onFocus={e => e.currentTarget.style.borderColor = '#1E40AF'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>We never sell or store your email.</p>
        <button
          onClick={handleSubmit}
          disabled={sending}
          style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 8, padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: sending ? 'wait' : 'pointer', width: '100%', marginBottom: 12, opacity: sending ? 0.7 : 1 }}
        >
          {sending ? 'Sending...' : 'See my matches'}
        </button>
        <button
          onClick={() => { posthog.capture('eligibility_wizard_completed', { provided_email: false, step: 7 }); router.push('/results'); }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 14, cursor: 'pointer', width: '100%', padding: '8px' }}
        >
          Skip and see results
        </button>
      </div>
    </div>
  );
}
