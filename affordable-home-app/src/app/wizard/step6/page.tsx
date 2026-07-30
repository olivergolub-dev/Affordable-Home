'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton, OptionGroup, ContinueButton } from '@/components/wizard/WizardShell';
import { readAnswers, setPriorityGroups } from '@/lib/wizardStore';
import type { PriorityGroup } from '@/lib/types';

const options: { label: string; value: PriorityGroup }[] = [
  { label: 'Senior (62+)', value: 'senior' },
  { label: 'Veteran', value: 'veteran' },
  { label: 'Person with a disability', value: 'disability' },
  { label: 'Experiencing homelessness', value: 'homeless' },
];

export default function WizardStep6() {
  const router = useRouter();
  // Default to [] (server-safe), then hydrate the saved answer after mount.
  // See src/app/wizard/page.tsx for why reading storage in the useState
  // initializer drops the value on a retake.
  const [selected, setSelected] = useState<PriorityGroup[]>([]);

  useEffect(() => {
    if (readAnswers().householdSize == null) { router.replace('/wizard'); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate client-only sessionStorage after mount (the server render can't read it).
    setSelected(readAnswers().priorityGroups);
  }, [router]);

  const toggle = (value: PriorityGroup) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const submit = () => {
    setPriorityGroups(selected);
    posthog.capture('wizard_circumstances_selected', { circumstances: selected, step: 6 });
    router.push('/wizard/step7');
  };

  return (
    <WizardShell step={6} backHref="/wizard/step5">
      <StepTitle>Do any of these apply to you?</StepTitle>
      <StepSubtitle>Select all that apply. Some programs prioritize specific groups.</StepSubtitle>
      <OptionGroup role="group" label="Priority circumstances" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {options.map((opt) => (
          <OptionButton key={opt.value} role="checkbox" selected={selected.includes(opt.value)} onClick={() => toggle(opt.value)}>
            {opt.label}
          </OptionButton>
        ))}
        <OptionButton role="checkbox" selected={selected.length === 0} onClick={() => setSelected([])}>
          None of the above
        </OptionButton>
      </OptionGroup>
      <ContinueButton onClick={submit}>Continue</ContinueButton>
    </WizardShell>
  );
}
