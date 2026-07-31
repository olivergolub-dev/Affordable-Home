'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Nav auth state: shows "Log in" when signed out, or the account name + a
 * sign-out button when signed in. Kept visually light so it fits the dark
 * site header. Renders nothing until the session is known (avoids a flash).
 */
export function AccountNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/');
  }

  if (!ready) return null;

  if (!email) {
    return (
      <Link href="/login" style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
        Log in
      </Link>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span title={email} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {email.split('@')[0]}
      </span>
      <button
        onClick={signOut}
        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Sign out
      </button>
    </div>
  );
}
