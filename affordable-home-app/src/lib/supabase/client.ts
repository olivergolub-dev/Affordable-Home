import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for use in Client Components (browser). Reads/writes the
 * auth session from cookies via @supabase/ssr so it stays in sync with the
 * server client and the proxy session refresh.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
