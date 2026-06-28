'use client';

import { motion, useInView, useScroll } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 1.8, delay, ease: [0.06, 0.6, 0.12, 1.0] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${p.opacity})`;
        ctx.fill();

        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(to right, #1E40AF, #60A5FA)',
        scaleX: scrollYProgress, transformOrigin: '0%',
        zIndex: 100,
      }}
    />
  );
}

function Ticker() {
  const items = ['Essex County · Free · No Account Required · 25+ Listings · 22 Municipalities · Verified Data · Free Always · Essex County · Free · No Account Required · 25+ Listings · 22 Municipalities · Verified Data · Free Always · '];
  return (
    <div style={{ backgroundColor: '#0A1628', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', padding: '10px 0' }}>
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', gap: 0, whiteSpace: 'nowrap' }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', paddingRight: 48 }}>
            {items[0]}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function GlassCard({ n, suffix, label, delay }: { n: number; suffix: string; label: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: '24px 32px',
        minWidth: 160,
      }}>
        <p style={{ fontSize: 48, fontWeight: 800, color: '#FFFFFF', marginBottom: 4, lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
          <AnimatedNumber target={n} suffix={suffix} />
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</p>
      </div>
    </FadeUp>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#0D1117' }}>
      <ScrollProgress />

      {/* NAV */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: 'rgba(10, 22, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', letterSpacing: '0.02em', display: 'block' }}>Home Reach</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Essex County's free housing guide</span>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 500, flexWrap: 'wrap' }}>
            <a href="/results" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Browse Listings</a>
            <a href="#how" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>How it works</a>
            <a href="#coverage" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Coverage</a>
          </nav>
          <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '10px 22px', borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Check Eligibility
          </a>
        </div>
      </motion.header>

      {/* HERO */}
      <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 clamp(20px, 5vw, 48px) clamp(60px, 8vw, 100px)', overflow: 'hidden' }}>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 30%', filter: 'brightness(0.28)' }}
        />
        {/* Noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,22,40,0.98) 0%, rgba(10,22,40,0.5) 50%, rgba(10,22,40,0.25) 100%)', zIndex: 0 }} />
        <ParticleCanvas />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.2, ease: [0.06, 0.6, 0.12, 1.0] }}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 28 }}>
            Essex County, NJ · Free, Always
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 56, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 2.0, delay: 0.5, ease: [0.06, 0.6, 0.12, 1.0] }}
            style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(4rem, 11vw, 10rem)', lineHeight: 0.88, marginBottom: 40, maxWidth: 1000, fontWeight: 300 }}>
            <span style={{ color: '#FFFFFF' }}>Your home</span><br />
            <span style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #93C5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>is out there.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.8, delay: 1.0, ease: [0.06, 0.6, 0.12, 1.0] }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 480, lineHeight: 1.7, marginBottom: 40 }}>
            A free resource connecting Essex County residents to affordable housing programs and income-qualified listings.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 1.4, ease: [0.06, 0.6, 0.12, 1.0] }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '16px 36px', borderRadius: 6, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Check My Eligibility
            </a>
            <a href="/results" style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em', opacity: 0.85 }}>
              Browse all listings
            </a>
          </motion.div>
        </div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* GLASS STATS BAR */}
      <section style={{ backgroundColor: '#0A1628', padding: 'clamp(40px, 5vw, 64px) clamp(20px, 5vw, 48px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        {/* Noise on dark sections */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <GlassCard n={25} suffix="+" label="Verified listings" delay={0} />
          <GlassCard n={22} suffix="" label="Municipalities covered" delay={0.1} />
          <GlassCard n={100} suffix="%" label="Free, always" delay={0.2} />
          <GlassCard n={0} suffix="" label="Accounts required" delay={0.3} />
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 clamp(20px, 5vw, 48px)', backgroundColor: '#FFFFFF' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#CBD5E1', margin: '0 16px' }} />
        <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
      </div>

      {/* WHAT YOU'LL FIND */}
      <section style={{ backgroundColor: '#FFFFFF', padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1D3A8A', marginBottom: 16 }}>What you'll find</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, maxWidth: 700, marginBottom: 56, color: '#0D1117', fontWeight: 300 }}>
              Trusted guidance for every affordable housing pathway.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
            {[
              { label: 'Section 8 and Vouchers', desc: 'Across every Essex County housing authority, with current waitlist status.' },
              { label: 'Income-restricted units', desc: 'LIHTC properties with rent capped to your household income.' },
              { label: 'Open waitlists', desc: 'Real-time status and direct links to official applications.' },
            ].map((item, i) => (
              <FadeUp key={item.label} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{ borderTop: '2px solid #0D1117', paddingTop: 32 }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1E40AF', marginBottom: 24 }} />
                  <p style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.4rem', marginBottom: 12, color: '#0D1117', fontWeight: 400 }}>{item.label}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: '#475569' }}>{item.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 clamp(20px, 5vw, 48px)', backgroundColor: '#0A1628' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 16px' }} />
        <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ backgroundColor: '#0A1628', padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, color: '#FFFFFF', marginBottom: 64, fontWeight: 300 }}>
              Three steps. No guesswork.
            </h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 0 }}>
            {[
              { n: '01', title: 'Tell us about your household', desc: 'Seven quick questions about size, income, and what you need.' },
              { n: '02', title: 'We match programs you qualify for', desc: 'Your profile is compared against every program and listing in Essex County.' },
              { n: '03', title: 'Apply through official links', desc: 'Every result links straight to the official application. No middleman.' },
            ].map((item, i) => (
              <FadeUp key={item.n} delay={i * 0.15}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  style={{ padding: '40px 32px 40px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#60A5FA', marginBottom: 20 }}>STEP {item.n}</p>
                  <h3 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#FFFFFF', lineHeight: 1.2, marginBottom: 14, fontWeight: 400 }}>{item.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.65)' }}>{item.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HOME REACH - gradient mesh */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)',
        background: 'linear-gradient(135deg, #F0F4FF 0%, #F8FAFC 40%, #EEF2FF 70%, #F0F9FF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1D3A8A', marginBottom: 16 }}>Why Home Reach</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, marginBottom: 56, color: '#0D1117', fontWeight: 300 }}>Built different on purpose.</h2>
          </FadeUp>
          {/* Staggered grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
            {[
              { title: 'Eligibility-first', text: 'We show you what you qualify for, not just what is available.', offset: 0 },
              { title: 'Verified data', text: 'Every listing shows its source and last-verified date.', offset: 24 },
              { title: 'Hyper-local', text: 'Newark, East Orange, Irvington, and all 22 municipalities.', offset: 0 },
              { title: 'Private by design', text: 'Your answers stay in your browser. No account, no tracking.', offset: 24 },
              { title: 'Always current', text: 'Listings re-verified and waitlist statuses kept up to date.', offset: 0 },
              { title: 'Independent', text: 'Not a landlord, not a broker, not a government agency.', offset: 24 },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(30,64,175,0.1)', borderColor: '#BFDBFE' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 12,
                    padding: '28px 24px',
                    border: '1px solid rgba(255,255,255,0.9)',
                    marginTop: item.offset,
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1E40AF', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#0D1117' }}>{item.title}</p>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: '#475569' }}>{item.text}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 clamp(20px, 5vw, 48px)', backgroundColor: '#FFFFFF' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#CBD5E1', margin: '0 16px' }} />
        <div style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
      </div>

      {/* COVERAGE */}
      <section id="coverage" style={{ backgroundColor: '#FFFFFF', padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1D3A8A', marginBottom: 16 }}>Coverage</p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05, marginBottom: 16, color: '#0D1117', fontWeight: 300 }}>All of Essex County.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#475569', maxWidth: 560, marginBottom: 48 }}>From Newark high-rises to Caldwell garden apartments. If it is affordable housing in Essex County, we track it.</p>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 48 }}>
            {['Newark', 'East Orange', 'Irvington', 'Orange', 'West Orange', 'Montclair', 'Bloomfield', 'Belleville', 'Nutley', 'Maplewood', 'South Orange', 'Livingston', 'Caldwell', 'Verona', 'Cedar Grove', 'Glen Ridge', 'Essex Fells', 'Fairfield', 'Millburn', 'North Caldwell', 'Roseland', 'West Caldwell'].map((town, i) => (
              <FadeUp key={town} delay={i * 0.02}>
                <motion.div
                  whileHover={{ backgroundColor: '#1E40AF', color: '#FFFFFF', borderColor: '#1E40AF' }}
                  transition={{ duration: 0.15 }}
                  style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#334155', backgroundColor: '#F8FAFC', textAlign: 'center', cursor: 'default' }}
                >
                  {town}
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

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
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 280, lineHeight: 1.7 }}>Essex County's free housing guide. Connecting residents to affordable programs and income-qualified listings.</p>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              {['Privacy', 'Contact', 'Data sources'].map(link => (
                <a key={link} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{link}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>2025 Home Reach · Essex County, NJ · Not a government agency</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
