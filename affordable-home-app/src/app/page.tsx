"use client";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2ED', color: '#1A1A1A' }}>
      <header style={{ backgroundColor: '#F5F2ED', borderBottom: '1px solid #E0DDD8' }}>
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1100, padding: '0 32px', height: 64 }}>
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#1A1A1A' }} xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 500, color: '#1A1A1A' }}>Affordable Home</span>
          </div>
          <nav className="hidden md:flex items-center gap-8" style={{ color: '#6B6B6B', fontSize: 14 }}>
            <a href="#homes">Homes</a>
            <a href="#eligibility">Eligibility</a>
            <a href="#resources">Resources</a>
            <a href="#about">About Us</a>
          </nav>
          <button style={{ color: '#4B5563', border: '1px solid #D1D5DB', backgroundColor: 'transparent', padding: '10px 16px', borderRadius: 12, fontSize: 14 }}>Log in</button>
        </div>
      </header>

      <main>
        <section style={{ backgroundColor: '#F5F2ED', padding: '96px 32px' }}>
          <div className="mx-auto flex flex-col lg:flex-row items-center gap-16" style={{ maxWidth: 1100 }}>
            <div className="flex-1">
              <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, marginBottom: 24, color: '#1A1A1A' }}>
                Your home is<br />
                out there.<br />
                <em style={{ color: '#C4873A', fontStyle: 'italic' }}>We&apos;ll help you find it.</em>
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.75, maxWidth: 480, color: '#6B6B6B', marginBottom: 32 }}>
                We make it simple to discover affordable homes and housing programs in Essex County, NJ that fit your household and budget.
              </p>
              <a href="/wizard" style={{ backgroundColor: '#1D6B4A', color: '#FFFFFF', padding: '14px 24px', borderRadius: 16, fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                Get Started →
              </a>
            </div>
            <div className="flex-1" style={{ width: '100%', minHeight: 480 }}>
              <img src="/MontclairEstates-1.jpg.webp" alt="Essex County apartment building" className="w-full h-full object-cover rounded-2xl shadow-lg" style={{ minHeight: '480px' }} />
            </div>
          </div>
        </section>
        <div style={{ height: 1, backgroundColor: '#1D6B4A', margin: '0 32px' }} />
        <section style={{ backgroundColor: '#F5F2ED', borderTop: '1px solid #E0DDD8', borderBottom: '1px solid #E0DDD8', padding: '80px 32px' }}>
          <div className="mx-auto grid grid-cols-1 md:grid-cols-4 gap-8" style={{ maxWidth: 1100 }}>
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: '#1A1A1A' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11L12 4L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V19H17V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontWeight: 500, color: '#1A1A1A', fontSize: 14 }}>Find Homes</p>
              <p style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.6 }}>Browse verified affordable listings in your area.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: '#1A1A1A' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6H19V18H5V6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <p style={{ fontWeight: 500, color: '#1A1A1A', fontSize: 14 }}>Check Eligibility</p>
              <p style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.6 }}>See programs matched to your household profile.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: '#1A1A1A' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p style={{ fontWeight: 500, color: '#1A1A1A', fontSize: 14 }}>Get Help</p>
              <p style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.6 }}>Find support and guidance for each step of the process.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: '#1A1A1A' }} xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontWeight: 500, color: '#1A1A1A', fontSize: 14 }}>Move Forward</p>
              <p style={{ color: '#6B6B6B', fontSize: 12, lineHeight: 1.6 }}>Take confident next steps toward a stable home.</p>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#FFFFFF', padding: '100px 32px' }}>
          <div className="mx-auto text-center" style={{ maxWidth: 1100 }}>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 42, color: '#1A1A1A', marginBottom: 12 }}>How it works</h2>
            <p style={{ color: '#6B6B6B', fontSize: 16, marginBottom: 48 }}>Three simple steps to find housing you qualify for</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div style={{ border: '1px solid #E0DDD8', borderRadius: 32, padding: 32, backgroundColor: '#FFFFFF' }}>
                <div style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 72, color: '#C4873A', fontWeight: 400, marginBottom: 16 }}>1</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>Tell us about your household</h3>
                <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.75 }}>Answer a few questions about your income, household size, and needs.</p>
              </div>
              <div style={{ border: '1px solid #E0DDD8', borderRadius: 32, padding: 32, backgroundColor: '#FFFFFF' }}>
                <div style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 72, color: '#C4873A', fontWeight: 400, marginBottom: 16 }}>2</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>See what you qualify for</h3>
                <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.75 }}>Get a personalized list of programs and listings matched to your profile.</p>
              </div>
              <div style={{ border: '1px solid #E0DDD8', borderRadius: 32, padding: 32, backgroundColor: '#FFFFFF' }}>
                <div style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 72, color: '#C4873A', fontWeight: 400, marginBottom: 16 }}>3</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>Apply directly</h3>
                <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: 1.75 }}>Click official application links with verified sources and dates.</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#F5F2ED', padding: '100px 32px' }}>
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 42, color: '#1A1A1A', marginBottom: 12 }}>Current listings</h2>
              <p style={{ color: '#6B6B6B', fontSize: 16 }}>Verified affordable housing in Essex County, NJ</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0DDD8', borderRadius: 32, padding: 24 }}>
                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
                  <span style={{ backgroundColor: '#F3F4F6', color: '#6B6B6B', fontSize: 12, padding: '6px 10px', borderRadius: 999 }}>East Orange</span>
                  <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 12, padding: '6px 10px', borderRadius: 999 }}>Open</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Arlington Grove Apts</h3>
                <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 20 }}>60% AMI · Verified affordable listing in East Orange.</p>
                <a href="#" style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4 }}>View listing →</a>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0DDD8', borderRadius: 32, padding: 24 }}>
                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
                  <span style={{ backgroundColor: '#F3F4F6', color: '#6B6B6B', fontSize: 12, padding: '6px 10px', borderRadius: 999 }}>Irvington</span>
                  <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontSize: 12, padding: '6px 10px', borderRadius: 999 }}>Open</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Berkeley Terrace Apts</h3>
                <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 20 }}>30-50% AMI · Affordable homes for growing households.</p>
                <a href="#" style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4 }}>View listing →</a>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0DDD8', borderRadius: 32, padding: 24 }}>
                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
                  <span style={{ backgroundColor: '#F3F4F6', color: '#6B6B6B', fontSize: 12, padding: '6px 10px', borderRadius: 999 }}>Newark</span>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: 12, padding: '6px 10px', borderRadius: 999 }}>Waitlist</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Clinton Hill Community Apts</h3>
                <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 20 }}>50-60% AMI · A trusted listing for Newark families.</p>
                <a href="#" style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4 }}>View listing →</a>
              </div>
            </div>
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <a href="#" style={{ color: '#4B5563', fontWeight: 500, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 4 }}>View all listings →</a>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#1A1A1A', padding: '100px 32px', textAlign: 'center' }}>
          <div className="mx-auto" style={{ maxWidth: 800 }}>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 42, color: '#FFFFFF', marginBottom: 16 }}>Your home is out there.</h2>
            <p style={{ color: '#D1D5DB', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>Affordable Home connects Essex County families to housing they qualify for. Free, always. No account required.</p>
            <a href='/wizard'><button style={{ backgroundColor: '#FFFFFF', color: '#1A1A1A', padding: '16px 32px', borderRadius: 16, fontSize: 14, fontWeight: 500 }}>Get Started →</button></a>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: '#F5F2ED', borderTop: '1px solid #E0DDD8', padding: '40px 32px' }}>
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6" style={{ maxWidth: 1100 }}>
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: '#1A1A1A' }} xmlns="http://www.w3.org/2000/svg">
              <path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 500, color: '#1A1A1A' }}>Affordable Home</span>
          </div>
          <div className="flex flex-wrap items-center gap-6" style={{ color: '#6B6B6B', fontSize: 14 }}>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
            <a href="#">Data Sources</a>
          </div>
        </div>
        <p style={{ marginTop: 24, color: '#9CA3AF', fontSize: 12, textAlign: 'center', borderTop: '1px solid #E0DDD8', paddingTop: 24 }}>
          © 2025 Affordable Home · Essex County, NJ · Not legal advice. Always verify directly with the housing authority.
        </p>
      </footer>
    </div>
  );
}
