import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About & Data Sources',
  description:
    'Why Home Reach exists, the scale of the housing crisis in Essex County, NJ, and the verified public sources behind every listing.',
};

export default function About() {
  return (
    <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 48px)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0A1628', marginBottom: 24, lineHeight: 1.2 }}>About Home Reach</h1>
        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 48 }}>Home Reach is a free eligibility platform for Essex County, NJ residents. Enter your household profile once and see every affordable housing program, unit, and waitlist you qualify for. No more navigating dozens of government websites, PDFs, or dead links.</p>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Why we built this</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>Home Reach started in West Orange, New Jersey, where my grandmother Susan spent 24 years as the township&apos;s Director of Planning and Development - shaping the public policies that created the affordable housing stock Essex County residents depend on today.</p>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>The tools to help people find that housing never kept pace with the policy. New Jersey&apos;s official search tool, the NJ Housing Resource Center, launched in 2005 and operates primarily as a landlord posting registry. What&apos;s missing is an eligibility-first experience - where a family enters their household profile and sees every program they qualify for, along with every unit and waitlist.</p>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>In March 2024, New Jersey enacted A4/S50, the most significant overhaul of state affordable housing policy in decades. This triggered a decade of new construction across Essex County. The state&apos;s primary search tool was built in 2005. Home Reach is the attempt to close that gap.</p>
        </div>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>The need in Essex County</h2>
          {[
            { stat: '881,527', label: 'residents across 22 municipalities' },
            { stat: '55–60%', label: 'of households are renters; unusually high for a NJ county' },
            { stat: '13.4%', label: 'of residents live below the federal poverty line (~115,000 people)' },
            { stat: '~26%', label: 'of residents live with severe housing problems: cost burden or overcrowding' },
          ].map(({ stat, label }) => (
            <div key={label} style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', minWidth: 100 }}>{stat}</span>
              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: 0, paddingTop: 4 }}>{label}</p>
            </div>
          ))}
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>Sources: U.S. Census Bureau ACS 2024, HUD CHAS, Data USA</p>
        </div>

        <div id="sources" style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9', scrollMarginTop: 80 }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Our data sources</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>Every listing in Home Reach comes from a verified public source. We do not create or fabricate listings.</p>
          {[
            'NJ Housing Resource Center (NJHRC) at njhousing.gov',
            'Newark Housing Authority',
            'East Orange Housing Authority',
            'Irvington Township Housing Authority',
            'NJ Department of Community Affairs (DCA)',
            'NJ Housing and Mortgage Finance Agency (NJHMFA)',
            'Municipal affordable housing contacts across all 22 Essex County towns',
            'HUD open data portal',
          ].map(source => (
            <div key={source} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              <span style={{ color: '#1E3A5F', marginTop: 2, flexShrink: 0 }}>-</span>
              <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>{source}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Data freshness</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Every listing shows a last verified date. Availability and eligibility requirements change. Always confirm directly with the housing provider before applying. Home Reach is an informational tool, not a housing application portal.</p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Contact</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Questions, corrections, or feedback? Email <a href="mailto:olivergolub@gmail.com" style={{ color: '#1E3A5F' }}>olivergolub@gmail.com</a>.</p>
        </div>

        <Link href="/" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← Back to Home Reach</Link>
      </div>
    </main>
  );
}
