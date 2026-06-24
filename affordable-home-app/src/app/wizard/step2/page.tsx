"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WizardStep2() {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px, 7vw, 80px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => router.push('/wizard')} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Back</button>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E40AF' }}>Step 2 of 7</span>
            </div>
            <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>Exit</a>
          </div>
          <div style={{ height: 2, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 48 }}>
            <div style={{ width: '28.57%', height: '100%', backgroundColor: '#1E40AF', borderRadius: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 16, fontWeight: 400 }}>
            What is your household's annual income?
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>
            This helps us determine which AMI tier you qualify for.
          </p>
        </div>
        
        <div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 45,000"
            style={{
              width: '100%', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '20px 24px', fontSize: 20, color: '#0D1117',
              backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'var(--font-dm-serif)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1E40AF')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            onChange={e => sessionStorage.setItem('wizard_income', e.target.value)}
          />
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 10 }}>Your answer is private and never stored beyond this session.</p>
          <button
            onClick={() => router.push('/wizard/step3')}
            style={{
              marginTop: 32, backgroundColor: '#1E40AF', color: 'white',
              border: 'none', borderRadius: 10, padding: '16px 36px',
              fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'block', width: '100%',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
