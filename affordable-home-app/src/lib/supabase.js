import { createClient } from '@supabase/supabase-js'

// Prefer env vars (set in .env.local / Vercel); fall back to the project's
// publishable anon credentials so the client always connects, even if the
// environment isn't configured. The anon key is safe to ship to the browser.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wrumpqswcctxtenognls.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pYltnRt3jQKcYx7rJogafA_rxXtBzAk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
