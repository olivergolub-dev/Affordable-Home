'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { SiteHeader } from '@/components/SiteHeader';
import { createClient } from '@/lib/supabase/client';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

const cardInput: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  padding: '13px 15px',
  fontSize: 15,
  color: '#0D1117',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

function LoginInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'auth_callback' ? 'Sign-in link was invalid or expired. Please try again.' : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = createClient();
  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo() },
        });
        if (error) throw error;
        posthog.capture('account_signup_submitted', { method: 'email' });
        if (data.session) {
          window.location.assign('/results');
        } else {
          setNotice('Check your email to confirm your account, then log in.');
          setMode('login');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        posthog.capture('account_login', { method: 'email' });
        window.location.assign('/results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      posthog.capture('account_login', { method: 'google' });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
      // Redirect to Google happens automatically on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in is unavailable right now.');
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', padding: 'clamp(40px, 8vw, 80px) 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 'clamp(24px, 5vw, 36px)', boxShadow: '0 4px 24px rgba(10,22,40,0.06)' }}>
          <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: 26, color: '#0D1117', marginBottom: 6 }}>
            {mode === 'login' ? 'Log in' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            Save your results and favorite listings, and get alerts when new matches appear. Accounts are optional and free.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 15px', fontSize: 15, fontWeight: 600, color: '#0D1117', background: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 18 }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 18px', color: '#94A3B8', fontSize: 12 }}>
            <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} /> or <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          <form onSubmit={handleEmail}>
            <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={{ ...cardInput, marginBottom: 14 }} />

            <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Password</label>
            <input id="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'} style={{ ...cardInput, marginBottom: 18 }} />

            {error && <p role="alert" style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>{error}</p>}
            {notice && <p style={{ fontSize: 13, color: '#166534', marginBottom: 14 }}>{notice}</p>}

            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: '#64748B', marginTop: 20, textAlign: 'center' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setNotice(null); }}
              style={{ background: 'none', border: 'none', color: '#1E40AF', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>

          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 16, textAlign: 'center' }}>
            You can keep using Home Reach without an account. <Link href="/results" style={{ color: '#64748B' }}>Browse listings</Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
