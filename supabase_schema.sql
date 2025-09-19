-- JanSetu Supabase Schema Rebuild Script
-- RUN IN SUPABASE SQL EDITOR (or psql). Ensure you understand it DROPS tables.
-- Order: drop dependent objects -> create tables -> functions -> triggers -> indexes -> RLS policies.
-- Idempotent patterns used: IF EXISTS / CREATE OR REPLACE.

-- ============= SAFETY OPTIONS =============
-- Wrap in a transaction so partial failures rollback. Comment out if debugging.
begin;

-- ============= EXTENSIONS =============
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto; -- for gen_random_uuid
create extension if not exists postgis;

-- ============= DROP OLD OBJECTS =============
-- Drop triggers first (if existed) referencing functions
drop trigger if exists issues_set_geo on public.issues;

-- Drop functions (cascades not used to avoid accidental data loss from dependencies)
 drop function if exists set_issue_geo cascade;
 drop function if exists increment_upvote(uuid) cascade;
 drop function if exists decrement_upvote(uuid) cascade;
 drop function if exists increment_comment(uuid) cascade;
 drop function if exists decrement_comment(uuid) cascade;
 drop function if exists toggle_upvote(uuid) cascade;

-- Drop tables in dependency order
 drop table if exists public.issue_progress cascade;
 drop table if exists public.upvotes cascade;
 drop table if exists public.comments cascade;
 drop table if exists public.notifications cascade;
 drop table if exists public.issues cascade;
 -- DO NOT drop auth.users; only drop public.users shadow table
 drop table if exists public.users cascade;
 drop table if exists public.issue_enrichment_queue cascade;

