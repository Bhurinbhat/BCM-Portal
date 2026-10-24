-- ICS key contacts per BU and site, shown on the "ผัง ICS ผู้รับผิดชอบ" page.
-- Contains people's names and phone numbers, so only signed-in users (Microsoft SSO) can read it.
-- The public (anon) key cannot read or write this table. Edit rows in the Supabase Table Editor.
create table if not exists public.portal_ics_contacts (
  id            bigint generated always as identity primary key,
  bu            text not null,            -- 'SCG' for corporate level, otherwise SCGC, SCGP, CGS, SL, SCGD, D&R, CBM
  site_name     text,                     -- null = BU-level role; otherwise must match portal_companies.name
  role          text not null check (role in ('cmc_chair','corp_bcm','ic','safety','liaison','pio','ops','plan','log','fin','bcm_co','site_ic','ert','site_bcm')),
  person_name   text not null,
  position      text,
  phone         text,
  email         text,
  backup_name   text,
  backup_phone  text,
  updated_at    timestamptz not null default now()
);
create unique index if not exists portal_ics_contacts_slot on public.portal_ics_contacts (bu, coalesce(site_name,''), role);
alter table public.portal_ics_contacts enable row level security;
create policy "ics contacts readable by signed-in users" on public.portal_ics_contacts
  for select to authenticated using (true);
revoke all on public.portal_ics_contacts from anon;
grant select on public.portal_ics_contacts to authenticated;
