import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

// One entry per article, newest first. Add future coverage to the top of this
// array — the page renders a card per entry.
const ARTICLES: {
  outlet: string;
  date: string;
  title: string;
  summary: string;
  url: string;
}[] = [
  {
    outlet: 'PRLog',
    date: 'September 28, 2026',
    title: 'HomeReach Launches Free Tool to Simplify Affordable Housing Search in Essex County',
    summary: 'Press release announcing the launch of Home Reach and how it helps Essex County residents find affordable housing they qualify for.',
    url: 'https://www.prlog.org/13173502-homereach-launches-free-tool-to-simplify-affordable-housing-search-in-essex-county.html',
  },
  {
    outlet: 'TAPinto West Orange',
    date: 'September 12, 2026',
    title: 'Following His Grandmother’s Footsteps, High School Student Launches Free Affordable Housing Tool for Essex County',
    summary: 'The story behind Home Reach and founder Oliver Golub, inspired in part by his grandmother Susan Borg, West Orange’s longtime Director of Planning and Development.',
    url: 'https://www.tapinto.net/towns/west-orange/articles/following-his-grandmother-s-footsteps-high-school-student-launches-free-affordable-housing-tool-for-essex-county',
  },
];

export const metadata: Metadata = {
  title: 'Press',
  description:
    'News coverage and press releases about Home Reach, a free affordable-housing eligibility platform for Essex County, NJ.',
};

export default function Press() {
  return (
    <>
      <SiteHeader />
      <main style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#0A1628', marginBottom: 24, lineHeight: 1.2 }}>Press</h1>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 48 }}>
            Coverage of Home Reach and its founder, Oliver Golub. For press inquiries, email{' '}
            <a href="mailto:olivergolub@homereach.site" style={{ color: '#1E3A5F', fontWeight: 500 }}>olivergolub@homereach.site</a>.
          </p>

          {ARTICLES.map((article, i) => (
            <article key={article.url} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i === ARTICLES.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E3A5F', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
                {article.outlet} · <time style={{ fontWeight: 400, color: '#64748B' }}>{article.date}</time>
              </p>
              <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', lineHeight: 1.3, marginBottom: 12 }}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0A1628', textDecoration: 'none' }}>{article.title}</a>
              </h2>
              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 16 }}>{article.summary}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#1E40AF', fontWeight: 600, textDecoration: 'none' }}>
                Read on {article.outlet} ↗
              </a>
            </article>
          ))}

          <Link href="/" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← Back to Home Reach</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
