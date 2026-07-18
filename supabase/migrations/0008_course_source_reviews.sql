-- Claim-level source health for the two career tracks. A source can be
-- reachable and still need technical review; automated checks never promote
-- it to approved status.

create table if not exists public.course_source_reviews (
  id uuid primary key default gen_random_uuid(),
  track_id text not null references public.tracks(id),
  item_id text not null,
  content_version text not null,
  canonical_url text not null,
  source_version text not null,
  supported_claim text not null,
  accessed_on date not null,
  revalidate_by date not null,
  status text not null check (status in ('author_verified', 'technical_approved', 'overdue', 'needs_attention', 'deprecated', 'replaced')),
  reviewer_id uuid references auth.users(id),
  reviewer_note text,
  checked_at timestamptz not null default now(),
  unique(track_id, item_id, content_version, canonical_url, source_version)
);

alter table public.course_source_reviews enable row level security;
create policy "course source review authenticated read" on public.course_source_reviews
  for select to authenticated using (true);
create index if not exists course_source_reviews_due_idx
  on public.course_source_reviews(revalidate_by, status);
