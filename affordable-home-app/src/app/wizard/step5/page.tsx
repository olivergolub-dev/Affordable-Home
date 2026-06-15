"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = ["Yes", "No", "I'm not sure"];

export default function WizardStep5() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push('/wizard/step4')}
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
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 5 of 7</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '71.4286%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="lg:flex-1">
              <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
                Do you have a housing voucher?
              </h1>
              <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 720, lineHeight: 1.75 }}>
                Such as Section 8 / Housing Choice Voucher.
              </p>
            </div>
            <div className="rounded-[32px] border border-[#E0DDD8]" style={{ backgroundColor: '#F5EFE6', maxWidth: 420, padding: 28, color: '#1D6B4A' }}>
              <div className="flex items-start gap-3" style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 700, color: '#1D6B4A', fontSize: 16 }}>
                  Info
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: '#1D6B4A' }}>
                A housing voucher (Section 8) is a government subsidy that helps low-income households pay rent in the private market. The voucher covers the gap between what you can afford and the market rent, you pay roughly 30% of your income, and the voucher covers the rest.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {options.map((option) => {
            const isActive = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
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
          onClick={() => router.push('/wizard/step6')}
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
