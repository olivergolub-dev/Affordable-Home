'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: '#F7F5F0', color: '#0A0A0A' }}>

      {/* NAV */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: 'rgba(247,245,240,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E0DDD8',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1D6B4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 700, letterSpacing: '0.03em', fontSize: 15 }}>Affordable Home</span>
          </div>
          <nav style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            <a href="/results" style={{ color: '#3C3C3C', textDecoration: 'none' }}>Browse Listings</a>
            <a href="#how" style={{ color: '#3C3C3C', textDecoration: 'none' }}>How it works</a>
            <a href="#coverage" style={{ color: '#3C3C3C', textDecoration: 'none' }}>Coverage</a>
          </nav>
          <a href="/wizard" style={{ backgroundColor: '#1D6B4A', color: 'white', padding: '10px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Check My Eligibility
          </a>
        </div>
      </motion.header>

      {/* HERO */}
      <section style={{ minHeight: '100vh', backgroundColor: '#0D2B1F', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 48px 80px', paddingTop: 64 }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6DBF8A', marginBottom: 32 }}
        >
          Essex County, NJ · Free, Always
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(3.5rem, 9vw, 8rem)', lineHeight: 0.95, color: '#F5F0E8', maxWidth: 1100, marginBottom: 48 }}
        >
          Your home<br />is out there.
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
        >
          <a href="/wizard" style={{ backgroundColor: '#2A8A5C', color: 'white', padding: '16px 36px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Check My Eligibility →
          </a>
          <a href="/results" style={{ color: '#A8C5B5', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Browse all listings
          </a>
          <span style={{ color: '#3D6B55', fontSize: 13 }}>No account required</span>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{ position: 'absolute', bottom: 40, right: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{ width: 1, height: 48, backgroundColor: '#3D6B55' }}
          />
          <span style={{ fontSize: 11, letterSpacing: '0.18em', color: '#3D6B55', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>scroll</span>
        </motion.div>
      </section>

      {/* WHAT YOU'LL FIND */}
      <section style={{ backgroundColor: '#F7F5F0', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#1D6B4A', marginBottom: 20 }}>What you'll find</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05, maxWidth: 800, marginBottom: 64 }}>
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
                <div style={{ backgroundColor: '#fff', borderRadius: 28, padding: '36px 32px', border: '1px solid #E8E4DF', height: '100%' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: '#1D6B4A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'white', fontSize: 16 }}>✓</div>
                  <p style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.25rem', marginBottom: 12 }}>{item.label}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: '#555' }}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ backgroundColor: '#0D2B1F', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6DBF8A', marginBottom: 20 }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05, color: '#F5F0E8', marginBottom: 64 }}>
              Three steps.<br />No guesswork.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            {[
              { n: '01', title: 'Tell us about your household', desc: 'Seven quick questions about size, income, and what you need.' },
              { n: '02', title: 'We match programs you qualify for', desc: 'We compare your profile against every program and listing in Essex County.' },
              { n: '03', title: 'Apply through official links', desc: 'Every result links straight to the official application — no middleman.' },
            ].map((item, i) => (
              <FadeUp key={item.n} delay={i * 0.15}>
                <div style={{ padding: '48px 40px', borderTop: '1px solid #1F4535' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: '#3D6B55', marginBottom: 24 }}>Step {item.n}</p>
                  <h3 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#F5F0E8', lineHeight: 1.2, marginBottom: 16 }}>{item.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: '#7BA898' }}>{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.4}>
            <div style={{ marginTop: 64 }}>
              <a href="/wizard" style={{ backgroundColor: '#2A8A5C', color: 'white', padding: '16px 36px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start the eligibility check →
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* WHY AFFORDABLE HOME */}
      <section style={{ backgroundColor: '#F0EBE0', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#1D6B4A', marginBottom: 20 }}>Why Affordable Home</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05, marginBottom: 64 }}>Built different<br />on purpose.</h2>
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
              <FadeUp key={item.title} delay={i * 0.08}>
                <div style={{ backgroundColor: '#F7F3EC', borderRadius: 24, padding: '28px 24px', border: '1px solid #E5DDD0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, backgroundColor: '#1D6B4A', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>✓</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item.title}</p>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555' }}>{item.text}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section id="coverage" style={{ backgroundColor: '#F7F5F0', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#1D6B4A', marginBottom: 20 }}>Coverage</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.05, marginBottom: 16 }}>All of Essex County.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#555', maxWidth: 600, marginBottom: 56 }}>From Newark high-rises to Caldwell garden apartments — if it's affordable housing in Essex County, we track it.</p>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 48 }}>
            {['Newark', 'East Orange', 'Irvington', 'Orange', 'West Orange', 'Montclair', 'Bloomfield', 'Belleville', 'Nutley', 'Maplewood', 'South Orange', 'Livingston', 'Caldwell', 'Verona', 'Cedar Grove', 'Glen Ridge'].map((town, i) => (
              <FadeUp key={town} delay={i * 0.04}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #E0DDD8', borderRadius: 16, padding: '14px 18px', fontSize: 14, fontWeight: 600 }}>{town}</div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <a href="/wizard" style={{ backgroundColor: '#1D6B4A', color: 'white', padding: '16px 36px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Start matching →
            </a>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#0D2B1F', padding: '120px 48px' }}>
        <FadeUp>
          <div style={{ maxWidth: 900 }}>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2.5rem, 6vw, 6rem)', lineHeight: 0.95, color: '#F5F0E8', marginBottom: 40 }}>
              Your home<br />is out there.
            </h2>
            <p style={{ fontSize: 18, color: '#7BA898', marginBottom: 40, lineHeight: 1.7 }}>Five minutes from now, you could have a real list of places to apply.</p>
            <a href="/wizard" style={{ backgroundColor: '#2A8A5C', color: 'white', padding: '18px 40px', borderRadius: 999, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Start the eligibility check →
            </a>
          </div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0A0A0A', padding: '40px 48px', borderTop: '1px solid #1A1A1A' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#555' }}>© 2025 Affordable Home · Essex County, NJ</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Contact', 'Data sources'].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: '#555', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
