"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const towns = ['Any Essex County municipality','Newark','East Orange','Irvington','Orange','West Orange','Montclair','Bloomfield','Belleville','Nutley','Maplewood','South Orange','Livingston','Caldwell','Verona','Cedar Grove','Glen Ridge','Essex Fells','Fairfield','Millburn','North Caldwell','Roseland','West Caldwell'];

export default function WizardStep4() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (t: string) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
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
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>[ 04 / 07 ]</span>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Exit</a>
        </div>
      </header>
      <div style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: '57.14%', height: '100%', background: 'linear-gradient(to right, #1E40AF, #60A5FA)' }} />
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
        <button onClick={() => router.push('/wizard/step3')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 48 }}>← Back</button>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', marginBottom: 20 }}>[ 04 ] &mdash;&mdash; STEP 4 OF 7</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.05, color: '#FFFFFF', marginBottom: 16, fontWeight: 300 }}>
          Where in Essex County are you looking?
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 48 }}>
          Select all that apply. Leave blank to see all municipalities.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
          {towns.map(town => (
            <button
              key={town}
              onClick={() => toggle(town)}
              style={{
                background: selected.includes(town) ? '#1E40AF' : 'rgba(255,255,255,0.04)',
                border: selected.includes(town) ? '1px solid #1E40AF' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#FFFFFF', cursor: 'pointer', textAlign: 'left'
              }}
            >
              {town}
            </button>
          ))}
        </div>
        <button
          onClick={() => { sessionStorage.setItem('wizard_towns', JSON.stringify(selected)); router.push('/wizard/step5'); }}
          style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 8, padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
