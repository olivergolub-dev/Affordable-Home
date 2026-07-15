'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A1628', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 5vw, 48px)' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', marginBottom: 20 }}>SOMETHING WENT WRONG</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, marginBottom: 16, fontWeight: 300 }}>
          That didn&apos;t work.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 32 }}>
          An unexpected error occurred. Your answers are still saved in this browser session &mdash; try again.
        </p>
        <button
          onClick={() => unstable_retry()}
          style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
