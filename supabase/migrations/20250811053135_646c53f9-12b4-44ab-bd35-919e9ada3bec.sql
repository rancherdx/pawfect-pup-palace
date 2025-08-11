-- Enable required extension
create extension if not exists pgcrypto;

-- Roles enum and table
create type public.app_role as enum ('admin','moderator','user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Third-party integrations table (encrypted secrets stored as ciphertext)
create table if not exists public.third_party_integrations (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  environment text not null check (environment in ('sandbox','production')),
  name text,
  data_ciphertext text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service, environment)
);

alter table public.third_party_integrations enable row level security;

-- Updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_third_party_integrations_updated_at
before update on public.third_party_integrations
for each row execute function public.update_updated_at_column();

-- RLS policies: admins only
create policy "admin_select_integrations"
  on public.third_party_integrations
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admin_insert_integrations"
  on public.third_party_integrations
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin_update_integrations"
  on public.third_party_integrations
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin_delete_integrations"
  on public.third_party_integrations
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Change logs for AI/ops auditing
create table if not exists public.change_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  context text,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.change_logs enable row level security;

create policy "admin_select_change_logs"
  on public.change_logs
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admin_insert_change_logs"
  on public.change_logs
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- Storage bucket to keep Apple Pay verification files (non-public)
insert into storage.buckets (id, name, public)
values ('apple-pay', 'apple-pay', false)
on conflict (id) do nothing;

-- Storage policies: only admins via RLS can access (edge functions will use service role)
create policy "admin_select_apple_pay"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'apple-pay' and public.has_role(auth.uid(), 'admin'));

create policy "admin_insert_apple_pay"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'apple-pay' and public.has_role(auth.uid(), 'admin'));

create policy "admin_update_apple_pay"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'apple-pay' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'apple-pay' and public.has_role(auth.uid(), 'admin'));

create policy "admin_delete_apple_pay"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'apple-pay' and public.has_role(auth.uid(), 'admin'));
