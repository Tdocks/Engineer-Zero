-- Preserve every human Coding Developer review decision. The mutable packet
-- status is convenient for queues; this append-only log is the audit trail.

create table if not exists public.coding_reviewer_decisions (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.coding_evidence_packets(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  decision text not null check (decision in ('assigned', 'changes_requested', 'approved', 'rejected')),
  rubric jsonb not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.coding_reviewer_decisions enable row level security;
create policy "coding reviewer decision owner read" on public.coding_reviewer_decisions
  for select using (
    exists (
      select 1 from public.coding_evidence_packets packet
      where packet.id = packet_id and packet.user_id = auth.uid()
    )
  );

create index if not exists coding_reviewer_decisions_packet_idx
  on public.coding_reviewer_decisions(packet_id, created_at asc);
