"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const towns = ['Any Essex County municipality', 'Newark', 'East Orange', 'Irvington', 'Orange', 'West Orange', 'Montclair', 'Bloomfield', 'Belleville', 'Nutley', 'Maplewood', 'South Orange', 'Livingston', 'Caldwell', 'Verona', 'Cedar Grove', 'Glen Ridge', 'Essex Fells', 'Fairfield', 'Millburn', 'North Caldwell', 'Roseland'];

export default function WizardStep4() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (town: string) => {
    setSelected(prev => prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(40px, 7vw, 80px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => router.push('/wizard/step3')} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Back</button>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1E40AF' }}>Step 4 of 7</span>
            </div>
            <a href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>Exit</a>
          </div>
          <div style={{ height: 2, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 48 }}>
            <div style={{ width: '57.14%', height: '100%', backgroundColor: '#1E40AF', borderRadius: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 16, fontWeight: 400 }}>
            Where in Essex County are you looking?
          </h1>
          <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.7 }}>Select all that apply.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
          {towns.map((town) => (
            <button
              key={town}
              onClick={() => toggle(town)}
              style={{
                backgroundColor: selected.includes(town) ? '#EFF6FF' : '#FFFFFF',
                border: selected.includes(town) ? '1px solid #1E40AF' : '1px solid #E2E8F0',
                borderRadius: 10, padding: '12px 16px', textAlign: 'left',
                fontSize: 13, fontWeight: 500, color: selected.includes(town) ? '#1E40AF' : '#0D1117',
                cursor: 'pointer',
              }}
            >
              {town}
            </button>
          ))}
        </div>
        <button
          onClick={() => { sessionStorage.setItem('wizard_towns', JSON.stringify(selected)); router.push('/wizard/step5'); }}
          style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 10, padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
