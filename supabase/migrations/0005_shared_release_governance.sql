-- Shared release governance for every career track. Learners may retain
-- browser-local drafts, but completion, assessment, project, and release
-- decisions must be written only by protected server workflows.

create table if not exists public.content_release_reviews (
  id uuid primary key default gen_random_uuid(),
  track_id text not null references public.tracks(id),
  item_id text not null,
  content_version text not null,
  review_area text not null check (review_area in ('instructional_design', 'technical_sme', 'accessibility', 'fictional_data', 'release')),
  decision text not null check (decision in ('approved', 'changes_requested')),
  reviewer_id uuid not null references auth.users(id),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique(track_id, item_id, content_version, review_area, reviewer_id)
);

create table if not exists public.platform_reviewer_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('instructional_reviewer', 'technical_reviewer', 'accessibility_reviewer', 'fictional_data_reviewer', 'release_manager')),
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id)
);

alter table public.content_release_reviews enable row level security;
alter table public.platform_reviewer_roles enable row level security;

-- Release reviewers write via a protected server route after their active role
-- is checked. Learners are never given a policy that can manufacture review
-- approval, and no review record is public.
create policy "release review owner read" on public.content_release_reviews
  for select using (auth.uid() = reviewer_id);
create policy "platform reviewer role owner read" on public.platform_reviewer_roles
  for select using (auth.uid() = user_id);

-- These v1 policies made several old tables browser-writable. Keep them as
-- read-only historical projections; protected server endpoints own mutations.
drop policy if exists "assessment owner" on public.assessment_attempts;
drop policy if exists "progress owner" on public.progress_records;
drop policy if exists "submission owner" on public.submissions;
drop policy if exists "project owner" on public.project_case_studies;
drop policy if exists "interview owner" on public.interview_sessions;

create policy "assessment owner read" on public.assessment_attempts
  for select using (auth.uid() = user_id);
create policy "progress owner read" on public.progress_records
  for select using (auth.uid() = user_id);
create policy "submission owner read" on public.submissions
  for select using (auth.uid() = user_id);
create policy "project owner read" on public.project_case_studies
  for select using (auth.uid() = user_id);
create policy "interview owner read" on public.interview_sessions
  for select using (auth.uid() = user_id);

create index if not exists content_release_reviews_item_idx
  on public.content_release_reviews(track_id, item_id, content_version, created_at desc);
