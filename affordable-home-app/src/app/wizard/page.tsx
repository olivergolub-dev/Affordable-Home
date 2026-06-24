"use client";

import { useRouter } from "next/navigation";

const options = [
  { value: '1', label: '1 person' },
  { value: '2', label: '2 people' },
  { value: '3', label: '3 people' },
  { value: '4', label: '4 people' },
  { value: '5', label: '5 people' },
  { value: '6+', label: '6+ people' },
];

export default function WizardStep1() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E40AF' }}>Step 1 of 7</span>
            <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>Exit</a>
          </div>
          <div style={{ height: 2, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 48 }}>
            <div style={{ width: '14.28%', height: '100%', backgroundColor: '#1E40AF', borderRadius: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 16, fontWeight: 300 }}>
            How many people are in your household?
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            This helps us match you with the most accurate housing programs and listings.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => router.push('/wizard/step2')}
              style={{
                backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                padding: '24px 20px', textAlign: 'left', fontSize: 18, fontWeight: 500,
                color: '#0D1117', cursor: 'pointer', transition: 'border-color 0.15s',
                fontFamily: 'var(--font-dm-serif)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#1E40AF')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
