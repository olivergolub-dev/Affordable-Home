'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 56, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#0D1117' }}>

      {/* NAV */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: 'rgba(10, 22, 40, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', letterSpacing: '0.02em' }}>Affordable Home</span>
          </div>
          <nav style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            <a href="/results" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Browse Listings</a>
            <a href="#how" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>How it works</a>
            <a href="#coverage" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Coverage</a>
          </nav>
          <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Check Eligibility
          </a>
        </div>
      </motion.header>

      {/* HERO - full bleed photo */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 48px 100px',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.45)',
        }} />
        {/* Navy gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.4) 50%, rgba(10,22,40,0.2) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 28 }}
          >
            Essex County, NJ · Free, Always
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 56, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(3.5rem, 9vw, 8.5rem)', lineHeight: 0.92, color: '#FFFFFF', marginBottom: 40, maxWidth: 1000 }}
          >
            Your home<br />is out there.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}
          >
            A free resource connecting Essex County residents to affordable housing programs and income-qualified listings.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '16px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Check My Eligibility →
            </a>
            <a href="/results" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2 }}>
              Browse all listings
            </a>
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ position: 'absolute', bottom: 40, right: 48, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section style={{ backgroundColor: '#0A1628', padding: '32px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {[
            { n: '25+', label: 'Verified listings' },
            { n: '22', label: 'Municipalities covered' },
            { n: '100%', label: 'Free, always' },
            { n: '0', label: 'Accounts required' },
          ].map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{s.n}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* WHAT YOU'LL FIND */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1E40AF', marginBottom: 16 }}>What you'll find</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, maxWidth: 700, marginBottom: 64, color: '#0D1117' }}>
              Trusted guidance for every affordable housing pathway.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { label: 'Section 8 & Vouchers', desc: 'Across every Essex County housing authority, with current waitlist status.' },
              { label: 'Income-restricted units', desc: 'LIHTC properties with rent capped to your household income.' },
              { label: 'Open waitlists', desc: 'Real-time status and direct links to official applications.' },
            ].map((item, i) => (
              <FadeUp key={item.label} delay={i * 0.12}>
                <div style={{ borderTop: '2px solid #0D1117', paddingTop: 32 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'white', fontSize: 14, fontWeight: 700 }}>✓</div>
                  <p style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.35rem', marginBottom: 12, color: '#0D1117' }}>{item.label}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: '#64748B' }}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ backgroundColor: '#0A1628', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, color: '#FFFFFF', marginBottom: 80 }}>
              Three steps.<br />No guesswork.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 0 }}>
            {[
              { n: '01', title: 'Tell us about your household', desc: 'Seven quick questions about size, income, and what you need.' },
              { n: '02', title: 'We match programs you qualify for', desc: 'Your profile is compared against every program and listing in Essex County.' },
              { n: '03', title: 'Apply through official links', desc: 'Every result links straight to the official application — no middleman.' },
            ].map((item, i) => (
              <FadeUp key={item.n} delay={i * 0.15}>
                <div style={{ padding: '40px 32px 40px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#1E40AF', marginBottom: 20 }}>STEP {item.n}</p>
                  <h3 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.4rem', color: '#FFFFFF', lineHeight: 1.2, marginBottom: 14 }}>{item.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.45)' }}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.5}>
            <div style={{ marginTop: 64, paddingTop: 64, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '16px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start the eligibility check →
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* WHY AFFORDABLE HOME */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1E40AF', marginBottom: 16 }}>Why Affordable Home</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, marginBottom: 64, color: '#0D1117' }}>Built different<br />on purpose.</h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { title: 'Eligibility-first', text: 'We show you what you qualify for, not just what\'s available.' },
              { title: 'Verified data', text: 'Every listing shows its source and last-verified date.' },
              { title: 'Hyper-local', text: 'Newark, East Orange, Irvington, and all 22 municipalities.' },
              { title: 'Private by design', text: 'Your answers stay in your browser. No account, no tracking.' },
              { title: 'Always current', text: 'Listings re-verified and waitlist statuses kept up to date.' },
              { title: 'Independent', text: 'Not a landlord, not a broker, not a government agency.' },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.07}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '28px 24px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: '#1E40AF', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#0D1117' }}>{item.title}</p>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748B' }}>{item.text}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section id="coverage" style={{ backgroundColor: '#FFFFFF', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1E40AF', marginBottom: 16 }}>Coverage</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, marginBottom: 16, color: '#0D1117' }}>All of Essex County.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#64748B', maxWidth: 560, marginBottom: 56 }}>From Newark high-rises to Caldwell garden apartments — if it's affordable housing in Essex County, we track it.</p>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 56 }}>
            {['Newark', 'East Orange', 'Irvington', 'Orange', 'West Orange', 'Montclair', 'Bloomfield', 'Belleville', 'Nutley', 'Maplewood', 'South Orange', 'Livingston', 'Caldwell', 'Verona', 'Cedar Grove', 'Glen Ridge'].map((town, i) => (
              <FadeUp key={town} delay={i * 0.03}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117', backgroundColor: '#F8FAFC' }}>{town}</div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <a href="/wizard" style={{ backgroundColor: '#0A1628', color: 'white', padding: '16px 36px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Start matching →
            </a>
          </FadeUp>
        </div>
      </section>

      {/* CTA - photo background again */}
      <section style={{ position: 'relative', padding: '140px 48px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
          filter: 'brightness(0.3)',
        }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,22,40,0.7)' }} />
        <FadeUp>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', lineHeight: 0.95, color: '#FFFFFF', marginBottom: 32 }}>
              Your home<br />is out there.
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.7 }}>Five minutes from now, you could have a real list of places to apply.</p>
            <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '18px 40px', borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Start the eligibility check →
            </a>
          </div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0A1628', padding: '40px 48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2025 Affordable Home · Essex County, NJ</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Contact', 'Data sources'].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
