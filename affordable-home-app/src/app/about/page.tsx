export default function About() {
  return (
    <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.16em', marginBottom: 24 }}>ABOUT</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0A1628', marginBottom: 24, lineHeight: 1.2 }}>Housing information should be free and easy to find.</h1>
        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 48 }}>Home Reach is a free eligibility platform built for Essex County, NJ residents. We help people understand which affordable housing programs and income-qualified listings they may qualify for — without requiring an account, a fee, or a meeting with a counselor.</p>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Why we built this</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Essex County has over 863,000 residents — and hundreds of affordable housing units that most people never find. The information exists, but it is scattered across housing authority websites, state portals, and nonprofit databases. Home Reach brings it together in one place and matches it to your household profile.</p>
        </div>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Our data sources</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>Every listing in Home Reach comes from a verified public source. Sources include:</p>
          {[
            'NJ Housing Resource Center (NJHRC)',
            'Newark Housing Authority',
            'East Orange Housing Authority',
            'Irvington Housing Authority',
            'NJ Department of Community Affairs (DCA)',
            'NJ Housing and Mortgage Finance Agency (NJHMFA)',
            'Municipal affordable housing contacts across all 22 Essex County towns',
          ].map(source => (
            <div key={source} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <span style={{ color: '#1E3A5F', marginTop: 2 }}>—</span>
              <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>{source}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Data freshness</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Every listing shows a last verified date. We check listings regularly, but availability and eligibility requirements change. Always confirm directly with the housing provider before applying.</p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Contact</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Questions, corrections, or feedback? Email <a href="mailto:olivergolub@gmail.com" style={{ color: '#1E3A5F' }}>olivergolub@gmail.com</a>.</p>
        </div>

        <a href="/" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← Back to Home Reach</a>
      </div>
    </main>
  );
}
