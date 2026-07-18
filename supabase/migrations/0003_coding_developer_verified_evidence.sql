-- Shared Coding Developer records are separate from browser-owned progress.
-- The service routes are the sole writers after authentication, enrollment,
-- quota, and server-side grading. No client-side insert policy is granted.

create table if not exists public.coding_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id),
  program_id text not null check (program_id = 'coding-developer'),
  attempt_kind text not null check (attempt_kind in ('assessment', 'lab', 'interview', 'continuation', 'review')),
  content_version text not null,
  prompt_ids jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  feedback jsonb not null default '{}'::jsonb,
  competency_scores jsonb not null default '{}'::jsonb,
  score integer check (score between 0 and 100),
  verification_level text not null check (verification_level in ('server_scored', 'self_reported', 'reviewer_approved')),
  created_at timestamptz not null default now()
);

create table if not exists public.coding_execution_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  exercise_id text not null,
  provider text not null,
  request_summary jsonb not null,
  result_summary jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.coding_attempts enable row level security;
alter table public.coding_execution_events enable row level security;

create policy "coding attempt owner read" on public.coding_attempts
  for select using (auth.uid() = user_id);

create policy "coding execution owner read" on public.coding_execution_events
  for select using (auth.uid() = user_id);

create index if not exists coding_attempts_user_track_created_idx
  on public.coding_attempts(user_id, track_id, created_at desc);
