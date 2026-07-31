'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton, OptionGroup, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setBedrooms } from '@/lib/wizardStore';
import type { BedroomToken } from '@/lib/types';

// Friendly wizard labels mapped to canonical bedroom tokens used for matching.
// '3BR' is an exact match; '4BR' means "4 or more". See bedroomMatches() in
// src/lib/eligibility.ts.
const options: { label: string; token: BedroomToken }[] = [
  { label: 'Studio', token: 'Studio' },
  { label: '1 bedroom', token: '1BR' },
  { label: '2 bedrooms', token: '2BR' },
  { label: '3 bedrooms', token: '3BR' },
  { label: '4+ bedrooms', token: '4BR' },
];

export default function WizardStep3() {
  const router = useRouter();
  // Default to null (server-safe), then hydrate the saved answer after mount.
  // Reading storage in the useState initializer left this stuck at null on a
  // retake, disabling Continue. See src/app/wizard/page.tsx for the full note.
  const [selected, setSelected] = useState<BedroomToken | null>(null);

  useEffect(() => {
    if (readAnswers().householdSize == null) { router.replace('/wizard'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate client-only sessionStorage after mount (the server render can't read it).
    setSelected(readAnswers().bedrooms);
  }, [router]);

  const submit = () => {
    if (selected == null) return;
    setBedrooms(selected);
    posthog.capture('wizard_bedrooms_selected', { bedrooms: selected, step: 3 });
    router.push('/wizard/step4');
  };

  return (
    <WizardShell step={3} backHref="/wizard/step2">
      <StepTitle>How many bedrooms do you need?</StepTitle>
      <StepSubtitle>Select the option that best fits your household.</StepSubtitle>
      <OptionGroup role="radiogroup" label="Bedrooms needed" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {options.map((opt) => (
          <OptionButton key={opt.token} role="radio" selected={selected === opt.token} onClick={() => setSelected(opt.token)}>
            {opt.label}
          </OptionButton>
        ))}
      </OptionGroup>
      <ContinueButton onClick={submit} disabled={selected == null}>Continue</ContinueButton>
    </WizardShell>
  );
}
