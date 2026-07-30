'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, ContinueButton } from '@/components/wizard/WizardShell';
import { parseIncome, readAnswers, setIncome } from '@/lib/wizardStore';

export default function WizardStep2() {
  const router = useRouter();
  // Default to '' (server-safe), then hydrate the saved answer after mount.
  // See src/app/wizard/page.tsx for why reading storage in the useState
  // initializer drops the value on a retake.
  const [income, setIncomeInput] = useState('');

  useEffect(() => {
    if (readAnswers().householdSize == null) { router.replace('/wizard'); return; }
    const stored = readAnswers().income;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate client-only sessionStorage after mount (the server render can't read it).
    if (stored != null) setIncomeInput(String(stored));
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
      <label htmlFor="income" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
        Annual household income
      </label>
      <input
        id="income"
        type="text"
        inputMode="numeric"
        placeholder="e.g. 45,000"
        value={income}
        onChange={(e) => setIncomeInput(e.target.value)}
        aria-describedby="income-help"
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '20px 24px', fontSize: 20, color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-dm-serif)', marginBottom: 8 }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#1E40AF')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
      <p id="income-help" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>Annual household income before taxes</p>
      <ContinueButton onClick={submit}>Continue</ContinueButton>
    </WizardShell>
  );
}
