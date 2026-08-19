-- Outcome survey: the 60–90 day follow-up asking whether someone actually
-- found housing. This is the number worth reporting to funders/officials, and
-- it can only be collected long after the visit — never at click-through time.
--
-- Responses arrive from an emailed link, so the submitter is usually NOT signed
-- in. RLS therefore allows anonymous INSERT but no SELECT: anyone can submit,
-- nobody can read the responses through the public API. Read them in the
-- Supabase dashboard (or with the service_role key).
--
-- Safe to re-run. Apply in the Supabase SQL editor.

create table if not exists public.outcome_surveys (
  id          uuid primary key default gen_random_uuid(),
  -- found_home | applied_waiting | still_looking | stopped_looking
  outcome     text not null,
  -- Optional free text: what helped, what got in the way.
  comment     text,
  -- Where the response came from, e.g. 'email_60d' or 'direct'.
  source      text,
  created_at  timestamptz not null default now()
);

alter table public.outcome_surveys enable row level security;

-- Anyone (signed in or not) may submit a response...
drop policy if exists "anyone can submit outcome survey" on public.outcome_surveys;
create policy "anyone can submit outcome survey" on public.outcome_surveys
  for insert to anon, authenticated with check (true);

-- ...and no one can read them back through the public API. There is
-- deliberately no SELECT policy.
