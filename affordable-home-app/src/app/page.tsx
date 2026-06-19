export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0', color: '#0A0A0A' }}>
      <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-12">
        <header className="flex flex-col gap-6 border-b border-[#E0DDD8] pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1D6B4A] text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, letterSpacing: '0.04em' }}>Affordable Home</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#0A0A0A]">
            <a href="#listings" className="transition hover:text-[#1D6B4A]">Browse Listings</a>
            <a href="#resources" className="transition hover:text-[#1D6B4A]">Resources</a>
            <a href="#about" className="transition hover:text-[#1D6B4A]">About</a>
          </nav>

          <a
            href="/wizard"
            className="inline-flex items-center justify-center rounded-full bg-[#1D6B4A] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#1D6B4A]/20 transition hover:bg-[#15573b]"
          >
            Check My Eligibility
          </a>
        </header>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '3.75rem', lineHeight: 1.02, marginBottom: '1rem', color: '#0A0A0A' }}>
              Your home is out there.
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', fontStyle: 'italic', color: '#C4873A', marginBottom: '1.5rem' }}>
              We'll help you find it.
            </p>
            <p style={{ fontSize: '1.125rem', lineHeight: 1.9, maxWidth: 680, color: '#3C3C3C' }}>
              A free resource connecting Essex County residents to affordable housing programs, income-qualified listings, and local housing authorities — in plain English.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/wizard"
                className="inline-flex items-center justify-center rounded-full bg-[#1D6B4A] px-8 py-4 text-sm font-semibold text-white shadow-sm shadow-[#1D6B4A]/20 transition hover:bg-[#15573b]"
              >
                Check My Eligibility
              </a>
              <a
                href="#listings"
                className="inline-flex items-center justify-center rounded-full border border-[#1D6B4A] bg-transparent px-8 py-4 text-sm font-semibold text-[#1D6B4A] transition hover:bg-[#E8F4E8]"
              >
                Browse Listings
              </a>
            </div>
            <p className="mt-6 text-sm text-[#6B6B6B]">Free, always. No account required.</p>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
            <img
              src="/MontclairEstates-1.jpg.webp"
              alt="Brick apartment building"
              className="h-80 w-full rounded-[28px] object-cover"
            />
          </div>
        </section>

        <section className="mt-16 rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.06)]">
          <div className="mb-8 flex flex-col gap-3 text-[#0A0A0A]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1D6B4A]">What you'll find</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2.75rem', lineHeight: 1.05 }}>Trusted guidance for every affordable housing pathway.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              'Section 8 & Housing Choice Vouchers - Across every Essex County housing authority.',
              'LIHTC & income-restricted units - Rent capped to your household income.',
              'Open waitlists & senior housing - With current status and direct application links.',
            ].map((text) => (
              <div key={text} className="rounded-[28px] border border-[#E0DDD8] bg-[#F7F5F0] p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1D6B4A] text-lg font-semibold text-white">✓</div>
                <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#0A0A0A' }}>{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[#6B6B6B]">Independent and free. Not a landlord, broker, or government agency.</p>
        </section>

        <section className="mt-16">
          <div className="mb-8 text-[#0A0A0A]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1D6B4A]">HOW IT WORKS</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2.75rem', lineHeight: 1.05, marginTop: '0.75rem' }}>Three steps. No guesswork.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                step: 'Step 01',
                title: 'Tell us about your household',
                description: 'Seven quick questions about size, income, and what you need.',
              },
              {
                step: 'Step 02',
                title: 'We match programs you qualify for',
                description: 'We compare your profile against every program and listing.',
              },
              {
                step: 'Step 03',
                title: 'Apply through official links',
                description: 'Every result links straight to the official application.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-[32px] border border-[#E0DDD8] bg-white p-8">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#1D6B4A]">{item.step}</p>
                <h3 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', lineHeight: 1.2, marginBottom: '0.85rem' }}>{item.title}</h3>
                <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.8 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 px-6">
          <div className="mx-auto w-full max-w-7xl rounded-[48px] bg-[#F0EBE0] px-8 py-12 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-12 sm:py-16">
            <div className="mb-10 max-w-3xl text-[#0A0A0A]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1D6B4A]">WHY AFFORDABLE HOME</p>
              <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2.75rem', lineHeight: 1.05, marginTop: '0.75rem' }}>
                Built different on purpose.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                { title: 'Eligibility-first', text: 'We show you what you qualify for, not just what’s available.' },
                { title: 'Verified data', text: 'Every listing shows its source and last-verified date.' },
                { title: 'Hyper-local', text: 'Newark, East Orange, Irvington, and all 22 municipalities.' },
                { title: 'Private by design', text: 'Your answers stay in your browser. No account, no tracking.' },
                { title: 'Always current', text: 'Listings re-verified and waitlist statuses kept up to date.' },
                { title: 'Independent', text: 'Not a landlord, not a broker, not a government agency.' },
              ].map((item) => (
                <div key={item.title} className="rounded-[28px] bg-[#F7F3EC] p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1D6B4A] text-sm font-bold text-white">✓</span>
                    <div>
                      <p className="text-base font-semibold text-[#0A0A0A]">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[#4B5563]">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 text-[#0A0A0A]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1D6B4A]">COVERAGE</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2.75rem', lineHeight: 1.05, marginTop: '0.75rem' }}>All of Essex County.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#4B5563]">From Newark high-rises to Caldwell garden apartments — if it's affordable housing in Essex County, we track it.</p>
          </div>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-[#0A0A0A]">Coverage across all municipalities in the county.</p>
            <a
              href="/wizard"
              className="inline-flex items-center justify-center rounded-full bg-[#1D6B4A] px-8 py-4 text-sm font-semibold text-white shadow-sm shadow-[#1D6B4A]/20 transition hover:bg-[#15573b]"
            >
              Start matching
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Newark', 'East Orange', 'Irvington', 'Orange', 'West Orange', 'Montclair', 'Bloomfield', 'Belleville', 'Nutley', 'Maplewood', 'South Orange', 'Livingston', 'Caldwell', 'Verona', 'Cedar Grove', 'Glen Ridge',
            ].map((town) => (
              <div key={town} className="rounded-3xl border border-[#E0DDD8] bg-white px-5 py-4 text-sm font-semibold text-[#0A0A0A]">{town}</div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[32px] bg-[#0A0A0A] p-10 text-white">
          <div className="max-w-3xl">
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2.75rem', lineHeight: 1.05, marginBottom: '1rem' }}>Your home is out there.</h2>
            <p className="mb-8 text-base leading-8 text-[#E5E7EB]">Five minutes from now, you could have a real list of places to apply.</p>
            <a
              href="/wizard"
              className="inline-flex items-center justify-center rounded-full bg-[#1D6B4A] px-8 py-4 text-sm font-semibold text-white shadow-sm shadow-[#1D6B4A]/20 transition hover:bg-[#15573b]"
            >
              Start the eligibility check
            </a>
          </div>
        </section>

        <footer className="mt-16 border-t border-[#E0DDD8] pt-8 text-sm text-[#4B5563]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2025 Affordable Home · Essex County, NJ</p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="transition hover:text-[#1D6B4A]">Privacy</a>
              <a href="#" className="transition hover:text-[#1D6B4A]">Contact</a>
              <a href="#" className="transition hover:text-[#1D6B4A]">Data sources</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
