"use client";

import { useMemo, useState } from "react";

const listings = [
  {
    name: "Arlington Grove Apts",
    town: "East Orange",
    bedrooms: "2BR",
    rent: "$1,520",
    ami: "60%",
    fitScore: 8,
    availability: "Open",
  },
  {
    name: "Berkeley Terrace Apts",
    town: "Irvington",
    bedrooms: "3BR+",
    rent: "$1,960",
    ami: "50%",
    fitScore: 6,
    availability: "Open",
  },
  {
    name: "Clinton Hill Community Apts",
    town: "Newark",
    bedrooms: "1BR",
    rent: "$1,210",
    ami: "30%",
    fitScore: 5,
    availability: "Waitlist",
  },
];

const availabilityOptions = ["All", "Open", "Waitlist"];
const bedroomOptions = ["All", "Studio", "1BR", "2BR", "3BR+"];
const amiOptions = ["All", "30%", "50%", "60%", "80%"];

function scoreColor(score: number) {
  if (score >= 7) return '#047857';
  if (score >= 4) return '#D97706';
  return '#B91C1C';
}

export default function ResultsPage() {
  const [availability, setAvailability] = useState('All');
  const [bedrooms, setBedrooms] = useState('All');
  const [ami, setAmi] = useState('All');

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const availabilityMatch = availability === 'All' || listing.availability === availability;
      const bedroomsMatch = bedrooms === 'All' || listing.bedrooms === bedrooms;
      const amiMatch = ami === 'All' || listing.ami === ami;
      return availabilityMatch && bedroomsMatch && amiMatch;
    });
  }, [availability, bedrooms, ami]);

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
            <div className="flex items-center gap-4">
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
                    <option key={option} value={option}>{option}</option>
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
                    <option key={option} value={option}>{option}</option>
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
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ color: '#6B6B6B', fontSize: 14 }}>
              {filteredListings.length} matches found
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.name} className="rounded-[32px] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>{listing.name}</span>
                    <span style={{ fontSize: 14, color: '#6B6B6B' }}>{listing.town}</span>
                  </div>
                  <div className="flex flex-wrap gap-3" style={{ color: '#4B5563', fontSize: 14 }}>
                    <span>{listing.bedrooms}</span>
                    <span>{listing.rent}</span>
                    <span>{listing.ami} AMI</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    style={{
                      backgroundColor: scoreColor(listing.fitScore) + '20',
                      color: scoreColor(listing.fitScore),
                      borderRadius: 999,
                      padding: '8px 14px',
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: 96,
                      textAlign: 'center',
                    }}
                  >
                    Fit Score {listing.fitScore}
                  </span>
                  <span
                    style={{
                      backgroundColor: listing.availability === 'Open' ? '#DCFCE7' : '#FEF3C7',
                      color: listing.availability === 'Open' ? '#166534' : '#92400E',
                      borderRadius: 999,
                      padding: '8px 14px',
                      fontSize: 14,
                      fontWeight: 700,
                      minWidth: 88,
                      textAlign: 'center',
                    }}
                  >
                    {listing.availability}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p style={{ fontSize: 14, color: '#6B6B6B', maxWidth: 540 }}>
                  A verified affordable listing matched to your household based on local AMI and availability.
                </p>
                <button
                  type="button"
                  style={{
                    backgroundColor: '#1D6B4A',
                    color: '#FFFFFF',
                    padding: '12px 22px',
                    borderRadius: 18,
                    fontSize: 14,
                    fontWeight: 700,
                    border: 'none',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
