"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WizardStep7() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push('/wizard/step6')}
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
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 7 of 7</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
            Would you like to receive your results by email?
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 720, lineHeight: 1.75 }}>
            Optional — leave blank to see results now.
          </p>
        </div>

        <div className="max-w-2xl mb-10">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-[28px] px-6 py-5"
            style={{
              border: '1px solid #E0DDD8',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              fontSize: 20,
              outline: 'none',
            }}
          />
          <p style={{ marginTop: 12, color: '#6B6B6B', fontSize: 14, lineHeight: 1.7 }}>
            We never sell or share your email. You can unsubscribe anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
          <button
            type="button"
            onClick={() => { sessionStorage.setItem("wizard_email", email); router.push('/results'); }}
            className="w-full rounded-3xl px-6 py-5"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E0DDD8',
              color: '#1D6B4A',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Skip, show my results
          </button>
          <button
            type="button"
            onClick={() => { sessionStorage.setItem("wizard_email", email); router.push('/results'); }}
            className="w-full rounded-3xl px-6 py-5"
            style={{
              backgroundColor: '#1D6B4A',
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 700,
              border: 'none',
            }}
          >
            Send my results
          </button>
        </div>
      </div>
    </div>
  );
}
