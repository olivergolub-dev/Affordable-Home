'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton, OptionGroup, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setHouseholdSize } from '@/lib/wizardStore';

// Exact-count presets. "6+" is handled separately so people with large
// households can enter their real number instead of being lumped into one bin.
const presets = [
  { value: 1, label: '1 person' },
  { value: 2, label: '2 people' },
  { value: 3, label: '3 people' },
  { value: 4, label: '4 people' },
  { value: 5, label: '5 people' },
];
const LARGE_MIN = 6;
const LARGE_MAX = 20;

export default function WizardStep1() {
  const router = useRouter();
  // Start with the server-safe default (null) so the server and first client
  // render agree, then hydrate the saved answer after mount. Reading
  // sessionStorage inside the useState initializer instead left `selected`
  // stuck at null on a retake — the option never showed as picked and the
  // Continue button stayed disabled, so the user couldn't proceed.
  const [selected, setSelected] = useState<number | null>(null);
  // Whether the "6+ people" path is active, which reveals the exact-count input.
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const saved = readAnswers().householdSize;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate client-only sessionStorage after mount (the server render can't read it).
    setSelected(saved);
    if (saved != null && saved >= LARGE_MIN) setIsLarge(true);
  }, []);

  const chooseLarge = () => {
    setIsLarge(true);
    // Keep an already-large saved value; otherwise seed the input at the minimum.
    setSelected((prev) => (prev != null && prev >= LARGE_MIN ? prev : LARGE_MIN));
  };

  const choosePreset = (value: number) => {
    setIsLarge(false);
    setSelected(value);
  };

  const onLargeInput = (raw: string) => {
    const n = Number(raw.replace(/[^0-9]/g, ''));
    if (!raw.trim() || Number.isNaN(n)) { setSelected(null); return; }
    setSelected(Math.min(LARGE_MAX, Math.max(LARGE_MIN, n)));
  };

  // Continue is enabled once a valid count exists (and, in the 6+ path, a real
  // number ≥ 6 has been entered).
  const valid = selected != null && (!isLarge || selected >= LARGE_MIN);

  const submit = () => {
    if (!valid || selected == null) return;
    setHouseholdSize(selected);
    posthog.capture('wizard_household_size_selected', { household_size: selected, step: 1 });
    router.push('/wizard/step2');
  };

  return (
    <WizardShell step={1}>
      <StepTitle>How many people are in your household?</StepTitle>
      <StepSubtitle>This helps us match you with the most accurate housing programs and listings.</StepSubtitle>
      <OptionGroup role="radiogroup" label="Household size" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: isLarge ? 20 : 32 }}>
        {presets.map((opt) => (
          <OptionButton key={opt.value} role="radio" selected={!isLarge && selected === opt.value} onClick={() => choosePreset(opt.value)}>
            {opt.label}
          </OptionButton>
        ))}
        <OptionButton role="radio" selected={isLarge} onClick={chooseLarge}>
          6+ people
        </OptionButton>
      </OptionGroup>

      {isLarge && (
        <div style={{ marginBottom: 32 }}>
          <label htmlFor="household-exact" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
            Exactly how many people?
          </label>
          <input
            id="household-exact"
            type="number"
            inputMode="numeric"
            min={LARGE_MIN}
            max={LARGE_MAX}
            value={selected != null && selected >= LARGE_MIN ? selected : ''}
            onChange={(e) => onLargeInput(e.target.value)}
            placeholder="e.g. 7"
            style={{ width: '100%', maxWidth: 220, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '16px 20px', fontSize: 18, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-dm-serif)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Enter the total number of people who will live in the home ({LARGE_MIN}–{LARGE_MAX}).</p>
        </div>
      )}

      <ContinueButton onClick={submit} disabled={!valid}>Continue</ContinueButton>
    </WizardShell>
  );
}
