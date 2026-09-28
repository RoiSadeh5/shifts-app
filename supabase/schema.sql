-- שכ״ש בלבד. הכל יושב בסכמה sachash, לא בטבלאות של הפרויקט השני.
-- מריצים פעם אחת ב-SQL Editor של אותו פרויקט.
-- הוצאה אחר כך: supabase/uninstall.sql מוחק רק את הסכמה הזאת ואת הטריגר שלה.
-- לא מכבים Confirm email מכאן: המתג הזה שייך לכל הפרויקט.
-- אחרי ההרצה: Settings → API → Exposed schemas, להוסיף sachash בלי למחוק את השמות שכבר שם.
-- המפתח הסודי (service_role) לא נכנס לאפליקציה. רק המפתח הציבורי anon.

create schema if not exists sachash;

grant usage on schema sachash to anon, authenticated, service_role;

create table if not exists sachash.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists sachash.invite_codes (
  code text primary key,
  created_at timestamptz not null default now(),
  used_by uuid,
  used_at timestamptz
);

create table if not exists sachash.user_data (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('shifts', 'history', 'settings', 'savings', 'leave', 'profile')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind)
);

alter table sachash.profiles enable row level security;
alter table sachash.invite_codes enable row level security;
alter table sachash.user_data enable row level security;

create or replace function sachash.is_admin()
returns boolean
language sql
stable
security definer
set search_path = sachash
as $$
  select exists (
    select 1 from sachash.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function sachash.is_admin() from public;
grant execute on function sachash.is_admin() to authenticated;

-- הרשמה של שכ״ש בלבד. בלי sachash_invite_code הטריגר לא נוגע במשתמש,
-- כדי שהרשמה של הפרויקט השני תמשיך כרגיל.
create or replace function sachash.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = sachash
as $$
declare
  invite text;
  person_name text;
begin
  invite := btrim(coalesce(new.raw_user_meta_data->>'sachash_invite_code', ''));
  if invite = '' then
    return new;
  end if;
  person_name := btrim(coalesce(new.raw_user_meta_data->>'sachash_name', ''));
  if not exists (
    select 1 from sachash.invite_codes
    where lower(code) = lower(invite) and used_by is null
  ) then
    raise exception 'invalid_invite';
  end if;
  update sachash.invite_codes
    set used_by = new.id, used_at = now()
    where lower(code) = lower(invite) and used_by is null;
  insert into sachash.profiles (id, email, name, role)
  values (new.id, coalesce(new.email, ''), person_name, 'user');
  return new;
end;
$$;

revoke all on function sachash.handle_new_user() from public;

drop trigger if exists sachash_on_auth_user_created on auth.users;
create trigger sachash_on_auth_user_created
  after insert on auth.users
  for each row execute function sachash.handle_new_user();

create or replace function sachash.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = sachash
as $$
begin
  if tg_op = 'UPDATE' and auth.uid() is not null and not sachash.is_admin() then
    new.role := old.role;
    new.email := old.email;
    new.id := old.id;
  end if;
  if tg_op = 'INSERT' and auth.uid() is not null and new.role is distinct from 'user' then
    new.role := 'user';
  end if;
  return new;
end;
$$;

revoke all on function sachash.protect_profile() from public;

drop trigger if exists sachash_protect_profile_row on sachash.profiles;
create trigger sachash_protect_profile_row
  before insert or update on sachash.profiles
  for each row execute function sachash.protect_profile();

drop policy if exists profiles_select on sachash.profiles;
drop policy if exists profiles_update on sachash.profiles;
drop policy if exists invites_admin on sachash.invite_codes;
drop policy if exists user_data_select on sachash.user_data;
drop policy if exists user_data_insert on sachash.user_data;
drop policy if exists user_data_update on sachash.user_data;
drop policy if exists user_data_delete on sachash.user_data;

create policy profiles_select on sachash.profiles
  for select to authenticated
  using (id = auth.uid() or sachash.is_admin());

create policy profiles_update on sachash.profiles
  for update to authenticated
  using (id = auth.uid() or sachash.is_admin())
  with check (id = auth.uid() or sachash.is_admin());

create policy invites_admin on sachash.invite_codes
  for all to authenticated
  using (sachash.is_admin())
  with check (sachash.is_admin());

create policy user_data_select on sachash.user_data
  for select to authenticated
  using (user_id = auth.uid() or sachash.is_admin());

create policy user_data_insert on sachash.user_data
  for insert to authenticated
  with check (user_id = auth.uid() or sachash.is_admin());

create policy user_data_update on sachash.user_data
  for update to authenticated
  using (user_id = auth.uid() or sachash.is_admin())
  with check (user_id = auth.uid() or sachash.is_admin());

create policy user_data_delete on sachash.user_data
  for delete to authenticated
  using (user_id = auth.uid() or sachash.is_admin());

grant select, insert, update, delete on all tables in schema sachash to authenticated;
grant all on all tables in schema sachash to service_role;
alter default privileges in schema sachash
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema sachash
  grant all on tables to service_role;

-- אחרי שהרצת את הקובץ:
-- 1. Settings → API → Exposed schemas: להוסיף sachash. לא למחוק public.
-- 2. קוד ראשון אליך (השאר אותו אצלך, לא בקוד של האפליקציה):
--    insert into sachash.invite_codes (code) values ('הסוד-שלך');
-- 3. באפליקציה: הצטרפות עם האימייל, סיסמה, השם, והקוד הזה.
-- 4. לקדם את עצמך למנהל:
--    update sachash.profiles set role = 'admin' where email = 'you@example.com';
