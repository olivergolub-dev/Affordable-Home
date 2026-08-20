'use client';

import posthog from 'posthog-js';

/**
 * Print / Save as PDF. Counselors want a stack they can hand to clients, and
 * the browser's own print-to-PDF does that today without us shipping a
 * separate PDF file that would drift from the page. See the print styles in
 * the guide page.
 */
export function PrintGuideButton({ variant = 'primary' }: { variant?: 'primary' | 'quiet' }) {
  const primary = variant === 'primary';
  return (
    <button
      type="button"
      onClick={() => {
        posthog.capture('guide_print_clicked');
        window.print();
      }}
      style={{
        backgroundColor: primary ? '#1E40AF' : '#EFF6FF',
        color: primary ? '#FFFFFF' : '#1E40AF',
        border: primary ? '1px solid #1E40AF' : '1px solid #DBEAFE',
        borderRadius: 8,
        padding: '12px 22px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        minHeight: 44,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6v-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Print or save as PDF
    </button>
  );
}
