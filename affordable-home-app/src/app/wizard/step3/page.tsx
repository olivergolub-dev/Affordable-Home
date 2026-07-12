'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton } from '@/components/wizard/WizardShell';
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
  const [selected] = useState<BedroomToken | null>(() => readAnswers().bedrooms);

  useEffect(() => {
    if (readAnswers().householdSize == null) router.replace('/wizard');
  }, [router]);

  const choose = (token: BedroomToken, label: string) => {
    setBedrooms(token);
    posthog.capture('wizard_bedrooms_selected', { bedrooms: label, step: 3 });
    router.push('/wizard/step4');
  };

  return (
    <WizardShell step={3} backHref="/wizard/step2">
      <StepTitle>How many bedrooms do you need?</StepTitle>
      <StepSubtitle>Select the option that best fits your household.</StepSubtitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {options.map((opt) => (
          <OptionButton key={opt.token} selected={selected === opt.token} onClick={() => choose(opt.token, opt.label)}>
            {opt.label}
          </OptionButton>
        ))}
      </div>
    </WizardShell>
  );
}
