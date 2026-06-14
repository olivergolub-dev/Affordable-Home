import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrumpqswcctxtenognls.supabase.co'
const supabaseAnonKey = 'sb_publishable_pYltnRt3jQKcYx7rJogafA_rxXtBzAk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
