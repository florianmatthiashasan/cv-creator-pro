alter table public.applications
add column if not exists follow_up_at date,
add column if not exists notes text;
