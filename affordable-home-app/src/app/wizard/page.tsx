'use client';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton } from '@/components/wizard/WizardShell';
import { setHouseholdSize } from '@/lib/wizardStore';

const options = [
  { value: 1, label: '1 person' },
  { value: 2, label: '2 people' },
  { value: 3, label: '3 people' },
  { value: 4, label: '4 people' },
  { value: 5, label: '5 people' },
  { value: 6, label: '6+ people' },
];

export default function WizardStep1() {
  const router = useRouter();

  const choose = (value: number) => {
    setHouseholdSize(value);
    posthog.capture('wizard_household_size_selected', { household_size: value, step: 1 });
    router.push('/wizard/step2');
  };

  return (
    <WizardShell step={1}>
      <StepTitle>How many people are in your household?</StepTitle>
      <StepSubtitle>This helps us match you with the most accurate housing programs and listings.</StepSubtitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {options.map((opt) => (
          <OptionButton key={opt.value} selected={false} onClick={() => choose(opt.value)}>
            {opt.label}
          </OptionButton>
        ))}
      </div>
    </WizardShell>
  );
}