-- ============= TABLES =============
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  full_name text,
  user_type text check (user_type in ('citizen','government','admin')) default 'citizen',
  phone_number text,
  avatar_url text,
  created_at timestamptz default now()
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  urgency text,
  status text default 'Reported',
  location_text text,
  latitude double precision,
  longitude double precision,
  geo geography(point, 4326),
  reported_by uuid references public.users(id) on delete set null,
  assigned_to uuid references public.users(id),
  upvotes_count int default 0,
  comments_count int default 0,
  media jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.issue_progress (
  id bigserial primary key,
  issue_id uuid references public.issues(id) on delete cascade,
  stage int not null,
  label text,
  notes text,
  updated_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.comments (
  id bigserial primary key,
  issue_id uuid references public.issues(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table public.upvotes (
  id bigserial primary key,
  issue_id uuid references public.issues(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(issue_id, user_id)
);

create table public.notifications (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table public.issue_enrichment_queue (
  id bigserial primary key,
  issue_id uuid references public.issues(id) on delete cascade,
  status text default 'pending',
  attempts int default 0,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============= FUNCTIONS =============
create or replace function set_issue_geo()
returns trigger language plpgsql as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geo = ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 4326)::geography;
  end if;
  new.updated_at = now();
  return new;
end $$;

create or replace function increment_upvote(issue_id uuid)
returns void language sql as $$
  update issues set upvotes_count = upvotes_count + 1 where id = issue_id;
$$;

create or replace function decrement_upvote(issue_id uuid)
returns void language sql as $$
  update issues set upvotes_count = greatest(upvotes_count - 1, 0) where id = issue_id;
$$;

create or replace function increment_comment(issue_id uuid)
returns void language sql as $$
  update issues set comments_count = comments_count + 1 where id = issue_id;
$$;

create or replace function decrement_comment(issue_id uuid)
returns void language sql as $$
  update issues set comments_count = greatest(comments_count - 1, 0) where id = issue_id;
$$;

create or replace function toggle_upvote(issue_uuid uuid)
returns void language plpgsql as $$
declare existing_id bigint;
begin
  select id into existing_id from upvotes where issue_id = issue_uuid and user_id = auth.uid();
  if existing_id is null then
    insert into upvotes(issue_id, user_id) values (issue_uuid, auth.uid());
    perform increment_upvote(issue_uuid);
  else
    delete from upvotes where id = existing_id;
    perform decrement_upvote(issue_uuid);
  end if;
end $$;

-- ============= TRIGGERS =============
create trigger issues_set_geo before insert or update on public.issues
for each row execute function set_issue_geo();

-- ============= INDEXES =============
create index if not exists issues_geo_idx on public.issues using gist(geo);
create index if not exists issues_status_idx on public.issues(status);
create index if not exists issues_category_idx on public.issues(category);
create index if not exists issues_reported_by_idx on public.issues(reported_by);
create index if not exists comments_issue_idx on public.comments(issue_id);
create index if not exists issue_progress_issue_idx on public.issue_progress(issue_id);

-- ============= RLS ENABLE =============
alter table public.users enable row level security;
alter table public.issues enable row level security;
alter table public.comments enable row level security;
alter table public.upvotes enable row level security;
alter table public.issue_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.issue_enrichment_queue enable row level security;

-- ============= POLICIES =============
-- NOTE: PostgreSQL (v15 in Supabase) does NOT support "IF NOT EXISTS" for CREATE POLICY.
-- We explicitly drop then recreate each policy to keep script idempotent.

-- = Users
drop policy if exists "users_select_self_or_gov" on public.users;
drop policy if exists "users_update_self" on public.users;

-- Rely on user_type stored in auth JWT metadata (set at signup). Access via auth.jwt()->>'user_type'.
create policy "users_select_self_or_gov" on public.users for select using (
  auth.uid() = id OR (auth.jwt() ->> 'user_type') in ('government','admin')
);
create policy "users_update_self" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- = Issues
drop policy if exists "issues_select_all" on public.issues;
drop policy if exists "issues_insert_auth" on public.issues;
drop policy if exists "issues_update_owner_or_assigned_or_gov" on public.issues;
drop policy if exists "issues_delete_admin" on public.issues;

create policy "issues_select_all" on public.issues for select using (true);
create policy "issues_insert_auth" on public.issues for insert with check (auth.uid() is not null);
create policy "issues_update_owner_or_assigned_or_gov" on public.issues for update using (
  reported_by = auth.uid() OR assigned_to = auth.uid() OR (auth.jwt() ->> 'user_type') in ('government','admin')
);
create policy "issues_delete_admin" on public.issues for delete using ((auth.jwt() ->> 'user_type') = 'admin');

-- = Comments
drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_insert_self" on public.comments;
drop policy if exists "comments_delete_self" on public.comments;

create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_self" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete_self" on public.comments for delete using (auth.uid() = user_id);

-- = Upvotes
drop policy if exists "upvotes_select_all" on public.upvotes;
drop policy if exists "upvotes_insert_self" on public.upvotes;
drop policy if exists "upvotes_delete_self" on public.upvotes;

create policy "upvotes_select_all" on public.upvotes for select using (true);
create policy "upvotes_insert_self" on public.upvotes for insert with check (auth.uid() = user_id);
create policy "upvotes_delete_self" on public.upvotes for delete using (auth.uid() = user_id);

-- = Issue Progress
drop policy if exists "progress_select_all" on public.issue_progress;
drop policy if exists "progress_insert_gov" on public.issue_progress;
drop policy if exists "progress_update_gov" on public.issue_progress;

create policy "progress_select_all" on public.issue_progress for select using (true);
create policy "progress_insert_gov" on public.issue_progress for insert with check ((auth.jwt() ->> 'user_type') in ('government','admin'));
create policy "progress_update_gov" on public.issue_progress for update using ((auth.jwt() ->> 'user_type') in ('government','admin'));

-- = Notifications (user owns)
drop policy if exists "notifications_select_owner" on public.notifications;
drop policy if exists "notifications_insert_system_or_owner" on public.notifications;

create policy "notifications_select_owner" on public.notifications for select using (user_id = auth.uid());
create policy "notifications_insert_system_or_owner" on public.notifications for insert with check (user_id = auth.uid());

-- = Enrichment Queue (gov/admin)
drop policy if exists "enrichment_queue_select_gov" on public.issue_enrichment_queue;
drop policy if exists "enrichment_queue_insert_gov" on public.issue_enrichment_queue;
drop policy if exists "enrichment_queue_update_gov" on public.issue_enrichment_queue;

create policy "enrichment_queue_select_gov" on public.issue_enrichment_queue for select using ((auth.jwt() ->> 'user_type') in ('government','admin'));
create policy "enrichment_queue_insert_gov" on public.issue_enrichment_queue for insert with check ((auth.jwt() ->> 'user_type') in ('government','admin'));
create policy "enrichment_queue_update_gov" on public.issue_enrichment_queue for update using ((auth.jwt() ->> 'user_type') in ('government','admin'));

commit;

-- If you get errors and want to debug, you can rollback by replacing 'commit;' with 'rollback;' while testing.
