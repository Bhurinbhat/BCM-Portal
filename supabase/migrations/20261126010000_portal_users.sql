-- BCM Portal user list for the "User Management" menu.
-- Signed-in users can read the list. Only users listed here with role 'admin' and status 'active'
-- (matched by the email they signed in with) can add, edit, delete or import rows.
create table if not exists public.portal_users (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(name) between 1 and 200),
  email       text not null check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  phone       text,
  bu          text not null default 'SCG' check (bu in ('SCG','SCGC','SCGP','CBM','CGS','SCGD','SL','D&R')),
  site        text,
  position    text,
  role        text not null default 'viewer' check (role in ('admin','corp_bcm','bu_bcm','site_bcm','exec','viewer')),
  status      text not null default 'active' check (status in ('active','inactive')),
  updated_at  timestamptz not null default now()
);
-- upsert from the import uses onConflict: email, so keep emails stored in lower case
create or replace function public.portal_users_lower_email() returns trigger language plpgsql as $$
begin new.email := lower(trim(new.email)); return new; end $$;
drop trigger if exists portal_users_lower_email on public.portal_users;
create trigger portal_users_lower_email before insert or update on public.portal_users
  for each row execute function public.portal_users_lower_email();
alter table public.portal_users add constraint portal_users_email_key unique (email);

create or replace function public.portal_is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.portal_users
                 where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')) and role = 'admin' and status = 'active');
$$;
revoke all on function public.portal_is_admin() from public, anon;
grant execute on function public.portal_is_admin() to authenticated;

alter table public.portal_users enable row level security;
create policy "users readable by signed-in users" on public.portal_users
  for select to authenticated using (true);
create policy "admins add users" on public.portal_users
  for insert to authenticated with check ((select public.portal_is_admin()));
create policy "admins edit users" on public.portal_users
  for update to authenticated using ((select public.portal_is_admin())) with check ((select public.portal_is_admin()));
create policy "admins delete users" on public.portal_users
  for delete to authenticated using ((select public.portal_is_admin()));
revoke all on public.portal_users from anon;
grant select, insert, update, delete on public.portal_users to authenticated;

-- First admin (run once after the table exists, with the real email):
-- insert into public.portal_users (name, email, bu, site, role) values ('Bhurinbhat', '<your-email>@scg.com', 'SCG', 'Corporate BCM Office', 'admin');
