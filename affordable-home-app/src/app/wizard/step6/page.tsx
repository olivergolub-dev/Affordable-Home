"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const options = ['Senior (62+)', 'Veteran', 'Person with a disability', 'Experiencing homelessness', 'None of the above'];

export default function WizardStep6() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opt: string) => {
    if (opt === 'None of the above') { setSelected(['None of the above']); return; }
    setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev.filter(o => o !== 'None of the above'), opt]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => router.push('/wizard/step5')} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Back</button>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E40AF' }}>Step 6 of 7</span>
            </div>
            <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>Exit</a>
          </div>
          <div style={{ height: 2, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 48 }}>
            <div style={{ width: '85.71%', height: '100%', backgroundColor: '#1E40AF', borderRadius: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 16, fontWeight: 300 }}>
            Do any of these apply to you?
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>Select all that apply. Some programs prioritize specific groups.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                backgroundColor: selected.includes(opt) ? '#EFF6FF' : '#FFFFFF',
                border: selected.includes(opt) ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                borderRadius: 12, padding: '20px 24px', textAlign: 'left',
                fontSize: 16, fontWeight: 500, color: selected.includes(opt) ? '#1E40AF' : '#0D1117',
                cursor: 'pointer', fontFamily: 'var(--font-dm-serif)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={() => { sessionStorage.setItem('wizard_circumstances', JSON.stringify(selected)); router.push('/wizard/step7'); }}
          style={{ marginTop: 24, backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 10, padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
