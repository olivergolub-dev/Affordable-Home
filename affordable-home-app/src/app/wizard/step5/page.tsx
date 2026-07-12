'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton } from '@/components/wizard/WizardShell';
import { readAnswers, setVoucher } from '@/lib/wizardStore';
import type { VoucherStatus } from '@/lib/types';

const options: { label: string; value: VoucherStatus }[] = [
  { label: 'Yes, I have a Section 8 voucher', value: 'yes' },
  { label: 'No, I do not have a voucher', value: 'no' },
  { label: 'I am not sure', value: 'unsure' },
];

export default function WizardStep5() {
  const router = useRouter();
  const [selected] = useState<VoucherStatus | null>(() => readAnswers().voucher);

  useEffect(() => {
    if (readAnswers().householdSize == null) router.replace('/wizard');
  }, [router]);

  const choose = (value: VoucherStatus, label: string) => {
    setVoucher(value);
    posthog.capture('wizard_voucher_selected', { voucher_status: label, step: 5 });
    router.push('/wizard/step6');
  };

  return (
    <WizardShell step={5} backHref="/wizard/step4">
      <StepTitle>Do you have a housing voucher?</StepTitle>
      <StepSubtitle>A Housing Choice Voucher (Section 8) can significantly expand your options.</StepSubtitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options.map((opt) => (
          <OptionButton key={opt.value} selected={selected === opt.value} onClick={() => choose(opt.value, opt.label)}>
            {opt.label}
          </OptionButton>
        ))}
      </div>
    </WizardShell>
  );
}
