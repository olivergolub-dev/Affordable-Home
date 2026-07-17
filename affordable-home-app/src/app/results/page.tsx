'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import posthog from 'posthog-js';
import { fetchListings } from '@/lib/listings';
import { matchListings, type MatchResult } from '@/lib/eligibility';
import { readAnswers } from '@/lib/wizardStore';
import type { BedroomToken, WizardAnswers } from '@/lib/types';
import type { AmiBand } from '@/lib/incomeLimits';

const bedroomFilterOptions: { label: string; token: BedroomToken | 'All' }[] = [
  { label: 'All', token: 'All' },
  { label: 'Studio', token: 'Studio' },
  { label: '1BR', token: '1BR' },
  { label: '2BR', token: '2BR' },
  { label: '3BR+', token: '3BR' },
];
const amiFilterOptions: { label: string; band: AmiBand | 'All' }[] = [
  { label: 'All', band: 'All' },
  { label: '30%', band: 30 },
  { label: '50%', band: 50 },
  { label: '60%', band: 60 },
  { label: '80%', band: 80 },
];

function formatRent(rent: number | null): string {
  if (rent == null) return 'Contact for rent';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rent) + '/mo';
}

// Neutral by design: real-time waitlist status isn't verified per-listing, so
// we prompt the user to confirm with the provider rather than assert an
// Open/Waitlist state we can't stand behind.
const STATUS_PILL = {
  label: 'Check status',
  bg: '#FEFCE8',
  text: '#854D0E',
  border: '#FDE68A',
};

// Fit-score tiers. Muted (low-saturation) green/gold/clay — clearly readable
// as green/yellow/red without being loud.
function scoreStyle(score: number): { bg: string; text: string; border: string; label: string } {
  if (score >= 7.5) return { bg: '#E9F0EB', text: '#3D6B4C', border: '#C6DBCC', label: 'Strong match' };
  if (score >= 4.5) return { bg: '#F4EEDC', text: '#87671F', border: '#E3D5AF', label: 'Partial match' };
  return { bg: '#F3E7E4', text: '#98493F', border: '#E1C8C2', label: 'Low match' };
}

