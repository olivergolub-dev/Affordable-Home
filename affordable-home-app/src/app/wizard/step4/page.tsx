"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const towns = [
  "Newark",
  "East Orange",
  "Orange",
  "Irvington",
  "Bloomfield",
  "Montclair",
  "West Orange",
  "Maplewood",
  "South Orange",
  "Nutley",
  "Belleville",
  "Glen Ridge",
  "Caldwell",
  "Verona",
];

const preferences = [
  "Near public transit",
  "Near grocery store",
  "Near school",
  "Near highway",
  "Near park",
  "Other",
];

export default function WizardStep4() {
  const router = useRouter();
  const [selectedTowns, setSelectedTowns] = useState<string[]>([]);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [otherPreference, setOtherPreference] = useState("");

  const toggleTown = (town: string) => {
    setSelectedTowns((current) =>
      current.includes(town) ? current.filter((value) => value !== town) : [...current, town]
    );
  };

  const togglePref = (pref: string) => {
    setSelectedPrefs((current) => {
      const next = current.includes(pref)
        ? current.filter((value) => value !== pref)
        : [...current, pref];

      if (pref === 'Other' && current.includes(pref)) {
        setOtherPreference('');
      }

      return next;
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push('/wizard/step3')}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0DDD8',
                color: '#1D6B4A',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Back
            </button>
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 4 of 7</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '57.1429%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
            Where in Essex County would you like to live?
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 720, lineHeight: 1.75 }}>
            Select all municipalities that interest you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {towns.map((town) => {
            const isActive = selectedTowns.includes(town);
            return (
              <button
                key={town}
                type="button"
                onClick={() => toggleTown(town)}
                className="rounded-3xl text-left px-6 py-5"
                style={{
                  backgroundColor: isActive ? '#E6F4E8' : '#FFFFFF',
                  border: `1px solid ${isActive ? '#1D6B4A' : '#E0DDD8'}`,
                  color: '#1A1A1A',
                  fontSize: 18,
                  fontWeight: 600,
                  boxShadow: '0 20px 40px rgba(29, 107, 74, 0.08)',
                }}
              >
                {town}
              </button>
            );
          })}
        </div>

        <div className="mb-8">
          <h2 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 40, lineHeight: 1.1, color: '#1D6B4A', marginBottom: 18 }}>
            Any location preferences?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {preferences.map((pref) => {
              const isChecked = selectedPrefs.includes(pref);
              return (
                <label
                  key={pref}
                  className="flex items-center rounded-3xl px-5 py-4"
                  style={{
                    backgroundColor: isChecked ? '#E6F4E8' : '#FFFFFF',
                    border: `1px solid ${isChecked ? '#1D6B4A' : '#E0DDD8'}`,
                    cursor: 'pointer',
                    color: '#1A1A1A',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePref(pref)}
                    className="mr-4 h-5 w-5"
                    style={{ accentColor: '#1D6B4A' }}
                  />
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{pref}</span>
                </label>
              );
            })}
          </div>
          {selectedPrefs.includes('Other') && (
            <div className="mt-4">
              <input
                type="text"
                value={otherPreference}
                onChange={(event) => setOtherPreference(event.target.value)}
                placeholder="Type your preference"
                className="w-full rounded-[28px] px-6 py-4"
                style={{
                  border: '1px solid #E0DDD8',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  fontSize: 18,
                  outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => { sessionStorage.setItem("wizard_towns", JSON.stringify(selectedTowns)); router.push('/wizard/step5'); }}
          className="w-full rounded-3xl px-6 py-5"
          style={{
            backgroundColor: '#1D6B4A',
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 700,
            border: 'none',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
