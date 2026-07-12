'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, ContinueButton } from '@/components/wizard/WizardShell';
import { parseIncome, readAnswers, setIncome } from '@/lib/wizardStore';

export default function WizardStep2() {
  const router = useRouter();
  const [income, setIncomeInput] = useState(() => {
    const stored = readAnswers().income;
    return stored != null ? String(stored) : '';
  });

  useEffect(() => {
    if (readAnswers().householdSize == null) router.replace('/wizard');
  }, [router]);

  const submit = () => {
    const parsed = parseIncome(income);
    setIncome(parsed);
    posthog.capture('wizard_income_submitted', { has_income: parsed != null, step: 2 });
    router.push('/wizard/step3');
  };

  return (
    <WizardShell step={2} backHref="/wizard">
      <StepTitle>What is your household&apos;s annual income?</StepTitle>
      <StepSubtitle>This determines which AMI tier you qualify for. Your answer is private and never stored beyond this session.</StepSubtitle>
      <input
        type="text"
        inputMode="numeric"
        placeholder="e.g. 45,000"
        value={income}
        onChange={(e) => setIncomeInput(e.target.value)}
        aria-label="Annual household income"
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '20px 24px', fontSize: 20, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>Annual household income before taxes</p>
      <ContinueButton onClick={submit}>Continue</ContinueButton>
    </WizardShell>
  );
}
