-- Required before checkout/webhook enrollment writes can satisfy the
-- enrollments.track_id foreign key. The application owns content in Git; this
-- table records only the purchasable track identity and public status.
insert into public.tracks (id, title, status) values
  ('applied-ai-operations', 'Applied AI Operations Engineer', 'active'),
  ('it-support-technician', 'IT Support Technician: Mission-Critical Enterprise Support', 'active')
on conflict (id) do update set title = excluded.title, status = excluded.status;
