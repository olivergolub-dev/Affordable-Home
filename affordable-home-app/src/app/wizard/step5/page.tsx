'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { WizardShell, StepTitle, StepSubtitle, OptionButton, OptionGroup } from '@/components/wizard/WizardShell';
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
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <OptionGroup role="radiogroup" label="Housing voucher status" style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map((opt) => (
            <OptionButton key={opt.value} role="radio" selected={selected === opt.value} onClick={() => choose(opt.value, opt.label)}>
              {opt.label}
            </OptionButton>
          ))}
        </OptionGroup>
        <aside
          aria-label="What is a housing voucher?"
          style={{
            flex: '0 1 280px',
            minWidth: 240,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderLeft: '3px solid #60A5FA',
            borderRadius: 8,
            padding: '20px 22px',
          }}
        >
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#60A5FA', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            What is a voucher?
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 12 }}>
            A <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>Housing Choice Voucher</strong> (often called <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>Section&nbsp;8</strong>) is a government subsidy that pays part of your rent directly to a landlord. You generally pay about 30% of your income, and the voucher covers the rest.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 12 }}>
            It moves with you — you can use it at any apartment where the landlord accepts vouchers, not just one building.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
            Don&apos;t have one? That&apos;s fine — many listings here don&apos;t require a voucher. You can also apply for one through your local housing authority.
          </p>
        </aside>
      </div>
    </WizardShell>
  );
}
