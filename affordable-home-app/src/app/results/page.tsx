"use client";

import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-4xl p-8 sm:p-12" style={{ minHeight: '100vh' }}>
        <div className="rounded-[32px] bg-white p-10 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 52, lineHeight: 1.05, color: '#1D6B4A', marginBottom: 16 }}>
            Your results are ready.
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, lineHeight: 1.8, marginBottom: 24 }}>
            This is a placeholder results page. Continue building your results experience from here.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-3xl px-6 py-4"
            style={{
              backgroundColor: '#1D6B4A',
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 700,
              border: 'none',
            }}
          >
            Return home
          </button>
        </div>
      </div>
    </div>
  );
}
