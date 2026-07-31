'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { saveResults } from '@/lib/account';
import type { WizardAnswers } from '@/lib/types';

/**
 * Saves the current profile (wizard answers) to the signed-in user's account.
 * Signed-out users are sent to log in first. Lives on the results page next to
 * the match count.
 */
export function SaveResultsButton({ answers, loggedIn }: { answers: WizardAnswers; loggedIn: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function onClick() {
    if (!loggedIn) { router.push('/login'); return; }
    setState('saving');
    const { error } = await saveResults(answers);
    if (error) {
      setState('error');
    } else {
      setState('saved');
      posthog.capture('results_saved');
    }
  }

  const label =
    state === 'saved' ? 'Saved ✓'
    : state === 'saving' ? 'Saving…'
    : state === 'error' ? 'Try again'
    : loggedIn ? 'Save my results'
    : 'Log in to save';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'saving' || state === 'saved'}
      style={{
        backgroundColor: state === 'saved' ? '#E9F0EB' : '#EFF6FF',
        color: state === 'saved' ? '#3D6B4C' : '#1E40AF',
        border: `1px solid ${state === 'saved' ? '#C6DBCC' : '#DBEAFE'}`,
        borderRadius: 8,
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: 600,
        cursor: state === 'saving' || state === 'saved' ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
