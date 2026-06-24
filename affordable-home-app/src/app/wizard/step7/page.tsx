"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WizardStep7() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => router.push('/wizard/step6')} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Back</button>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E40AF' }}>Step 7 of 7</span>
            </div>
            <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>Exit</a>
          </div>
          <div style={{ height: 2, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 48 }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#1E40AF', borderRadius: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 16, fontWeight: 400 }}>
            Want your results emailed to you?
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>Optional. We send your results once and never store your address.</p>
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%', border: '1px solid #E2E8F0', borderRadius: 12,
            padding: '20px 24px', fontSize: 18, color: '#0D1117',
            backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
            fontFamily: 'var(--font-dm-serif)', marginBottom: 12,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#1E40AF')}
          onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
        />
        <button
          onClick={() => { sessionStorage.setItem('wizard_email', email); router.push('/results'); }}
          style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 10, padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', marginBottom: 16 }}
        >
          See my matches
        </button>
        <button
          onClick={() => { router.push('/results'); }}
          style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 14, cursor: 'pointer', width: '100%', padding: '8px' }}
        >
          Skip and see results
        </button>
      </div>
    </div>
  );
}
