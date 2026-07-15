import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A1628', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 5vw, 48px)' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', marginBottom: 20 }}>404 &mdash;&mdash; PAGE NOT FOUND</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, marginBottom: 16, fontWeight: 300 }}>
          This page wandered off.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 32 }}>
          The page you&apos;re looking for doesn&apos;t exist. Try checking your eligibility or browsing current listings instead.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Check eligibility
          </Link>
          <Link href="/" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
