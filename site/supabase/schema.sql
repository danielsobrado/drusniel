-- ============================================================
--  Drusniel — Supabase reading progress schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- One row per user.  Upsert on user_id keeps it lightweight.
create table if not exists public.reading_progress (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  email           text,
  last_article_path  text,
  last_article_title text,
  last_visited_at    timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint reading_progress_user_id_key unique (user_id)
);

-- Row-Level Security — users can only read/write their own row
alter table public.reading_progress enable row level security;

create policy "Users can manage their own reading progress"
  on public.reading_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at on every write
create or replace function public.set_reading_progress_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_reading_progress_updated_at
  before update on public.reading_progress
  for each row execute procedure public.set_reading_progress_updated_at();
