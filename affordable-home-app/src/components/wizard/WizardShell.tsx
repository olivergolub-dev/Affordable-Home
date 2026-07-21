'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TOTAL_STEPS = 7;

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 11.5L12 4L21 11.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>Home Reach</span>
    </div>
  );
}

interface WizardShellProps {
  /** 1-indexed step number, out of TOTAL_STEPS. */
  step: number;
  /** Route to go back to. Omit on step 1 (no back button). */
  backHref?: string;
  children: React.ReactNode;
}

export function WizardShell({ step, backHref, children }: WizardShellProps) {
  const router = useRouter();
  const stepLabel = String(step).padStart(2, '0');
  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A1628', color: '#FFFFFF' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 clamp(16px,4vw,40px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
            [ {stepLabel} / {String(TOTAL_STEPS).padStart(2, '0')} ]
          </span>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Exit</Link>
        </div>
      </header>
      <div style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(to right, #1E40AF, #60A5FA)' }} />
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,40px)' }}>
        {backHref && (
          <button
            onClick={() => router.push(backHref)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 16px', fontSize: 13, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 48 }}
          >
            ← Back
          </button>
        )}
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', marginBottom: 20 }}>
          [ {stepLabel} ] &mdash;&mdash; STEP {step} OF {TOTAL_STEPS}
        </p>
        {children}
      </div>
    </div>
  );
}

export function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.05, color: '#FFFFFF', marginBottom: 16, fontWeight: 300 }}>
      {children}
    </h1>
  );
}

export function StepSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 48 }}>
      {children}
    </p>
  );
}

/**
 * A single choice within an OptionGroup. `role`/`aria-checked` come from the
 * group (radio for single-select, checkbox for multi-select) so screen
 * readers announce group membership ("radio button, 2 of 6") instead of the
 * generic toggle semantics `aria-pressed` gives.
 */
export function OptionButton({
  role,
  selected,
  onClick,
  children,
}: {
  role: 'radio' | 'checkbox';
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={selected ? 'wizard-option wizard-option-selected' : 'wizard-option'}
      style={{
        background: selected ? '#1E40AF' : 'rgba(255,255,255,0.04)',
        border: selected ? '1px solid #1E40AF' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '20px 24px',
        textAlign: 'left',
        fontSize: 16,
        color: '#FFFFFF',
        cursor: 'pointer',
        fontFamily: 'var(--font-dm-serif)',
        fontWeight: 300,
        width: '100%',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Groups OptionButtons with the correct ARIA container role + label.
 * Use role="radiogroup" for single-select steps, role="group" for
 * multi-select (checkbox) steps.
 */
export function OptionGroup({
  role,
  label,
  style,
  children,
}: {
  role: 'radiogroup' | 'group';
  label: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div role={role} aria-label={label} style={style}>
      {children}
    </div>
  );
}

export function ContinueButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 8, padding: '16px 36px', fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', width: '100%', opacity: disabled ? 0.55 : 1 }}
    >
      {children}
    </button>
  );
}
