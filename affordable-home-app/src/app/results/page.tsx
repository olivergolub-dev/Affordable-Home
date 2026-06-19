'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

const availabilityOptions = ['All', 'Open', 'Waitlist'];
const bedroomOptions = ['All', 'Studio', '1BR', '2BR', '3BR+'];
const amiOptions = ['All', '30%', '50%', '60%', '80%'];

function formatRent(rent: number | null | undefined) {
  if (rent == null || rent === 0) return 'Contact for rent';
  if (typeof rent === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(rent) + '/mo';
  }
  const normalized = String(rent).trim();
  if (/^\$/.test(normalized)) {
    return normalized.includes('/mo') ? normalized : `${normalized}/mo`;
  }
  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return `$${Number(normalized).toLocaleString('en-US')}/mo`;
  }
  return normalized;
}

function availabilityBadge(waitlistOpen: boolean | string | null | undefined) {
  const isOpen = waitlistOpen === false || String(waitlistOpen) === 'false';
  return {
    label: isOpen ? 'Open' : 'Waitlist',
    bg: isOpen ? '#DCFCE7' : '#FEF3C7',
    text: isOpen ? '#166534' : '#92400E',
  };
}

export default function ResultsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState('All');
  const [bedrooms, setBedrooms] = useState('All');
  const [ami, setAmi] = useState('All');

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Affordable Home')
        .select('name, city, bedrooms, rent, ami_band, wailist_open, application_link, program_type');

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setListings([]);
      } else {
        setListings(data ?? []);
      }
      setLoading(false);
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const waitlistOpen = listing.wailist_open === true || String(listing.wailist_open) === 'true';
      const availabilityMatch =
        availability === 'All' ||
        (availability === 'Open' && waitlistOpen === false) ||
        (availability === 'Waitlist' && waitlistOpen === true);

      const bedroomsMatch = bedrooms === 'All' || String(listing.bedrooms) === bedrooms;

      const normalizedAmi = String(listing.ami_band ?? '').replace('%', '').trim();
      const selectedAmi = ami === 'All' ? '' : ami.replace('%', '');
      const amiMatch = ami === 'All' || normalizedAmi === selectedAmi;

      return availabilityMatch && bedroomsMatch && amiMatch;
    });
  }, [listings, availability, bedrooms, ami]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0', color: '#1A1A1A' }}>
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 52, lineHeight: 1.05, color: '#1D6B4A', marginBottom: 16 }}>
            Your matches in Essex County
          </h1>
          <p style={{ fontSize: 18, color: '#6B6B6B', lineHeight: 1.75, maxWidth: 760 }}>
            Based on your answers, here are the housing options that fit your household.
          </p>
        </div>

        <div className="mb-10 rounded-[28px] border border-[#E0DDD8] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <label style={{ fontSize: 14, color: '#6B6B6B' }}>
                Availability
                <select
                  value={availability}
                  onChange={(event) => setAvailability(event.target.value)}
                  style={{
                    marginLeft: 12,
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: '1px solid #E0DDD8',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A1A',
                    fontSize: 14,
                  }}
                >
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: 14, color: '#6B6B6B' }}>
                Bedrooms
                <select
                  value={bedrooms}
                  onChange={(event) => setBedrooms(event.target.value)}
                  style={{
                    marginLeft: 12,
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: '1px solid #E0DDD8',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A1A',
                    fontSize: 14,
                  }}
                >
                  {bedroomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: 14, color: '#6B6B6B' }}>
                AMI Tier
                <select
                  value={ami}
                  onChange={(event) => setAmi(event.target.value)}
                  style={{
                    marginLeft: 12,
                    padding: '10px 14px',
                    borderRadius: 14,
                    border: '1px solid #E0DDD8',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A1A',
                    fontSize: 14,
                  }}
                >
                  {amiOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ color: '#6B6B6B', fontSize: 14 }}>
              {loading ? 'Loading listings…' : `${filteredListings.length} matches found`}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] bg-[#FEF3F2] p-6 text-[#991B1B] shadow-sm">
            Failed to load listings: {error}
          </div>
        ) : loading ? (
          <div className="rounded-[32px] bg-white p-10 text-center shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <p style={{ fontSize: 18, color: '#4B5563' }}>Loading listings…</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredListings.map((listing) => {
              const badge = availabilityBadge(listing.wailist_open);
              const isOpen = badge.label === 'Open';
              const rentLabel = formatRent(listing.rent);
              const bedroomLabel = listing.bedrooms ? String(listing.bedrooms) : null;
              const amiValue = String(listing.ami_band ?? '').trim();
              const amiLabel = amiValue
                ? amiValue.toUpperCase().includes('AMI')
                  ? amiValue
                  : `${amiValue} AMI`
                : null;

              return (
                <div key={`${listing.name}-${listing.city}-${listing.bedrooms}`} className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>{listing.name}</span>
                        <span style={{ fontSize: 14, color: '#6B6B6B' }}>{listing.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-3" style={{ color: '#4B5563', fontSize: 14 }}>
                        {bedroomLabel ? <span>{bedroomLabel}</span> : null}
                        <span>{rentLabel}</span>
                        {amiLabel ? <span>{amiLabel}</span> : null}
                        {listing.program_type ? <span>{listing.program_type}</span> : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        style={{
                          backgroundColor: isOpen ? '#DCFCE7' : '#FEF3C7',
                          color: isOpen ? '#166534' : '#92400E',
                          borderRadius: 999,
                          padding: '8px 14px',
                          fontSize: 14,
                          fontWeight: 700,
                          minWidth: 88,
                          textAlign: 'center',
                        }}
                      >
                        {badge.label}
                      </span>
                      {listing.application_link ? (
                        <a
                          href={listing.application_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            backgroundColor: '#1D6B4A',
                            color: '#FFFFFF',
                            padding: '12px 22px',
                            borderRadius: 18,
                            fontSize: 14,
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          Apply
                        </a>
                      ) : (
                        <button
                          type="button"
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#1A1A1A',
                            padding: '12px 22px',
                            borderRadius: 18,
                            fontSize: 14,
                            fontWeight: 700,
                            border: '1px solid #E5E7EB',
                          }}
                        >
                          Contact
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
