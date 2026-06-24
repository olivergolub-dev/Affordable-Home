'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

const availabilityOptions = ['All', 'Open', 'Waitlist'];
const bedroomOptions = ['All', 'Studio', '1BR', '2BR', '3BR+'];
const amiOptions = ['All', '30%', '50%', '60%', '80%'];

function formatRent(rent: number | null | undefined) {
  if (rent == null || rent === 0) return 'Contact for rent';
  if (typeof rent === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rent) + '/mo';
  }
  const normalized = String(rent).trim();
  if (/^\$/.test(normalized)) return normalized.includes('/mo') ? normalized : `${normalized}/mo`;
  if (/^\d+(\.\d+)?$/.test(normalized)) return `$${Number(normalized).toLocaleString('en-US')}/mo`;
  return normalized;
}

function availabilityBadge(waitlistOpen: boolean | string | null | undefined) {
  const isOpen = waitlistOpen === false || String(waitlistOpen) === 'false';
  return {
    label: isOpen ? 'Open' : 'Waitlist',
    bg: isOpen ? '#EFF6FF' : '#F0FDF4',
    text: isOpen ? '#1E40AF' : '#166534',
    border: isOpen ? '#BFDBFE' : '#BBF7D0',
  };
}

export default function ResultsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState('All');
  const [bedrooms, setBedrooms] = useState('All');
  const [ami, setAmi] = useState('All');
  const [wizardAnswers, setWizardAnswers] = useState<any>({});

  useEffect(() => {
    const answers = {
      income: sessionStorage.getItem('wizard_income') || '',
      householdSize: JSON.parse(sessionStorage.getItem('wizard_household_size') || '[]'),
      towns: JSON.parse(sessionStorage.getItem('wizard_towns') || '[]'),
      voucher: sessionStorage.getItem('wizard_voucher') || '',
      circumstances: JSON.parse(sessionStorage.getItem('wizard_circumstances') || '[]'),
    };
    setWizardAnswers(answers);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadListings() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('Affordable Home')
        .select('name, city, bedrooms, rent, ami_band, wailist_open, application_link, program_type');
      if (!isMounted) return;
      if (error) { setError(error.message); setListings([]); }
      else { setListings(data ?? []); }
      setLoading(false);
    }
    loadListings();
    return () => { isMounted = false; };
  }, []);

  const getAmiTier = (incomeStr: string) => {
    const income = parseInt(incomeStr.replace(/[^0-9]/g, ''));
    if (!income) return null;
    if (income <= 30450) return '30%';
    if (income <= 50750) return '50%';
    if (income <= 60900) return '60%';
    if (income <= 81200) return '80%';
    return null;
  };

  const filteredListings = useMemo(() => {
    const userAmiTier = getAmiTier(wizardAnswers.income || '');
    const userTowns: string[] = wizardAnswers.towns || [];
    return listings.filter((listing) => {
      const waitlistOpen = listing.wailist_open === true || String(listing.wailist_open) === 'true';
      const townMatch = userTowns.length === 0 ||
        userTowns.some((t: string) => t.toLowerCase().includes('any')) ||
        userTowns.some((t: string) => listing.city?.toLowerCase().includes(t.toLowerCase()));
      const amiMatch = ami === 'All' || !listing.ami_band || listing.ami_band.includes(ami.replace('%', ''));
      const availabilityMatch = availability === 'All' ||
        (availability === 'Open' && !waitlistOpen) ||
        (availability === 'Waitlist' && waitlistOpen);
      const bedroomsMatch = bedrooms === 'All' || listing.bedrooms === null || String(listing.bedrooms) === bedrooms;
      return availabilityMatch && bedroomsMatch && amiMatch && townMatch;
    });
  }, [listings, availability, bedrooms, ami, wizardAnswers]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* NAV */}
      <header style={{ backgroundColor: '#0A1628', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>Affordable Home</span>
          </a>
          <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Retake Quiz
          </a>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05, color: '#0D1117', marginBottom: 8, fontWeight: 400 }}>
            Your matches in Essex County
          </h1>
          <p style={{ fontSize: 16, color: '#64748B' }}>
            Based on your answers, here are the housing options that fit your household.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Availability', value: availability, setter: setAvailability, options: availabilityOptions },
            { label: 'Bedrooms', value: bedrooms, setter: setBedrooms, options: bedroomOptions },
            { label: 'AMI Tier', value: ami, setter: setAmi, options: amiOptions },
          ].map(({ label, value, setter, options }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>{label}</span>
              <select
                value={value}
                onChange={e => setter(e.target.value)}
                style={{ border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 12px', fontSize: 13, color: '#0D1117', backgroundColor: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
              >
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            {loading ? 'Loading...' : `${filteredListings.length} matches found`}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 20px', marginBottom: 24, color: '#DC2626', fontSize: 14 }}>
            Failed to load listings: {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8', fontSize: 15 }}>
            Loading listings...
          </div>
        )}

        {/* No results */}
        {!loading && filteredListings.length === 0 && !error && (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 32px)', textAlign: 'center' }}>
            <p style={{ fontSize: 18, color: '#0D1117', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}>No matches found</p>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>Try adjusting your filters or broadening your location preferences.</p>
            <a href="/wizard" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              Retake the quiz
            </a>
          </div>
        )}

        {/* Listings */}
        {!loading && filteredListings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredListings.map((listing, i) => {
              const badge = availabilityBadge(listing.wailist_open);
              return (
                <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 18, fontWeight: 400, color: '#0D1117' }}>{listing.name}</span>
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>{listing.city}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748B' }}>
                      <span>{formatRent(listing.rent)}</span>
                      {listing.ami_band && <span>{listing.ami_band}</span>}
                      {listing.program_type && <span>{listing.program_type}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600 }}>
                      {badge.label}
                    </span>
                    {listing.application_link ? (
                      <a href={listing.application_link} target="_blank" rel="noopener noreferrer"
                        style={{ backgroundColor: '#1E40AF', color: 'white', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                        Apply
                      </a>
                    ) : (
                      <span style={{ backgroundColor: '#F1F5F9', color: '#94A3B8', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                        No link
                      </span>
                    )}
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
