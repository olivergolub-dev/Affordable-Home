"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  "Senior (62+)",
  "Person with a disability",
  "Veteran",
  "Experiencing homelessness",
  "Fleeing domestic violence",
  "None of the above",
];

export default function WizardStep6() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    if (option === "None of the above") {
      setSelected([option]);
      return;
    }

    setSelected((current) => {
      const next = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current.filter((value) => value !== "None of the above"), option];
      return next;
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="w-full max-w-5xl p-6 sm:p-10" style={{ minHeight: '100vh' }}>
        <div className="mb-10">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push('/wizard/step5')}
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
            <p style={{ margin: 0, color: '#6B6B6B', fontSize: 14 }}>Step 6 of 7</p>
          </div>
          <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: '#E0DDD8', marginBottom: 24 }}>
            <div style={{ width: '85.7143%', height: '100%', backgroundColor: '#1D6B4A' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 56, lineHeight: 1.02, color: '#1D6B4A', marginBottom: 18 }}>
            Do any of these apply to you?
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 18, maxWidth: 720, lineHeight: 1.75 }}>
            Select all that apply. This helps us find programs you may qualify for.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {options.map((option) => {
            const isChecked = selected.includes(option);
            return (
              <label
                key={option}
                className="flex items-center rounded-3xl px-6 py-5"
                style={{
                  backgroundColor: isChecked ? '#E6F4E8' : '#FFFFFF',
                  border: `1px solid ${isChecked ? '#1D6B4A' : '#E0DDD8'}`,
                  color: '#1A1A1A',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(option)}
                  className="mr-4 h-5 w-5"
                  style={{ accentColor: '#1D6B4A' }}
                />
                <span style={{ fontSize: 18, fontWeight: 600 }}>{option}</span>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.push('/wizard/step7')}
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
