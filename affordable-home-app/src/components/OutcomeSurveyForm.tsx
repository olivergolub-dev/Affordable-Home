'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { createClient } from '@/lib/supabase/client';

/**
 * The 60–90 day follow-up: did the person actually find housing? Reached from
 * an emailed link, so it must work signed-out. Answers go to the
 * outcome_surveys table (anonymous insert, see migration 0004) and to PostHog.
 *
 * The option set covers the real states of a housing search — "applied and
 * waiting" is the most common one and would be lost if this were a yes/no.
 */
const OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: 'found_home', label: 'Yes, I moved in', hint: 'You got housing through a listing or program you found here.' },
  { value: 'applied_waiting', label: 'I applied and I’m waiting', hint: 'Your application is in, or you’re on a waitlist.' },
  { value: 'still_looking', label: 'Still looking', hint: 'Nothing has come through yet.' },
  { value: 'stopped_looking', label: 'I stopped looking', hint: 'You found something elsewhere, or paused the search.' },
];

function SurveyInner() {
  const params = useSearchParams();
  const source = params.get('src') || 'direct';

  const [outcome, setOutcome] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function submit() {
    if (!outcome) return;
    setState('saving');
    const supabase = createClient();
    const { error } = await supabase
      .from('outcome_surveys')
      .insert({ outcome, comment: comment.trim() || null, source });
    if (error) {
      setState('error');
      return;
    }
    posthog.capture('outcome_survey_submitted', { outcome, source, has_comment: comment.trim().length > 0 });
    setState('done');
  }

  const card: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: 'clamp(24px, 5vw, 40px)',
  };

  if (state === 'done') {
    return (
      <div style={{ ...card, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 26, color: '#0D1117', marginBottom: 10, fontWeight: 400 }}>Thank you.</h1>
        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 24 }}>
          Your answer helps us show whether Home Reach actually gets people housed &mdash; and where it falls short.
        </p>
        <Link href="/results" style={{ backgroundColor: '#1E40AF', color: 'white', padding: '12px 26px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
          Browse current listings
        </Link>
      </div>
    );
  }

  return (
    <div style={card}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', color: '#0D1117', marginBottom: 10, fontWeight: 400, lineHeight: 1.2 }}>
        How did your housing search go?
      </h1>
      <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>
        You used Home Reach a couple of months ago. One question, and it&rsquo;s anonymous &mdash; we don&rsquo;t attach your answer to your name or email.
      </p>

      <div role="radiogroup" aria-label="Housing search outcome" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {OPTIONS.map((o) => {
          const selected = outcome === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setOutcome(o.value)}
              style={{
                textAlign: 'left',
                border: `1px solid ${selected ? '#1E40AF' : '#E2E8F0'}`,
                background: selected ? '#EFF6FF' : '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                cursor: 'pointer',
                minHeight: 44,
              }}
            >
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: selected ? '#1E40AF' : '#0D1117', marginBottom: 3 }}>
                {o.label}
              </span>
              <span style={{ display: 'block', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                {o.hint}
              </span>
            </button>
          );
        })}
      </div>

      <label htmlFor="survey-comment" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
        Anything you&rsquo;d like to add? (optional)
      </label>
      <textarea
        id="survey-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="What helped, or what got in the way?"
        style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', fontSize: 15, color: '#0D1117', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', marginBottom: 20 }}
      />

      {state === 'error' && (
        <p role="alert" style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>
          Something went wrong saving your answer. Please try again.
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!outcome || state === 'saving'}
        style={{
          width: '100%',
          backgroundColor: '#1E40AF',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '14px',
          fontSize: 15,
          fontWeight: 600,
          cursor: !outcome || state === 'saving' ? 'not-allowed' : 'pointer',
          opacity: !outcome || state === 'saving' ? 0.55 : 1,
          minHeight: 44,
        }}
      >
        {state === 'saving' ? 'Sending…' : 'Send my answer'}
      </button>
    </div>
  );
}

export function OutcomeSurveyForm() {
  return (
    <Suspense fallback={null}>
      <SurveyInner />
    </Suspense>
  );
}
