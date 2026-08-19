-- Link-health tracking for the weekly source_url checker (scripts/check-links.ts).
-- link_ok: did the source_url last resolve? last_checked: when it was last tried.
-- Safe to re-run. Apply in the Supabase SQL editor.

alter table public.listings
  add column if not exists link_ok      boolean,
  add column if not exists last_checked  timestamptz;
