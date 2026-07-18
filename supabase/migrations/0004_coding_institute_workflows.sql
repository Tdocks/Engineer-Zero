-- Institute-grade Coding Developer workflow records. Browser-local drafts are
-- never written here directly; protected server routes own all mutations.

create table if not exists public.coding_reviewer_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('coding_reviewer', 'content_reviewer', 'security_reviewer')),
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id)
);

create table if not exists public.github_app_installations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  installation_id bigint not null,
  account_login text not null,
  repository_id bigint,
  repository_full_name text,
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique(user_id, installation_id)
);

create table if not exists public.coding_github_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id),
  challenge_id text not null,
  installation_id uuid references public.github_app_installations(id) on delete set null,
  repository_id bigint not null,
  branch_name text not null,
  commit_sha text,
  pull_request_number integer,
  review_comment_url text,
  merge_conflict_exercise boolean not null default false,
  evidence jsonb not null default '{}'::jsonb,
  verification_status text not null check (verification_status in ('pending', 'verified', 'changes_requested', 'revoked')) default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.coding_evidence_packets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null references public.tracks(id),
  program_id text not null check (program_id = 'coding-developer'),
  snapshot jsonb not null,
  readiness integer not null check (readiness between 0 and 100),
  status text not null check (status in ('draft', 'ready_for_review', 'assigned', 'changes_requested', 'approved', 'rejected')) default 'draft',
  assigned_reviewer_id uuid references auth.users(id),
  reviewer_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coding_source_reviews (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_version text not null,
  canonical_url text not null,
  last_verified date not null,
  revalidate_by date not null,
  status text not null check (status in ('author_verified', 'technical_approved', 'overdue', 'deprecated', 'replaced')),
  reviewer_id uuid references auth.users(id),
  reviewer_note text,
  replacement_source_id text,
  created_at timestamptz not null default now(),
  unique(source_id, source_version)
);

alter table public.coding_reviewer_roles enable row level security;
alter table public.github_app_installations enable row level security;
alter table public.coding_github_evidence enable row level security;
alter table public.coding_evidence_packets enable row level security;
alter table public.coding_source_reviews enable row level security;

create policy "coding installation owner read" on public.github_app_installations
  for select using (auth.uid() = user_id);
create policy "coding github evidence owner read" on public.coding_github_evidence
  for select using (auth.uid() = user_id);
create policy "coding evidence packet owner read" on public.coding_evidence_packets
  for select using (auth.uid() = user_id);
create policy "coding source review authenticated read" on public.coding_source_reviews
  for select to authenticated using (true);

create index if not exists coding_github_evidence_user_track_idx
  on public.coding_github_evidence(user_id, track_id, created_at desc);
create index if not exists coding_evidence_packets_status_idx
  on public.coding_evidence_packets(status, created_at asc);
create index if not exists coding_source_reviews_revalidate_idx
  on public.coding_source_reviews(revalidate_by, status);
