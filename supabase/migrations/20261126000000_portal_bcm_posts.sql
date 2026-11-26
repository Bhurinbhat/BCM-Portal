-- Posts for the three sub-topics under "ข่าวสารและแจ้งเตือน": BCM Watch, BCM In Focus, BCM Announcement.
-- Signed-in users (Microsoft SSO / email) can read every post, add posts, and edit or delete their own.
-- The public (anon) key cannot read or write this table.
create table if not exists public.portal_bcm_posts (
  id           bigint generated always as identity primary key,
  category     text not null check (category in ('watch','focus','announce')),
  title        text not null check (char_length(title) between 1 and 300),
  body         text not null default '' check (char_length(body) <= 20000),
  link         text check (link is null or link ~* '^https?://'),
  post_date    date not null default current_date,
  pinned       boolean not null default false,
  author_name  text,
  created_by   uuid default auth.uid() references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists portal_bcm_posts_cat_date on public.portal_bcm_posts (category, post_date desc);

alter table public.portal_bcm_posts enable row level security;
create policy "bcm posts readable by signed-in users" on public.portal_bcm_posts
  for select to authenticated using (true);
create policy "signed-in users add bcm posts" on public.portal_bcm_posts
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "authors edit their bcm posts" on public.portal_bcm_posts
  for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy "authors delete their bcm posts" on public.portal_bcm_posts
  for delete to authenticated using (created_by = (select auth.uid()));
revoke all on public.portal_bcm_posts from anon;
grant select, insert, update, delete on public.portal_bcm_posts to authenticated;
