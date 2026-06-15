"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const bedroomOptions = [
  "Studio",
  "1 bedroom",
  "2 bedrooms",
  "3 bedrooms",
  "4 bedrooms",
  "5+ bedrooms",
];

export default function WizardStep3() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push('/wizard/step2')}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD8',
                color: '#1D6B4A',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Back
            </button>
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 3 of 7</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '42.8571%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
            How many bedrooms do you need?
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 620, lineHeight: 1.75 }}>
            Select all that apply.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {bedroomOptions.map((option) => {
            const isActive = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className="rounded-3xl text-left px-6 py-8"
                style={{
                  backgroundColor: isActive ? '#E6F4E8' : '#FFFFFF',
                  border: `1px solid ${isActive ? '#1D6B4A' : '#E0DDD8'}`,
                  color: '#1A1A1A',
                  fontSize: 22,
                  fontWeight: 600,
                  boxShadow: '0 20px 40px rgba(29, 107, 74, 0.08)',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push('/wizard/step4')}
          className="w-full rounded-3xl px-6 py-5"
          style={{
            backgroundColor: '#1D6B4A',
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 700,
            border: 'none',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
