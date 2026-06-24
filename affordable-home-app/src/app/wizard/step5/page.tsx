"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const options = ['Yes, I have a Section 8 voucher', 'No, I do not have a voucher', 'I am not sure'];

export default function WizardStep5() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => router.push('/wizard/step4')} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Back</button>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E40AF' }}>Step 5 of 7</span>
            </div>
            <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>Exit</a>
          </div>
          <div style={{ height: 2, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 48 }}>
            <div style={{ width: '71.43%', height: '100%', backgroundColor: '#1E40AF', borderRadius: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 16, fontWeight: 300 }}>
            Do you have a housing voucher?
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>A Housing Choice Voucher (Section 8) can expand your options significantly.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { setSelected(opt); sessionStorage.setItem('wizard_voucher', opt); router.push('/wizard/step6'); }}
              style={{
                backgroundColor: selected === opt ? '#EFF6FF' : '#FFFFFF',
                border: selected === opt ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                borderRadius: 12, padding: '20px 24px', textAlign: 'left',
                fontSize: 16, fontWeight: 500, color: selected === opt ? '#1E40AF' : '#0D1117',
                cursor: 'pointer', fontFamily: 'var(--font-dm-serif)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
