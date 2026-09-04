alter table public.cvs
add column if not exists custom_sections jsonb not null default '[]'::jsonb;
