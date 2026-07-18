-- Verified AIO evidence is intentionally separate from browser drafts. Client
-- code has no direct insert/update policy for these tables; trusted server
-- routes validate submissions and write through a service-role client.

create table if not exists public.course_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id),
  item_id text not null,
  content_version text not null,
  kind text not null check (kind in ('module', 'lab', 'mission', 'interview')),
  evidence jsonb not null,
  answers jsonb not null default '{}'::jsonb,
  mission_choices jsonb not null default '{}'::jsonb,
  competency_weights jsonb not null,
  evidence_dimension text not null check (evidence_dimension in ('understands', 'builds', 'troubleshoots', 'defends', 'ai_collaboration')),
  score integer not null check (score between 0 and 100),
  complete boolean not null,
  revision_of uuid references public.course_attempts(id),
  created_at timestamptz not null default now()
);

create table if not exists public.project_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id),
  project_id text not null,
  repository_ref text,
  payload jsonb not null,
  status text not null check (status in ('draft', 'submitted', 'changes_requested', 'approved')) default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, track_id, project_id)
);

create table if not exists public.capstone_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id),
  project_evidence_id uuid references public.project_evidence(id) on delete set null,
  decision text not null check (decision in ('ready_for_review', 'changes_requested', 'approved')),
  rubric jsonb not null,
  reviewer_id uuid references auth.users(id),
  reviewer_note text,
  created_at timestamptz not null default now()
);

alter table public.course_attempts enable row level security;
alter table public.project_evidence enable row level security;
alter table public.capstone_reviews enable row level security;

-- Learners may read their verified record. Writes are performed only by
-- protected server endpoints after grading, enrollment, quota, and ownership checks.
create policy "verified attempt owner read" on public.course_attempts
  for select using (auth.uid() = user_id);
create policy "project evidence owner read" on public.project_evidence
  for select using (auth.uid() = user_id);
create policy "capstone review owner read" on public.capstone_reviews
  for select using (auth.uid() = user_id);

create index if not exists course_attempts_user_track_created_idx
  on public.course_attempts(user_id, track_id, created_at desc);
create index if not exists project_evidence_user_track_idx
  on public.project_evidence(user_id, track_id);
