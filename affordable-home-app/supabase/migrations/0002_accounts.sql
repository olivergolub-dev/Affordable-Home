-- Accounts: per-user saved results, favorite listings, and alert opt-ins.
-- Every table is protected by row-level security so a signed-in user can only
-- ever read or write their OWN rows. Identity lives in Supabase's built-in
-- auth.users; these tables only reference it.
--
-- Apply via the Supabase dashboard SQL editor (or `supabase db push` if you
-- link the CLI). Safe to re-run: guarded with "if not exists" / "drop policy".

-- One saved profile per user (their latest wizard answers). Upsert on user_id.
create table if not exists public.saved_results (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  answers     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Listings a user has bookmarked. One row per (user, listing).
create table if not exists public.favorite_listings (
  user_id     uuid not null references auth.users (id) on delete cascade,
  listing_id  uuid not null references public.listings (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Email-alert opt-in. `criteria` snapshots the profile to match new listings
-- against; null means "use the user's saved_results answers".
create table if not exists public.alert_subscriptions (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  active        boolean not null default true,
  criteria      jsonb,
  last_sent_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- Row-level security ---------------------------------------------------------
alter table public.saved_results       enable row level security;
alter table public.favorite_listings   enable row level security;
alter table public.alert_subscriptions enable row level security;

-- saved_results: owner-only full access.
drop policy if exists "own saved_results" on public.saved_results;
create policy "own saved_results" on public.saved_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorite_listings: owner-only full access.
drop policy if exists "own favorite_listings" on public.favorite_listings;
create policy "own favorite_listings" on public.favorite_listings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- alert_subscriptions: owner-only full access.
drop policy if exists "own alert_subscriptions" on public.alert_subscriptions;
create policy "own alert_subscriptions" on public.alert_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep saved_results.updated_at fresh on update.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_results_touch on public.saved_results;
create trigger saved_results_touch
  before update on public.saved_results
  for each row execute function public.touch_updated_at();
