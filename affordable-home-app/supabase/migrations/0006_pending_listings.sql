-- Review queue for listings found by the weekly discovery job
-- (scripts/discover-listings.ts). Nothing here is visible on the site: a row
-- only becomes a real listing when a human approves it, which copies it into
-- public.listings. That keeps the site's promise that every listing is
-- verified, never auto-scraped.
--
-- Safe to re-run. Apply in the Supabase SQL editor.

create table if not exists public.pending_listings (
  id                uuid primary key default gen_random_uuid(),
  -- 'pending' (awaiting review) | 'approved' | 'rejected'
  --  | 'skipped' (the extractor decided it isn't an Essex County affordable
  --    rental, or is a duplicate — kept so it's never fetched again)
  status            text        not null default 'pending',

  -- Same shape as public.listings (see 0001) so approval is a straight copy.
  name              text        not null,
  address           text,
  city              text        not null,
  program_type      text,
  ami_bands         smallint[]  not null default '{}',
  bedroom_types     text[]      not null default '{}',
  rent              integer,
  waitlist_open     boolean     not null default false,
  application_link  text,
  phone             text,
  priority_groups   text[]      not null default '{}',
  accessible        boolean     not null default false,
  source            text        not null,
  source_url        text        not null,
  last_verified     date,

  -- Discovery metadata for the reviewer.
  confidence        text,                  -- 'high' | 'medium' | 'low'
  notes             text,                  -- extractor's summary / caveats
  evidence          text,                  -- short quote from the page backing the key fields
  duplicate_of      text,                  -- existing listing name if the extractor thinks it's the same property
  skip_reason       text,                  -- why status = 'skipped'
  discovered_at     timestamptz not null default now(),
  reviewed_at       timestamptz,
  listing_id        uuid references public.listings (id) on delete set null,

  constraint pending_status_valid check (status in ('pending', 'approved', 'rejected', 'skipped')),
  constraint pending_ami_bands_valid check (ami_bands <@ array[30,50,60,80]::smallint[])
);

-- One row per source page: the job uses this to know what it has already seen.
create unique index if not exists pending_listings_source_url_uniq on public.pending_listings (source_url);
create index if not exists pending_listings_status_idx on public.pending_listings (status);

-- Service-role only. No policies on purpose: nothing reads or writes this
-- table through the public API.
alter table public.pending_listings enable row level security;
