"use client";
import { useRouter } from "next/navigation";
import posthog from 'posthog-js';

const options = ['Studio', '1 bedroom', '2 bedrooms', '3+ bedrooms'];

export default function WizardStep3() {
  const router = useRouter();
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
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>[ 03 / 07 ]</span>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Exit</a>
        </div>
      </header>
      <div style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: '42.86%', height: '100%', background: 'linear-gradient(to right, #1E40AF, #60A5FA)' }} />
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
        <button onClick={() => router.push('/wizard/step2')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 48 }}>← Back</button>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', marginBottom: 20 }}>[ 03 ] &mdash;&mdash; STEP 3 OF 7</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.05, color: '#FFFFFF', marginBottom: 16, fontWeight: 300 }}>
          How many bedrooms do you need?
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 48 }}>
          Select the option that best fits your household.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { sessionStorage.setItem('wizard_household_size', JSON.stringify([opt])); posthog.capture('wizard_bedrooms_selected', { bedrooms: opt, step: 3 }); router.push('/wizard/step4'); }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '20px 24px', textAlign: 'left', fontSize: 18, color: '#FFFFFF', cursor: 'pointer', fontFamily: 'var(--font-dm-serif)', fontWeight: 300 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1E40AF'; e.currentTarget.style.borderColor = '#1E40AF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
