-- שכ״ש: חשבונות נפרדים, והמנהל רואה את כולם.
-- מריצים פעם אחת ב-Supabase → SQL Editor.
-- המפתח הסודי (service_role) לא נכנס לאפליקציה. רק המפתח הציבורי.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.invite_codes (
  code text primary key,
  created_at timestamptz not null default now(),
  used_by uuid,
  used_at timestamptz
);

create table if not exists public.user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('shifts', 'history', 'settings', 'savings', 'leave', 'profile')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;
alter table public.user_data enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- הרשמה רק עם קוד שהמנהל יצר. אי אפשר לבחור לעצמך תפקיד מנהל.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invite text;
  person_name text;
begin
  invite := btrim(coalesce(new.raw_user_meta_data->>'invite_code', ''));
  person_name := btrim(coalesce(new.raw_user_meta_data->>'name', ''));
  if invite = '' or not exists (
    select 1 from public.invite_codes
    where lower(code) = lower(invite) and used_by is null
  ) then
    raise exception 'invalid_invite';
  end if;
  update public.invite_codes
    set used_by = new.id, used_at = now()
    where lower(code) = lower(invite) and used_by is null;
  insert into public.profiles (id, email, name, role)
  values (new.id, coalesce(new.email, ''), person_name, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and not public.is_admin() then
    new.role := old.role;
    new.email := old.email;
    new.id := old.id;
  end if;
  if tg_op = 'INSERT' and new.role is distinct from 'user' then
    new.role := 'user';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_row on public.profiles;
create trigger protect_profile_row
  before insert or update on public.profiles
  for each row execute function public.protect_profile();

drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists invites_admin on public.invite_codes;
drop policy if exists user_data_select on public.user_data;
drop policy if exists user_data_insert on public.user_data;
drop policy if exists user_data_update on public.user_data;
drop policy if exists user_data_delete on public.user_data;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy invites_admin on public.invite_codes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy user_data_select on public.user_data
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy user_data_insert on public.user_data
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy user_data_update on public.user_data
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy user_data_delete on public.user_data
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- אחרי שהרצת את הקובץ:
-- 1. Authentication → Providers → Email: לכבות Confirm email, כדי שחבר ייכנס מיד.
-- 2. ליצור קוד ראשון לעצמך (החלף את הסוד, ואל תשתף אותו):
--    insert into public.invite_codes (code) values ('הסוד-שלך');
-- 3. באפליקציה: הצטרפות עם האימייל, סיסמה, השם, והקוד הזה.
-- 4. לקדם את עצמך למנהל (החלף לאימייל שנרשמת איתו):
--    update public.profiles set role = 'admin' where email = 'you@example.com';
-- 5. מלוח המנהל באפליקציה יוצרים קוד נפרד לכל חבר.
