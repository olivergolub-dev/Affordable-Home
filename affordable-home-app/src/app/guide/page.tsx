import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import type { Components } from 'react-markdown';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PrintGuideButton } from '@/components/PrintGuideButton';

/**
 * The starter guide, published as a real HTML page — ungated, on purpose.
 *
 * Why HTML and not just a PDF: search engines rank PDFs poorly, so the page is
 * how someone searching "Essex County section 8 waitlist" finds us at all;
 * it reflows on the phones this audience actually uses; browser translation
 * works on a page and not on a PDF, which matters in the Ironbound; and when
 * HUD updates income limits each spring we change one file instead of
 * abandoning every PDF ever downloaded.
 *
 * Nothing here is behind an email form. Section 10 tells someone facing
 * eviction to call 211 — that must never be gated.
 *
 * src/content/starter-guide.md is the single source of truth. Anything that
 * later generates a PDF must read that same file, or the income limits will
 * drift into two versions.
 */

const SOURCE = readFileSync(path.join(process.cwd(), 'src/content/starter-guide.md'), 'utf8');

export const metadata: Metadata = {
  title: 'Essex County Affordable Housing Starter Guide',
  description:
    'How to apply for Section 8, affordable apartments, and Mount Laurel housing in Essex County, NJ — what to apply for, in what order, and the documents you need. Free, no account required.',
  alternates: { canonical: 'https://homereach.site/guide' },
  openGraph: {
    type: 'article',
    url: 'https://homereach.site/guide',
    title: 'Essex County Affordable Housing Starter Guide',
    description:
      'What to apply for, in what order, and what you will need. A free guide to affordable housing and Section 8 in Essex County, New Jersey.',
  },
};

// Bare phone numbers and domains in the source become tappable links here.
// Someone reading this on a phone in a housing crisis should be one tap from
// 211 or Legal Services, not copying digits by hand.
const DOMAINS: Record<string, string> = {
  'homereach.site': 'https://homereach.site',
  'njhousing.gov': 'https://njhousing.gov',
  'affordablehomesnewjersey.com': 'https://affordablehomesnewjersey.com',
  'piazzanj.com': 'https://piazzanj.com',
  'affordablehousingonline.com': 'https://affordablehousingonline.com',
  'waitlistcheck.com': 'https://waitlistcheck.com',
  'nj211.org': 'https://nj211.org',
  'lsnjlaw.org': 'https://lsnjlaw.org',
  'reportfraud.ftc.gov': 'https://reportfraud.ftc.gov',
  'NJCivilRights.gov': 'https://njcivilrights.gov',
  'nj.gov/dca': 'https://nj.gov/dca',
};

const PHONE = String.raw`(?:1-)?\(?\d{3}\)?[\s.-]\d{3}-\d{4}`;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * One pass, longest-match-first, so a match is never re-processed — otherwise
 * linkifying `nj.gov` would corrupt the `nj.gov/dca` link made moments before.
 */
