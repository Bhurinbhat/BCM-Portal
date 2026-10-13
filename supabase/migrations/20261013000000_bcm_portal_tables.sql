-- BCM Portal tables (applied to Supabase project bcm-readiness-hub)
create table if not exists public.portal_companies (
  id bigint generated always as identity primary key,
  sort_order int not null,
  name text not null,
  plant text,
  bu text not null,
  country text not null,
  sub_bu text,
  bcm_class text,
  status_code text not null check (char_length(status_code) = 20),
  as_of date not null default '2026-09-23',
  updated_at timestamptz not null default now()
);
comment on table public.portal_companies is 'BCM Portal: readiness of 20 BCM components per company/site. status_code chars: 1=done 0=missing p=pending n=n/a A-L=planned month';

create table if not exists public.portal_hazards (
  id text primary key,
  type text not null,
  severity text not null check (severity in ('em','wa','wt','ad')),
  severity_label text not null,
  title text not null,
  summary text,
  area text,
  country text,
  zone_lat double precision,
  zone_lon double precision,
  zone_km double precision,
  erp_index int not null default 12,
  site_names text[] not null default '{}',
  facts jsonb not null default '[]',
  sources jsonb not null default '[]',
  published_at timestamptz not null,
  updated_label text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
comment on table public.portal_hazards is 'BCM Portal: curated hazard news shown on the landing page';

create table if not exists public.portal_incidents (
  id bigint generated always as identity primary key,
  hazard_id text references public.portal_hazards(id) on delete set null,
  title text not null check (char_length(title) <= 300),
  hazard_type text check (char_length(hazard_type) <= 80),
  area text check (char_length(area) <= 300),
  command_level text check (command_level in ('Site LMT','BU BCM','CMC','')),
  site_names text[] not null default '{}' check (cardinality(site_names) <= 50),
  note text check (char_length(note) <= 2000),
  created_at timestamptz not null default now()
);
comment on table public.portal_incidents is 'BCM Portal prototype: incidents created from the Crisis Hub screen';

alter table public.portal_companies enable row level security;
alter table public.portal_hazards enable row level security;
alter table public.portal_incidents enable row level security;

create policy "portal companies readable" on public.portal_companies for select to anon, authenticated using (true);
create policy "portal hazards readable" on public.portal_hazards for select to anon, authenticated using (active);
create policy "portal incidents insert" on public.portal_incidents for insert to anon, authenticated with check (true);

grant select on public.portal_companies, public.portal_hazards to anon, authenticated;
grant insert on public.portal_incidents to anon, authenticated;
