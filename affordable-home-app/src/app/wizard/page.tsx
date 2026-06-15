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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 1 of 7</p>
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Eligibility Wizard</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '14.2857%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
            How many people are in your household?
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 620, lineHeight: 1.75 }}>
            This helps us match you with the most accurate housing programs and listings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => router.push('/wizard/step2')}
              className="rounded-3xl text-left px-6 py-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD8',
                color: '#1A1A1A',
                fontSize: 22,
                fontWeight: 600,
                boxShadow: '0 20px 40px rgba(29, 107, 74, 0.08)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