function linkify(md: string): string {
  const domains = Object.keys(DOMAINS).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${PHONE})|(${domains.map(escapeRegExp).join('|')})`, 'g');

  return md.replace(pattern, (match, phone: string | undefined) => {
    if (phone) {
      const digits = phone.replace(/[^0-9]/g, '');
      const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
      return `[${phone}](tel:+1${national})`;
    }
    const href = DOMAINS[match];
    return href ? `[${match}](${href})` : match;
  });
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Flatten a heading's React children back to plain text so it can be slugged. */
function nodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

const SECTIONS = Array.from(SOURCE.matchAll(/^## (.+)$/gm)).map((m) => m[1].trim());

// Split the title block off the body so the contents list can sit AFTER the
// title and standfirst, where a reader expects it, rather than above them.
const SEPARATOR = '\n---\n';
const splitAt = SOURCE.indexOf(SEPARATOR);
const INTRO_MD = linkify(splitAt > -1 ? SOURCE.slice(0, splitAt) : SOURCE);
const BODY_MD = linkify(splitAt > -1 ? SOURCE.slice(splitAt + SEPARATOR.length) : '');

// Long-form reading: ~68 characters per line, 17px base, generous leading.
const PROSE_MAX = 680;

const MD_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 6vw, 2.9rem)', lineHeight: 1.1, fontWeight: 400, color: '#0D1117', margin: '0 0 16px' }}>{children}</h1>
  ),
  h2: ({ children }) => {
    const text = nodeText(children);
    return (
      <h2 id={slugify(text)} style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', lineHeight: 1.2, fontWeight: 400, color: '#0D1117', margin: '52px 0 16px', scrollMarginTop: 84 }}>{children}</h2>
    );
  },
  h3: ({ children }) => (
    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0D1117', margin: '32px 0 10px', lineHeight: 1.4 }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ fontSize: 17, lineHeight: 1.75, color: '#334155', margin: '0 0 18px' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ fontSize: 17, lineHeight: 1.75, color: '#334155', margin: '0 0 20px', paddingLeft: 22, display: 'grid', gap: 8 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ fontSize: 17, lineHeight: 1.75, color: '#334155', margin: '0 0 20px', paddingLeft: 22, display: 'grid', gap: 8 }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ paddingLeft: 2 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ color: '#0D1117', fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: '#475569' }}>{children}</em>,
  a: ({ href, children }) => {
    const external = !!href && !href.startsWith('tel:') && !href.startsWith('#');
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        style={{ color: '#1E40AF', textDecoration: 'underline', textUnderlineOffset: 2, fontWeight: 500 }}
      >
        {children}
      </a>
    );
  },
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '40px 0' }} />,
  // Tables must scroll on their own — the income-limit table is four columns
  // wide and the page must never scroll sideways.
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0 0 22px', border: '1px solid #E2E8F0', borderRadius: 10 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 15 }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: '#F8FAFC' }}>{children}</thead>,
  th: ({ children }) => (
    <th style={{ textAlign: 'left', padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#0D1117', borderBottom: '1px solid #E2E8F0' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '11px 14px', color: '#334155', borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>{children}</td>
  ),
};

/** Shared renderer, so the intro block and the body style identically. */
function GuideMarkdown({ children }: { children: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      // react-markdown's sanitizer drops tel: links, which would leave every
      // phone number in this guide untappable. Allow that one scheme through
      // and keep the default sanitizing for everything else.
      urlTransform={(url) => (url.startsWith('tel:') ? url : defaultUrlTransform(url))}
      components={MD_COMPONENTS}
    >
      {children}
    </Markdown>
  );
}

export default function GuidePage() {
  return (
    <>
      <div className="guide-chrome">
        <SiteHeader />
      </div>

      <main style={{ backgroundColor: '#FFFFFF', padding: 'clamp(28px, 5vw, 56px) clamp(18px, 5vw, 32px) 64px' }}>
        <div style={{ maxWidth: PROSE_MAX, margin: '0 auto' }}>
          {/* Label + provenance, above the guide's own title. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: '#1E40AF', background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 999, padding: '5px 12px' }}>
              Free guide
            </span>
            <span style={{ fontSize: 13, color: '#64748B' }}>Updated August 2026 · 10 minute read</span>
          </div>

          <article className="guide-body">
            <GuideMarkdown>{INTRO_MD}</GuideMarkdown>
          </article>

          {/* Jump links — this runs long, and most readers arrive on a phone. */}
          <nav aria-label="Sections" className="guide-chrome" style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 22px', margin: '28px 0 8px', background: '#F8FAFC' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: 12 }}>
              What&rsquo;s in this guide
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 7 }}>
              {SECTIONS.map((s) => (
                <li key={s} style={{ fontSize: 14, lineHeight: 1.5 }}>
                  <a href={`#${slugify(s)}`} style={{ color: '#1E40AF', textDecoration: 'none' }}>
                    {s.replace(/^\d+\.\s*/, '')}
                  </a>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 18 }}>
              <PrintGuideButton variant="quiet" />
            </div>
          </nav>

          <article className="guide-body">
            <GuideMarkdown>{BODY_MD}</GuideMarkdown>
          </article>

          {/* Closing actions */}
          <div className="guide-chrome" style={{ marginTop: 44, padding: '26px 24px', border: '1px solid #E2E8F0', borderRadius: 12, background: '#F8FAFC' }}>
            <p style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 20, color: '#0D1117', marginBottom: 8 }}>
              See which programs match your household
            </p>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.65, marginBottom: 20 }}>
              This guide explains the system. The checker tells you where you personally fit &mdash; free, and no account needed.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '13px 26px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
                Check my eligibility
              </a>
              <PrintGuideButton variant="quiet" />
            </div>
          </div>
        </div>
      </main>

      <div className="guide-chrome">
        <SiteFooter />
      </div>

      {/* Printing this should produce the guide, not the website around it. */}
      <style>{`
        @media print {
          .guide-chrome { display: none !important; }
          .guide-body { font-size: 11pt; }
          .guide-body h2 { page-break-after: avoid; }
          .guide-body table, .guide-body ul, .guide-body ol { page-break-inside: avoid; }
          main { padding: 0 !important; }
          a { text-decoration: none !important; color: #000 !important; }
        }
      `}</style>
    </>
  );
}
