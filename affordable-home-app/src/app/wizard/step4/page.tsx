'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton, OptionGroup, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setTowns } from '@/lib/wizardStore';

const towns = ['Any Essex County municipality', 'Newark', 'East Orange', 'Irvington', 'Orange', 'West Orange', 'Montclair', 'Bloomfield', 'Belleville', 'Nutley', 'Maplewood', 'South Orange', 'Livingston', 'Caldwell', 'Verona', 'Cedar Grove', 'Glen Ridge', 'Essex Fells', 'Fairfield', 'Millburn', 'North Caldwell', 'Roseland', 'West Caldwell'];

export default function WizardStep4() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(() => readAnswers().towns);

  useEffect(() => {
    if (readAnswers().householdSize == null) router.replace('/wizard');
  }, [router]);

  const toggle = (t: string) => setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = () => {
    setTowns(selected);
    posthog.capture('wizard_towns_selected', { towns: selected, town_count: selected.length, step: 4 });
    router.push('/wizard/step5');
  };

  return (
    <WizardShell step={4} backHref="/wizard/step3">
      <StepTitle>Where in Essex County are you looking?</StepTitle>
      <StepSubtitle>Select all that apply. Leave blank to see all municipalities.</StepSubtitle>
      <OptionGroup role="group" label="Municipalities" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
        {towns.map((town) => (
          <OptionButton key={town} role="checkbox" selected={selected.includes(town)} onClick={() => toggle(town)}>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13 }}>{town}</span>
          </OptionButton>
        ))}
      </OptionGroup>
      <ContinueButton onClick={submit}>Continue</ContinueButton>
    </WizardShell>
  );
}
