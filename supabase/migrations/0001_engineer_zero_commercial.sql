create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  interview_date date,
  experience text not null check (experience in ('new', 'builder', 'experienced')),
  goal text not null check (goal in ('interview', 'career', 'both')),
  created_at timestamptz not null default now()
);
create table if not exists public.tracks (id text primary key, title text not null, status text not null check (status in ('active', 'beta', 'planned')));
create table if not exists public.track_content_versions (id uuid primary key default gen_random_uuid(), track_id text not null references public.tracks(id), version text not null, content jsonb not null, created_at timestamptz not null default now(), unique(track_id, version));
create table if not exists public.enrollments (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), status text not null check (status in ('active', 'revoked', 'refunded')), stripe_checkout_session_id text unique, created_at timestamptz not null default now(), unique(user_id, track_id));
create table if not exists public.assessment_attempts (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), answers jsonb not null, score integer not null check (score between 0 and 100), created_at timestamptz not null default now());
create table if not exists public.progress_records (user_id uuid not null references auth.users(id) on delete cascade, activity_id text not null, content_version text not null, status text not null check (status in ('complete')), score integer not null check (score between 0 and 100), feedback text not null, updated_at timestamptz not null default now(), primary key(user_id, activity_id, content_version));
create table if not exists public.submissions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, activity_id text not null, response text not null, score integer not null check (score between 0 and 100), created_at timestamptz not null default now());
create table if not exists public.project_case_studies (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), payload jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.interview_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), payload jsonb not null, created_at timestamptz not null default now());
create table if not exists public.readiness_snapshots (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), values jsonb not null, created_at timestamptz not null default now());
create table if not exists public.certificates (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), verification_token uuid not null unique default gen_random_uuid(), public_name text, issued_at timestamptz not null default now());
create table if not exists public.stripe_customers (user_id uuid primary key references auth.users(id) on delete cascade, stripe_customer_id text not null unique);
create table if not exists public.stripe_events (id text primary key, type text not null, payload jsonb not null, processed_at timestamptz not null default now());
create table if not exists public.kyra_usage_events (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, track_id text not null references public.tracks(id), created_at timestamptz not null default now());

alter table public.profiles enable row level security; alter table public.enrollments enable row level security; alter table public.assessment_attempts enable row level security; alter table public.progress_records enable row level security; alter table public.submissions enable row level security; alter table public.project_case_studies enable row level security; alter table public.interview_sessions enable row level security; alter table public.readiness_snapshots enable row level security; alter table public.certificates enable row level security; alter table public.kyra_usage_events enable row level security;
create policy "profile owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "enrollment owner" on public.enrollments for select using (auth.uid() = user_id);
create policy "assessment owner" on public.assessment_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress owner" on public.progress_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "submission owner" on public.submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "project owner" on public.project_case_studies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interview owner" on public.interview_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "readiness owner" on public.readiness_snapshots for select using (auth.uid() = user_id);
create policy "certificate owner" on public.certificates for select using (auth.uid() = user_id);
create policy "kyra usage owner" on public.kyra_usage_events for select using (auth.uid() = user_id);