function formatVerified(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `Verified ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

/**
 * Every listing gets one real, clickable action — never a dead end. Falls
 * from the most direct (an online application) to the most general (the
 * official source page people can read to find how to apply).
 */
function primaryAction(listing: MatchResult['listing']): {
  label: string;
  href: string;
  event: string;
} {
  if (listing.application_link) {
    return { label: 'Apply', href: listing.application_link, event: 'listing_apply_clicked' };
  }
  if (listing.phone) {
    return { label: `Call ${listing.phone}`, href: `tel:${listing.phone.replace(/[^0-9+]/g, '')}`, event: 'listing_call_clicked' };
  }
  // Guaranteed present — every seeded listing carries a source_url.
  return { label: 'View details', href: listing.source_url ?? '#', event: 'listing_source_clicked' };
}

export default function ResultsPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // answers is read once on mount and never changes for the life of this page,
  // so a lazy initializer (not an effect) is the correct way to seed both it
  // and the bedroom filter that defaults from it.
  const [answers] = useState<WizardAnswers>(() => readAnswers());
  const [bedroomFilter, setBedroomFilter] = useState<BedroomToken | 'All'>(() => answers.bedrooms ?? 'All');
  const [amiFilter, setAmiFilter] = useState<AmiBand | 'All'>('All');

  // A fit score is only meaningful when there's a household profile to score
  // against. On a bare "browse all listings" visit (no quiz answers), every
  // score collapses to the same baseline, so we hide the chip instead of
  // showing a meaningless uniform number.
  const hasProfile =
    answers.householdSize != null ||
    answers.income != null ||
    answers.bedrooms != null ||
    answers.towns.length > 0 ||
    answers.voucher != null ||
    answers.priorityGroups.length > 0;

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const { listings, error: err } = await fetchListings();
      if (!isMounted) return;
      if (err) {
        setError(err);
        setMatches([]);
        posthog.captureException(new Error(err));
      } else {
        const results = matchListings(listings, answers);
        setMatches(results);
        posthog.capture('results_viewed', { listing_count: results.length });
      }
      setLoading(false);
    }
    load();
    return () => { isMounted = false; };
  }, [answers]);

  const filtered = useMemo(() => {
    return matches.filter(({ listing }) => {
      const bedroomMatch =
        bedroomFilter === 'All' ||
        listing.bedroom_types.length === 0 ||
        listing.bedroom_types.includes(bedroomFilter);
      const amiMatch = amiFilter === 'All' || listing.ami_bands.length === 0 || listing.ami_bands.includes(amiFilter);
      return bedroomMatch && amiMatch;
    });
  }, [matches, bedroomFilter, amiFilter]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <header style={{ backgroundColor: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>Home Reach</span>
          </Link>
          <Link href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Retake Quiz
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 8, fontWeight: 400 }}>
            Your matches in Essex County
          </h1>
          <p style={{ fontSize: 16, color: '#334155' }}>
            {answers.income != null
              ? 'Based on your answers, here are the housing options that fit your household.'
              : 'Browsing all listings. Take the eligibility quiz for matches tailored to your household.'}
          </p>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>Bedrooms</span>
            <select
              value={bedroomFilter}
              onChange={(e) => { setBedroomFilter(e.target.value as BedroomToken | 'All'); posthog.capture('results_filter_changed', { filter: 'Bedrooms', value: e.target.value }); }}
              style={{ border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: '#0D1117', backgroundColor: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
            >
              {bedroomFilterOptions.map((o) => <option key={o.token} value={o.token}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>AMI Tier</span>
            <select
              value={amiFilter}
              onChange={(e) => { setAmiFilter(e.target.value === 'All' ? 'All' : (Number(e.target.value) as AmiBand)); posthog.capture('results_filter_changed', { filter: 'AMI Tier', value: e.target.value }); }}
              style={{ border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: '#0D1117', backgroundColor: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
            >
              {amiFilterOptions.map((o) => <option key={o.label} value={o.band}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            {loading ? 'Loading...' : `${filtered.length} matches found`}
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#DC2626', fontSize: 14 }}>
            Failed to load listings: {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', fontSize: 15 }}>
            Loading listings...
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)', textAlign: 'center' }}>
            <p style={{ fontSize: 18, color: '#0D1117', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}>No matches found</p>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Try adjusting your filters or broadening your location preferences.</p>
            <Link href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              Retake the quiz
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(({ listing, score, reasons }) => {
              const badge = STATUS_PILL;
              const verified = formatVerified(listing.last_verified);
              const fit = scoreStyle(score);
              return (
                <div key={listing.id} className="result-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 22px' }}>
                  <div className="result-main">
                    {hasProfile && (
                      <div
                        title={`Fit ${score.toFixed(1)}/10 — ${fit.label}. How well this listing matches your answers.`}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 54, minWidth: 54, height: 54, borderRadius: 10, backgroundColor: fit.bg, color: fit.text, border: `1px solid ${fit.border}`, flexShrink: 0 }}
                      >
                        <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(1)}</span>
                        <span style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3, opacity: 0.75 }}>Fit</span>
                      </div>
                    )}
                    <div className="result-details">
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 18, fontWeight: 400, color: '#0D1117' }}>{listing.name}</span>
                        <span style={{ fontSize: 13, color: '#64748B' }}>{listing.city}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#334155', marginBottom: reasons.length ? 8 : 0, flexWrap: 'wrap' }}>
                        <span>{formatRent(listing.rent)}</span>
                        {listing.ami_bands.length > 0 && <span>{listing.ami_bands.map((b) => `${b}%`).join('/')} AMI</span>}
                        {listing.program_type && <span>{listing.program_type}</span>}
                      </div>
                      {reasons.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          {reasons.map((r) => (
                            <span key={r} style={{ fontSize: 11, color: '#1E40AF', backgroundColor: '#EFF6FF', borderRadius: 4, padding: '2px 8px' }}>{r}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        Source: {listing.source}{verified ? ` · ${verified}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="result-actions">
                    <span style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>
                      {badge.label}
                    </span>
                    {(() => {
                      const action = primaryAction(listing);
                      const isTel = action.href.startsWith('tel:');
                      return (
                        <a
                          href={action.href}
                          {...(isTel ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                          onClick={() => posthog.capture(action.event, { listing_name: listing.name, listing_city: listing.city, program_type: listing.program_type })}
                          style={{ backgroundColor: '#1E40AF', color: 'white', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          {action.label}
                        </a>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
