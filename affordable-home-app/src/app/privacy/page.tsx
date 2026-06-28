export default function Privacy() {
  return (
    <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B', letterSpacing: '0.16em', marginBottom: 24 }}>PRIVACY POLICY</p>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0A1628', marginBottom: 16, lineHeight: 1.2 }}>Your privacy matters.</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 48 }}>Last updated: June 2026</p>

        {[
          { title: 'No account required', body: 'Home Reach does not require you to create an account. You can use the eligibility wizard and view results without registering or logging in.' },
          { title: 'What we collect', body: 'When you use the eligibility wizard, your answers are stored temporarily in your browser session only. This data is never sent to our servers and disappears automatically when you close the tab.' },
          { title: 'No sensitive data stored', body: 'We do not store your income, household size, voucher status, or any other personal details you enter into the wizard. If you choose to provide an email address for results, it is used once to send your results and then discarded — never saved.' },
          { title: 'Analytics', body: 'We use basic analytics to understand how people use Home Reach — for example, how many people complete the wizard or click on a listing. This data is aggregated and anonymous. We do not track individuals.' },
          { title: 'Third-party links', body: 'Home Reach links to external housing providers, housing authorities, and application portals. We are not responsible for the privacy practices of those sites. Always review their policies before submitting personal information.' },
          { title: 'Children', body: 'Home Reach is not directed at children under 13. We do not knowingly collect any information from children.' },
          { title: 'Contact', body: 'Questions about this policy? Email olivergolub@gmail.com.' },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid #F1F5F9' }}>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.25rem', color: '#0A1628', marginBottom: 12 }}>{title}</h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>{body}</p>
          </div>
        ))}

        <a href="/" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← Back to Home Reach</a>
      </div>
    </main>
  );
}
