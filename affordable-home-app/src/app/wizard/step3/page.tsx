'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton, OptionGroup, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setBedrooms } from '@/lib/wizardStore';
import type { BedroomToken } from '@/lib/types';

// Friendly wizard labels mapped to canonical bedroom tokens used for matching.
// '3BR' means "3 or more" — see bedroomMatches() in src/lib/eligibility.ts.
const options: { label: string; token: BedroomToken }[] = [
  { label: 'Studio', token: 'Studio' },
  { label: '1 bedroom', token: '1BR' },
  { label: '2 bedrooms', token: '2BR' },
  { label: '3+ bedrooms', token: '3BR' },
];

export default function WizardStep3() {
  const router = useRouter();
  const [selected, setSelected] = useState<BedroomToken | null>(() => readAnswers().bedrooms);

  useEffect(() => {
    if (readAnswers().householdSize == null) router.replace('/wizard');
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
