"use client";

import { useRouter } from "next/navigation";

export default function WizardStep2() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push('/wizard')}
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
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 2 of 7</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '28.5714%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
            What is your household's annual income?
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 620, lineHeight: 1.75 }}>
            This helps us determine which AMI tier you qualify for. Your answer is private and never stored.
          </p>
        </div>

        <div className="max-w-2xl">
          <label htmlFor="income" style={{ display: 'block', color: '#6B6B6B', fontSize: 16, marginBottom: 12 }}>
            Annual income
          </label>
          <input
            id="income"
            type="text"
            inputMode="numeric"
            placeholder="$0"
            className="w-full rounded-[28px] px-6 py-5"
            style={{
              border: '1px solid #E0DDD8',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              fontSize: 20,
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={() => router.push('/wizard/step3')}
            className="mt-8 w-full rounded-3xl px-6 py-5"
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
    </div>
  );
}
