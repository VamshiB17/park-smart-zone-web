-- Profiles (no roles stored here)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Roles
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- updated_at trigger helper
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- profiles policies
drop policy if exists "Profiles: users can view own" on public.profiles;
drop policy if exists "Profiles: users can insert own" on public.profiles;
drop policy if exists "Profiles: users can update own" on public.profiles;

create policy "Profiles: users can view own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Profiles: users can insert own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Profiles: users can update own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- user_roles policies (read own role only, no client writes)
drop policy if exists "User roles: users can view own roles" on public.user_roles;
drop policy if exists "User roles: no client inserts" on public.user_roles;
drop policy if exists "User roles: no client updates" on public.user_roles;
drop policy if exists "User roles: no client deletes" on public.user_roles;

create policy "User roles: users can view own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "User roles: no client inserts"
on public.user_roles
for insert
to authenticated
with check (false);

create policy "User roles: no client updates"
on public.user_roles
for update
to authenticated
using (false);

create policy "User roles: no client deletes"
on public.user_roles
for delete
to authenticated
using (false);

-- Security definer helper to avoid RLS recursion in admin checks
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

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
