// Shared disclaimer bar + footer used across every page so the legal notice
// and site links stay identical everywhere and are edited in one place.
export function SiteFooter() {
  return (
    <>
      {/* DISCLAIMER BAR */}
      <div style={{ backgroundColor: '#0A1628', padding: '16px clamp(20px, 5vw, 48px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 15, color: '#FFFFFF', maxWidth: 1280, margin: '0 auto', lineHeight: 1.7 }}>
          Home Reach is an informational tool only. Listing availability and eligibility requirements are subject to change. Always verify details directly with the housing provider before applying. This is not legal advice and does not guarantee housing placement.
        </p>
      </div>
      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0A1628', padding: 'clamp(32px, 4vw, 48px) clamp(20px, 5vw, 48px)', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>Home Reach</span>
              </div>
              <p style={{ fontSize: 15, color: '#FFFFFF', maxWidth: 280, lineHeight: 1.7 }}>Essex County&apos;s free housing guide. Connecting residents to affordable programs and income-qualified listings.</p>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {[{ label: 'Privacy', href: '/privacy' }, { label: 'Contact', href: 'mailto:olivergolub@gmail.com' }, { label: 'Data sources', href: '/about' }].map((link) => (
                <a key={link.label} href={link.href} style={{ fontSize: 15, color: '#FFFFFF', textDecoration: 'none' }}>{link.label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <p style={{ fontSize: 14, color: '#FFFFFF' }}>© 2026 Home Reach · Essex County, NJ · Not a government agency</p>
          </div>
        </div>
      </footer>
    </>
  );
}
