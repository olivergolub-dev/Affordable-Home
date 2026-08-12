import type { Metadata } from 'next';
import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

// West Orange rededicating Ridgeway Park in honor of Susan O. Borg (Patch).
const GRANDMOTHER_TRIBUTE_URL =
  'https://patch.com/new-jersey/westorange/west-orange-rededicates-ridgeway-park-honor-susan-o-borg';

// Bio paragraphs kept as plain strings so apostrophes/quotes don't need JSX escaping.
const BIO = [
  "Hi, I'm Oliver.",
  "I'm a senior at Riverdale Country School in the Bronx, and I live in New York City. I built Home Reach because affordable housing has been part of my life for as long as I can remember. My grandmother spent 24 years as West Orange Township's Director of Planning and Development, and growing up around her work showed me how confusing and inaccessible housing programs can be for the people who need them most.",
  "Eligibility rules for affordable housing are often scattered across different agencies, buried in PDFs, or just hard to find. Home Reach pulls that information into one place and gives Essex County residents a simple way to check what they might qualify for. No fees and no fine print. Accounts are optional, and only used to save your results and listings if you want them.",
  "I'm still in high school, and I built this site on my own over the summer because I think everyone deserves a straightforward answer to “am I eligible?” If you have feedback, run into an issue, or just want to share your experience using the site, I'd genuinely love to hear from you.",
];

// Where the listings actually come from (see scripts/seed-listings.ts).
const SOURCE_GROUPS: { group: string; items: string[] }[] = [
  { group: 'Housing directories', items: ['LowIncomeHousing.us', 'Affordable Housing Hub', 'PublicHousing.com', 'AffordableHousingOnline.com', 'HUDHouses.us'] },
  { group: 'Program administrators & developers', items: ['Piazza & Associates (affordable-housing lottery administrator)', 'New Community Corporation', 'Region Nine Housing Corporation', 'National Church Residences', 'United Methodist Communities', 'Conifer Realty'] },
  { group: 'Housing authorities', items: ['Newark, East Orange, Orange, and Irvington housing authorities'] },
  { group: 'Municipal affordable-housing offices', items: ['Township and borough housing offices across Essex County (South Orange, Livingston, Maplewood, West Caldwell, and others)'] },
  { group: 'Income limits', items: ['NJ Housing & Mortgage Finance Agency (NJHMFA) — UHAC regional income limits'] },
];

export const metadata: Metadata = {
  title: 'About & Data Sources',
  description:
    'Why Home Reach exists, the scale of the housing crisis in Essex County, NJ, and the verified public sources behind every listing.',
};

export default function About() {
  return (
    <>
      <SiteHeader />
      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0A1628', marginBottom: 24, lineHeight: 1.2 }}>About Home Reach</h1>
        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 48 }}>Home Reach is a free eligibility platform for Essex County, NJ residents. Enter your household profile once and see every affordable housing program, unit, and waitlist you qualify for. No more navigating dozens of government websites, PDFs, or dead links.</p>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 24 }}>Meet the founder</h2>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              {BIO.map((para, i) => (
                <Fragment key={i}>
                  <p
                    style={{
                      fontSize: i === 0 ? 18 : 15,
                      fontWeight: i === 0 ? 600 : 400,
                      color: i === 0 ? '#0A1628' : '#475569',
                      lineHeight: 1.8,
                      marginBottom: i === BIO.length - 1 ? 0 : 16,
                    }}
                  >
                    {para}
                  </p>
                  {i === 1 && (
                    <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                      <a
                        href={GRANDMOTHER_TRIBUTE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1E3A5F', fontWeight: 500 }}
                      >
                        See more about my grandmother →
                      </a>
                    </p>
                  )}
                </Fragment>
              ))}
            </div>
            <div style={{ flexShrink: 0, width: 200, height: 240, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
              <Image
                src="/oliver.jpg"
                alt="Oliver Golub, founder of Home Reach"
                width={200}
                height={240}
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center 22%' }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Why we built this</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>The tools to help people find affordable housing never kept pace with the policy. New Jersey&apos;s official search tool, the NJ Housing Resource Center, launched in 2005 and operates primarily as a landlord posting registry. What&apos;s missing is an eligibility-first experience - where a family enters their household profile and sees every program they qualify for, along with every unit and waitlist.</p>
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
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>Every listing in Home Reach comes from a verified public source, and each one shows its source and last-verified date. We do not create or fabricate listings.</p>
          {SOURCE_GROUPS.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', letterSpacing: '0.02em', marginBottom: 8 }}>{group}</p>
              {items.map((source) => (
                <div key={source} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <span style={{ color: '#1E3A5F', marginTop: 2, flexShrink: 0 }}>-</span>
                  <p style={{ fontSize: 15, color: '#475569', margin: 0, lineHeight: 1.5 }}>{source}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid #F1F5F9' }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Data freshness</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Every listing shows a last verified date. Availability and eligibility requirements change. Always confirm directly with the housing provider before applying. Home Reach is an informational tool, not a housing application portal.</p>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 16 }}>Contact</h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>Questions, corrections, or feedback? Email <a href="mailto:olivergolub@homereach.site" style={{ color: '#1E3A5F' }}>olivergolub@homereach.site</a>.</p>
        </div>

        <Link href="/" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← Back to Home Reach</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
