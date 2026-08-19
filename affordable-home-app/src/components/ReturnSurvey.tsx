'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';

// Listing links open in a NEW tab, so "coming back to Home Reach" is the user
// refocusing this tab after having opened a listing. We record when a listing
// was opened, and the next time the tab becomes visible we ask — once per
// session — whether the RESULTS MATCHED their situation.
//
// Deliberately not an outcome question: housing placement takes months, so
// "did you find a home?" is unanswerable at this moment and would collect
// optimism rather than results. Relevance is what someone can judge right
// after opening a listing. The outcome question lives in the 60–90 day
// follow-up survey at /survey instead.
const OPENED_KEY = 'hr_listing_opened';
const DONE_KEY = 'hr_return_survey_done';
// Ignore near-instant returns (accidental clicks): only ask if they were away
// long enough to have actually looked at the listing.
const MIN_AWAY_MS = 1500;

/** Called from a listing's external link click to arm the return survey. */
export function markListingOpened(): void {
  try {
    sessionStorage.setItem(OPENED_KEY, String(Date.now()));
  } catch {
    /* storage disabled — survey just won't fire */
  }
}

export function ReturnSurvey() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function maybeShow() {
      if (document.visibilityState !== 'visible') return;
      try {
        if (sessionStorage.getItem(DONE_KEY)) return;
        const openedAt = Number(sessionStorage.getItem(OPENED_KEY) || '0');
        if (!openedAt || Date.now() - openedAt < MIN_AWAY_MS) return;
      } catch {
        return;
      }
      setOpen(true);
    }
    document.addEventListener('visibilitychange', maybeShow);
    window.addEventListener('focus', maybeShow);
    return () => {
      document.removeEventListener('visibilitychange', maybeShow);
      window.removeEventListener('focus', maybeShow);
    };
  }, []);

  function close() {
    try {
      sessionStorage.setItem(DONE_KEY, '1');
      sessionStorage.removeItem(OPENED_KEY);
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function answer(match: 'yes' | 'partly' | 'no') {
    posthog.capture('results_match_feedback', { match });
    close();
  }

  function dismiss() {
    posthog.capture('results_match_feedback', { match: 'dismissed' });
    close();
  }

  if (!open) return null;

  const choices: { label: string; match: 'yes' | 'partly' | 'no'; primary?: boolean }[] = [
    { label: 'Yes, they fit', match: 'yes', primary: true },
    { label: 'Somewhat', match: 'partly' },
    { label: 'Not really', match: 'no' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Did these results match your situation?"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'clamp(16px, 4vw, 32px)',
        transform: 'translateX(-50%)',
        width: 'min(440px, calc(100vw - 32px))',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(10,22,40,0.18)',
        padding: '20px 22px',
        zIndex: 1000,
      }}
    >
      <button
        aria-label="Dismiss"
        onClick={dismiss}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, lineHeight: 1, padding: 4 }}
      >
        ×
      </button>
      <p style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 18, color: '#0D1117', marginBottom: 4, paddingRight: 20 }}>
        Did these results match your situation?
      </p>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
        Your answer is anonymous and helps us improve.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {choices.map((c) => (
          <button
            key={c.match}
            onClick={() => answer(c.match)}
            style={{
              flex: '1 1 auto',
              minWidth: 96,
              backgroundColor: c.primary ? '#1E40AF' : '#EFF6FF',
              color: c.primary ? '#FFFFFF' : '#1E40AF',
              border: c.primary ? '1px solid #1E40AF' : '1px solid #DBEAFE',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
