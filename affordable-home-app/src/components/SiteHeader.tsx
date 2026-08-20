'use client';

import Link from 'next/link';
import { useState } from 'react';
import posthog from 'posthog-js';
import { AccountNav } from '@/components/AccountNav';

/**
 * Site-wide navigation. Single source of truth for the top-nav links, shared
 * by the homepage and every content page (About, Privacy, Advisors) so the nav
 * is identical everywhere and edited in one place. The `hide-mobile` /
 * `show-mobile` classes (globals.css) drive the responsive menu.
 */
export const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Listings', href: '/results' },
  { label: 'Guide', href: '/guide' },
  { label: 'How it works', href: '/#how' },
  { label: 'Coverage', href: '/#coverage' },
  { label: 'About', href: '/about' },
  { label: 'Advisors', href: '/advisors' },
  { label: 'Data sources', href: '/about#sources' },
  { label: 'Privacy', href: '/privacy' },
];

function Logo() {
  return (
    <Link href="/" aria-label="Home Reach — back to home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Home Reach</span>
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <nav className="hide-mobile" style={{ display: 'flex', gap: 22, alignItems: 'center', marginLeft: 'auto', marginRight: 24 }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap' }}>{link.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <span className="hide-mobile"><AccountNav /></span>
          <a href="/wizard" onClick={() => posthog.capture('eligibility_wizard_started', { source: 'nav' })} style={{ backgroundColor: '#1E40AF', color: 'white', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Check Eligibility
          </a>
          <button
            className="show-mobile"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: 8, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen
                ? <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                : <path d="M4 7h16M4 12h16M4 17h16" stroke="white" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="show-mobile" aria-label="Site" style={{ flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px clamp(16px, 4vw, 32px) 16px' }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{link.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
