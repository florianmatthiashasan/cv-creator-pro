alter table public.applications
drop constraint if exists applications_stage_check;

alter table public.applications
add constraint applications_stage_check
check (stage in ('Saved', 'Applied', 'No response', 'Interview', 'Offer', 'Closed'));
