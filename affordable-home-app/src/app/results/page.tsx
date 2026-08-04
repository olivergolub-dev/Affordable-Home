'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import posthog from 'posthog-js';
import { fetchListings } from '@/lib/listings';
import { matchListings, type MatchResult } from '@/lib/eligibility';
import { percentOfMedian } from '@/lib/incomeLimits';
import { analytics } from '@/lib/analytics';
import { EMPTY_ANSWERS, readAnswers } from '@/lib/wizardStore';
import { addFavorite, getFavoriteListingIds, removeFavorite } from '@/lib/account';
import { createClient } from '@/lib/supabase/client';
import { markListingOpened } from '@/components/ReturnSurvey';
import { FavoriteButton } from '@/components/FavoriteButton';
import { SaveResultsButton } from '@/components/SaveResultsButton';
import { AccountNav } from '@/components/AccountNav';
import { SiteFooter } from '@/components/SiteFooter';
import type { BedroomToken, Listing, WizardAnswers } from '@/lib/types';
import type { AmiBand } from '@/lib/incomeLimits';

const bedroomFilterOptions: { label: string; token: BedroomToken | 'All' }[] = [
  { label: 'All', token: 'All' },
  { label: 'Studio', token: 'Studio' },
  { label: '1BR', token: '1BR' },
  { label: '2BR', token: '2BR' },
  { label: '3BR', token: '3BR' },
  { label: '4BR+', token: '4BR' },
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

// Fit-score tiers. Muted (low-saturation) green/gold/clay — clearly readable
// as green/yellow/red without being loud.
// Green is 7.0+ (not 7.5): with no listing carrying rent data, the +2.0
// "within budget" bonus never fires, so a strong match caps around 7.2. The
// 7.0 line keeps green meaningful (income + bedroom + town, or a voucher/
// priority match) while making it actually reachable. Raise back toward 7.5
// once rent figures are populated.
function scoreStyle(score: number): { bg: string; text: string; border: string; label: string } {
  if (score >= 7) return { bg: '#E9F0EB', text: '#3D6B4C', border: '#C6DBCC', label: 'Strong match' };
  if (score >= 4) return { bg: '#F4EEDC', text: '#87671F', border: '#E3D5AF', label: 'Partial match' };
  return { bg: '#F3E7E4', text: '#98493F', border: '#E1C8C2', label: 'Low match' };
}

function formatVerified(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `Verified ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

interface ListingAction {
  label: string;
  href: string;
  event: string;
  /** 'primary' = filled blue CTA; 'secondary' = outlined website link. */
  variant: 'primary' | 'secondary';
  /** External (website) links open in a new tab; tel: links do not. */
  external: boolean;
}

/**
 * Every listing gets at least one real, clickable action — never a dead end —
 * and, wherever possible, a way to SEE the listing (a website) before acting.
 *
 * Website-first ordering ("see it before you call"):
 *   1. Apply        — a dedicated online application, when one exists.
 *   2. View details — the official source page, so a phone-only listing can
 *      still be read before the user picks up the phone. Present on nearly
 *      every listing (all seeded rows carry a source_url).
 *   3. Call         — the listing's phone number, shown last.
 *
 * When a website link is the only action, it becomes the primary CTA;
 * otherwise "View details" stays a quieter secondary next to Apply/Call.
 */
function listingActions(listing: MatchResult['listing']): ListingAction[] {
  const actions: ListingAction[] = [];
  const hasPhone = Boolean(listing.phone);

  if (listing.application_link) {
    actions.push({ label: 'Apply', href: listing.application_link, event: 'listing_apply_clicked', variant: 'primary', external: true });
  }

  // Offer the source page as "View details" whenever it isn't already the
  // Apply link. It's the primary CTA only when there's no Apply and no phone.
  if (listing.source_url && listing.source_url !== listing.application_link) {
    const soleAction = !listing.application_link && !hasPhone;
    actions.push({ label: 'View details', href: listing.source_url, event: 'listing_source_clicked', variant: soleAction ? 'primary' : 'secondary', external: true });
  }

  if (hasPhone) {
    actions.push({ label: `Call ${listing.phone}`, href: `tel:${listing.phone!.replace(/[^0-9+]/g, '')}`, event: 'listing_call_clicked', variant: 'primary', external: false });
  }

  // Absolute fallback — should never fire, since every seeded listing carries
  // a source_url, but guarantees no card is ever a dead end.
  if (actions.length === 0) {
    actions.push({ label: 'View details', href: listing.source_url ?? '#', event: 'listing_source_clicked', variant: 'primary', external: true });
  }

  return actions;
}

export default function ResultsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Account state for saving/favoriting listings. Signed-out users still see
  // the heart; clicking it sends them to log in.
  const [loggedIn, setLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favBusy, setFavBusy] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setLoggedIn(!!data.user);
      if (data.user) {
        const ids = await getFavoriteListingIds();
        if (active) setFavorites(new Set(ids));
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      if (!session?.user) {
        setFavorites(new Set());
      } else {
        getFavoriteListingIds().then((ids) => setFavorites(new Set(ids)));
      }
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  async function toggleFavorite(listingId: string) {
    if (!loggedIn) { router.push('/login'); return; }
    if (favBusy) return;
    const isFav = favorites.has(listingId);
    setFavBusy(listingId);
    // Optimistic update; revert on failure.
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(listingId); else next.add(listingId);
      return next;
    });
    const { error } = isFav ? await removeFavorite(listingId) : await addFavorite(listingId);
    if (error) {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(listingId); else next.delete(listingId);
        return next;
      });
    } else {
      posthog.capture(isFav ? 'listing_unfavorited' : 'listing_favorited', { listing_id: listingId });
    }
    setFavBusy(null);
  }
  // answers must default to the empty profile so the server render and the
  // first client render agree; the saved profile is hydrated from
  // sessionStorage in an effect after mount (see below). Reading storage in a
  // lazy initializer instead made a hard refresh of this page fall back to the
  // "All listings" view — the personalized "for me" matches were lost.
  const [answers, setAnswers] = useState<WizardAnswers>(EMPTY_ANSWERS);

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

  // 'me' = listings matched to the eligibility answers (filtered + scored);
  // 'all' = the full registry, unfiltered. These all start at their
  // server-safe defaults so the server and first client render agree; the real
  // values (from the saved profile and the URL) are applied on mount below.
  const [view, setView] = useState<'me' | 'all'>('all');
  const [bedroomFilter, setBedroomFilter] = useState<BedroomToken | 'All'>('All');
  const [amiFilter, setAmiFilter] = useState<AmiBand | 'All'>('All');
  const [townFilter, setTownFilter] = useState<string>('All');

  // Hydrate from sessionStorage + URL once, after mount. This is what makes a
  // hard refresh / bookmark of /results keep the personalized "for me" view:
  // reading the profile during render (server-side) yields the empty profile,
  // so the defaults must be corrected here on the client.
  useEffect(() => {
    // The setState calls below intentionally run once on mount to hydrate
    // client-only sessionStorage + URL state that the server render can't see.
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = readAnswers();
    setAnswers(saved);
    const savedHasProfile =
      saved.householdSize != null ||
      saved.income != null ||
      saved.bedrooms != null ||
      saved.towns.length > 0 ||
      saved.voucher != null ||
      saved.priorityGroups.length > 0;

    // A ?view= override (e.g. the homepage "All listings" card) wins; otherwise
    // default to the personalized view when a saved profile exists.
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const nextView: 'me' | 'all' =
      viewParam === 'all' ? 'all' : viewParam === 'me' ? 'me' : savedHasProfile ? 'me' : 'all';
    setView(nextView);
    // Bedroom filter defaults to the quiz answer in the "for me" view, but to
    // "All" in the "all listings" view so it genuinely shows everything.
    setBedroomFilter(nextView === 'all' ? 'All' : (saved.bedrooms ?? 'All'));

    // ?town= deep links (e.g. the homepage coverage tiles →
    // /results?view=all&town=West+Orange).
    const t = params.get('town');
    if (t) setTownFilter(t);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const { listings: data, error: err } = await fetchListings();
      if (!isMounted) return;
      if (err) {
        setError(err);
        setListings([]);
        posthog.captureException(new Error(err));
      } else {
        setListings(data);
        posthog.capture('results_viewed', { listing_count: data.length });
      }
      setLoading(false);
    }
    load();
    return () => { isMounted = false; };
    // Listings are fetched once on mount; the fetch doesn't depend on the
    // profile (matching happens client-side in the `forMe` memo below), so it
    // must not re-run when `answers` hydrates from storage.
  }, []);

  const forMe = useMemo(() => matchListings(listings, answers), [listings, answers]);
  const all = useMemo<MatchResult[]>(
    () =>
      [...listings]
        .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))
        .map((listing) => ({ listing, score: 0, reasons: [] })),
    [listings],
  );

  const base = view === 'me' ? forMe : all;
  const showFit = view === 'me' && hasProfile;

  // Fire eligibility_calculated once, after the profile hydrates and listings
  // load, so we can measure who ends up with zero matches. All values bucketed.
  const firedEligibility = useRef(false);
  useEffect(() => {
    if (loading || !hasProfile || firedEligibility.current) return;
    firedEligibility.current = true;
    const amiPct =
      answers.income != null && answers.householdSize != null
        ? percentOfMedian(answers.income, answers.householdSize)
        : null;
    analytics.eligibilityCalculated({
      amiPct,
      householdSize: answers.householdSize,
      matchCount: forMe.length,
      topScore: forMe[0]?.score ?? null,
      hasVoucher: answers.voucher === 'yes',
      municipality: answers.towns.length > 0 ? answers.towns[0] : 'any',
    });
  }, [loading, hasProfile, answers, forMe]);

  // Towns that actually have listings, plus the active filter (so a ?town= for
  // a town with zero listings still renders as the selected option).
  const townOptions = useMemo(() => {
    const set = new Set(listings.map((l) => l.city).filter(Boolean));
    if (townFilter !== 'All') set.add(townFilter);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [listings, townFilter]);

  const filtered = useMemo(() => {
    return base.filter(({ listing }) => {
      const bedroomMatch =
        bedroomFilter === 'All' ||
        listing.bedroom_types.length === 0 ||
        listing.bedroom_types.includes(bedroomFilter);
      const amiMatch = amiFilter === 'All' || listing.ami_bands.length === 0 || listing.ami_bands.includes(amiFilter);
      const townMatch = townFilter === 'All' || listing.city === townFilter;
      return bedroomMatch && amiMatch && townMatch;
    });
  }, [base, bedroomFilter, amiFilter, townFilter]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <AccountNav />
            <Link href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Retake Quiz
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 8, fontWeight: 400 }}>
            {townFilter !== 'All'
              ? `Affordable listings in ${townFilter}`
              : view === 'all' ? 'All listings in Essex County' : 'Your matches in Essex County'}
          </h1>
          <p style={{ fontSize: 16, color: '#334155' }}>
            {townFilter !== 'All'
              ? `Every affordable housing listing we track in ${townFilter}, Essex County.`
              : view === 'all'
                ? 'Every affordable housing listing we track across Essex County.'
                : hasProfile
                  ? 'Based on your answers, here are the housing options that fit your household.'
                  : 'Take the eligibility quiz to see listings matched to your household.'}
          </p>
        </div>

        {/* View toggle: personalized matches vs. the full registry */}
        <div role="tablist" aria-label="Listing view" style={{ display: 'inline-flex', gap: 4, backgroundColor: '#EEF2F7', borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {([['me', 'Listings for me'], ['all', 'All listings']] as const).map(([key, label]) => {
            const active = view === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setView(key);
                  // Reset filters so each view starts clean: "All listings" shows
                  // everything; "Listings for me" defaults to the quiz bedroom answer.
                  setBedroomFilter(key === 'all' ? 'All' : (answers.bedrooms ?? 'All'));
                  setAmiFilter('All');
                  posthog.capture('results_view_changed', { view: key });
                }}
                style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, backgroundColor: active ? '#FFFFFF' : 'transparent', color: active ? '#0D1117' : '#64748B', boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>Town</span>
            <select
              value={townFilter}
              onChange={(e) => { setTownFilter(e.target.value); posthog.capture('results_filter_changed', { filter: 'Town', value: e.target.value }); }}
              style={{ border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: '#0D1117', backgroundColor: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All towns</option>
              {townOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            {hasProfile && <SaveResultsButton answers={answers} loggedIn={loggedIn} />}
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
              {loading ? 'Loading...' : `${filtered.length} ${view === 'all' ? 'listings' : 'matches'}`}
            </span>
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

        {/* "Listings for me" with no quiz answers yet — prompt to take it. */}
        {!loading && !error && view === 'me' && !hasProfile && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)', textAlign: 'center' }}>
            <p style={{ fontSize: 18, color: '#0D1117', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}>See listings matched to you</p>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Answer seven quick questions and we&apos;ll rank every listing by how well it fits your household.</p>
            <Link href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              Check my eligibility
            </Link>
          </div>
        )}

        {!loading && (view === 'all' || hasProfile) && filtered.length === 0 && !error && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)', textAlign: 'center' }}>
            {townFilter !== 'All' ? (
              <>
                <p style={{ fontSize: 18, color: '#0D1117', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}>No listings in {townFilter} yet</p>
                <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>We don&apos;t track any affordable listings in {townFilter} right now. Browse every town, or check nearby Essex County municipalities.</p>
                <button onClick={() => { setTownFilter('All'); setBedroomFilter('All'); setAmiFilter('All'); }} style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  View all towns
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 18, color: '#0D1117', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}>No matches found</p>
                <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Try adjusting your filters or broadening your location preferences.</p>
                <Link href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                  Retake the quiz
                </Link>
              </>
            )}
          </div>
        )}

        {!loading && (view === 'all' || hasProfile) && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(({ listing, score, reasons }) => {
              const verified = formatVerified(listing.last_verified);
              const fit = scoreStyle(score);
              return (
                <div key={listing.id} className="result-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 22px' }}>
                  <div className="result-main">
                    {showFit && (
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
                        // Masked in session replay: reasons include the AMI %
                        // derived from the user's income.
                        <div data-ph-mask style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
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
                    <FavoriteButton
                      favorited={favorites.has(listing.id)}
                      busy={favBusy === listing.id}
                      onToggle={() => toggleFavorite(listing.id)}
                      label={listing.name}
                    />
                    {listingActions(listing).map((action) => {
                      const primary = action.variant === 'primary';
                      return (
                        <a
                          key={action.href + action.label}
                          href={action.href}
                          {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          onClick={() => {
                            // Opening a listing in a new tab arms the "did we help?"
                            // survey shown when the user refocuses this tab.
                            if (action.external) markListingOpened();
                            posthog.capture(action.event, { listing_name: listing.name, listing_city: listing.city, program_type: listing.program_type });
                          }}
                          style={{
                            backgroundColor: primary ? '#1E40AF' : '#EFF6FF',
                            color: primary ? '#FFFFFF' : '#1E40AF',
                            border: primary ? '1px solid #1E40AF' : '1px solid #DBEAFE',
                            padding: '10px 20px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {action.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
