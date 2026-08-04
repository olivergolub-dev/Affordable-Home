'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { createClient } from '@/lib/supabase/client';

/**
 * Stitches a logged-in user's sessions together WITHOUT exposing who they are:
 * we identify by the Supabase user UUID only — never name or email — so
 * PostHog sees an opaque, stable id. On sign-out we reset() so the next visitor
 * on a shared device starts a fresh anonymous identity.
 *
 * Mounted once in the root layout.
 */
export function PostHogAuthBridge() {
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) posthog.identify(data.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // UUID only — no properties, so no PII is ever attached to the profile.
        posthog.identify(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        posthog.reset();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
