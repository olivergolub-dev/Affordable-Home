-- Follow-up queue for the 60-day outcome survey.
--
-- Privacy shape, which the site's copy must match: an address only lands here
-- when someone explicitly opts in (wizard checkbox) or has an account. It is
-- kept ONLY until that one message is sent — the send job nulls `email` and
-- keeps the row as an anonymous "one follow-up was sent" record, so the counts
-- survive without retaining the address.
--
-- Anonymous INSERT is allowed (the wizard opt-in posts through an API route),
-- but there is deliberately NO SELECT policy: nobody can read the queue back
-- through the public API. The send job uses the service_role key.
--
-- Safe to re-run. Apply in the Supabase SQL editor.

create table if not exists public.followup_queue (
  id          uuid primary key default gen_random_uuid(),
  -- Nulled once the follow-up is sent (see above).
  email       text,
  -- When the follow-up becomes due (opt-in time + 60 days).
  due_at      timestamptz not null,
  sent_at     timestamptz,
  -- 'wizard_optin' | 'account'
  source      text not null default 'wizard_optin',
  created_at  timestamptz not null default now()
);

-- One pending follow-up per address. Sent rows have email = null, and Postgres
-- allows many nulls in a unique index, so they never collide.
create unique index if not exists followup_queue_email_uniq
  on public.followup_queue (email);

create index if not exists followup_queue_due_idx
  on public.followup_queue (due_at) where sent_at is null;

alter table public.followup_queue enable row level security;

-- Opt-in inserts only. No SELECT policy on purpose.
drop policy if exists "anyone can opt in" on public.followup_queue;
create policy "anyone can opt in" on public.followup_queue
  for insert to anon, authenticated with check (true);
