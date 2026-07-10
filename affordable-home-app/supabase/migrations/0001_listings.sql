-- Home Reach — canonical listings schema
-- Run in the Supabase SQL editor (or `supabase db push`).
--
-- Replaces the ad-hoc, non-existent tables the app previously queried
-- ("listings" / "Home Reach") with one canonical, typed table. Every row
-- carries provenance (source, source_url, last_verified) so the site can keep
-- its promise that listings are verified public data, never fabricated.

create extension if not exists "pgcrypto";

create table if not exists public.listings (
  id                uuid primary key default gen_random_uuid(),
  name              text        not null,
  address           text,
  city              text        not null,            -- Essex County municipality
  program_type      text,                            -- e.g. 'LIHTC', 'Section 8', 'PBV', 'COAH', 'Senior'
  ami_bands         smallint[]  not null default '{}',-- e.g. '{50,60}'; allowed: 30,50,60,80
  bedroom_types     text[]      not null default '{}',-- e.g. '{Studio,1BR,2BR}'
  rent              integer,                          -- monthly, whole dollars; null => "contact for rent"
  waitlist_open     boolean     not null default false, -- true = accepting applications
  application_link  text,
  phone             text,
  priority_groups   text[]      not null default '{}',-- subset of {senior,veteran,disability,homeless}
  accessible        boolean     not null default false,
  source            text        not null,            -- e.g. 'Newark Housing Authority'
  source_url        text,
  last_verified     date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint ami_bands_valid check (ami_bands <@ array[30,50,60,80]::smallint[]),
  constraint rent_nonneg check (rent is null or rent >= 0)
);

-- Unique key used by the ingestion script's upsert (onConflict: name,city).
create unique index if not exists listings_name_city_uniq on public.listings (name, city);
create index if not exists listings_city_idx on public.listings (city);
create index if not exists listings_waitlist_idx on public.listings (waitlist_open);
create index if not exists listings_ami_idx on public.listings using gin (ami_bands);
create index if not exists listings_bedrooms_idx on public.listings using gin (bedroom_types);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Row Level Security: the public (anon) key may READ only. Writes require the
-- service_role key (used by the ingestion script / admin), which bypasses RLS.
alter table public.listings enable row level security;

drop policy if exists "listings are publicly readable" on public.listings;
create policy "listings are publicly readable"
  on public.listings for select
  using (true);
