import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

// One entry per advisor. Bios are kept as plain strings so apostrophes/quotes
// don't need JSX escaping. Add future advisors to this array — the page renders
// a card per entry.
const ADVISORS: {
  name: string;
  role: string;
  photo: string;
  photoPosition: string;
  bio: string[];
}[] = [
  {
    name: 'Daniel B. Schwartz',
    role: 'Global Venture Builder · International CEO · Investor',
    photo: '/daniel-schwartz.png',
    photoPosition: 'center 20%',
    bio: [
      'Daniel B. Schwartz is an internationally recognized venture builder, executive leader, and investor with more than four decades of experience turning innovative ideas into successful global businesses. He has held executive, board, founder, and advisory roles across North America, Asia, Europe, the Middle East, and Africa, working with everyone from early-stage startups to Fortune 1000 enterprises.',
      'Over his career he has generated more than $150 million in enterprise software and technology sales, led organizations responsible for over $400 million in revenue, and helped secure more than $50 million in growth capital for emerging ventures. His work spans the full venture lifecycle — strategy, fundraising, market entry, partnerships, and commercialization — across AI, enterprise software, FinTech, blockchain, energy, and aviation.',
      'Daniel holds a B.S.E. in Systems Science and Engineering from the University of Pennsylvania and an MBA from Loyola University Maryland. He is an Alumni Ambassador for the University of Pennsylvania and a mentor with Crimson Education, where he works with students and emerging entrepreneurs on leadership and entrepreneurial thinking.',
    ],
  },
  {
    name: 'Herdy',
    role: 'Senior Consultant · Simulation Development Lead · Mentor',
    photo: '/herdy.png',
    photoPosition: 'center 25%',
    bio: [
      'Herdy is a Senior Consultant and Simulation Development Lead who builds simulation-driven decision systems for complex financial and business environments. He has led the development of 12+ production platforms, contributing to over $1M in client revenue impact, and specializes in turning complex financial and Excel-based models into scalable full-stack platforms using MERN and TypeScript.',
      'He holds an MSc in Analytics from Georgia Tech and a BSc (Hons) in Computing and Information Systems from Goldsmiths, University of London. As a mentor, he guides students through the full project lifecycle with an emphasis on first-principles thinking and clean system architecture. His mentees have earned offers from universities including Carnegie Mellon, Johns Hopkins, Imperial College London, and King’s College London.',
    ],
  },
];

export const metadata: Metadata = {
  title: 'Advisors',
  description:
    'The advisors supporting Home Reach, a free affordable-housing eligibility platform for Essex County, NJ.',
};

export default function Advisors() {
  return (
    <>
      <SiteHeader />
      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0A1628', marginBottom: 24, lineHeight: 1.2 }}>Advisors</h1>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 48 }}>Home Reach is guided by advisors who bring decades of leadership, strategy, and venture experience to the mission of making affordable housing easier to find.</p>

          {ADVISORS.map((advisor, i) => (
            <div key={advisor.name} style={{ marginBottom: 48, paddingBottom: 48, borderBottom: i === ADVISORS.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: '#0A1628', marginBottom: 4 }}>{advisor.name}</h2>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F', marginBottom: 20 }}>{advisor.role}</p>
                  {advisor.bio.map((para, j) => (
                    <p
                      key={j}
                      style={{
                        fontSize: 15,
                        color: '#475569',
                        lineHeight: 1.8,
                        marginBottom: j === advisor.bio.length - 1 ? 0 : 16,
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
                <div style={{ flexShrink: 0, width: 200, height: 240, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
                  <Image
                    src={advisor.photo}
                    alt={`${advisor.name}, advisor to Home Reach`}
                    width={200}
                    height={240}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: advisor.photoPosition }}
                  />
                </div>
              </div>
            </div>
          ))}

          <Link href="/" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← Back to Home Reach</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
