o-- Supabase Reset Script (Drops Previous JanSetu Custom Schema Objects)
-- WARNING: This irreversibly DROPS tables and functions defined below.
-- Run in Supabase SQL editor ONLY if you intend to rebuild from scratch.

begin;

-- Disable RLS temporarily (avoid dependency ordering issues)
alter table if exists public.upvotes disable row level security;
alter table if exists public.issue_progress disable row level security;
alter table if exists public.comments disable row level security;
alter table if exists public.issues disable row level security;
alter table if exists public.users disable row level security;

-- Drop functions (depend on tables)
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    select proname, oid::regprocedure as signature
    from pg_proc
    join pg_namespace n on n.oid = pg_proc.pronamespace
    where n.nspname = 'public'
      and proname in (
        'toggle_upvote',
        'increment_upvote', 'decrement_upvote',
        'increment_comment', 'decrement_comment'
      )
  ) LOOP
    EXECUTE 'drop function if exists ' || r.signature || ' cascade';
  END LOOP;
END $$;

-- Drop tables in dependency-safe order
DROP TABLE IF EXISTS public.upvotes CASCADE;
DROP TABLE IF EXISTS public.issue_progress CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.issues CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.enrichment_queue CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;  -- Only if you intend to recreate; otherwise keep

commit;

-- After this you can run your new schema creation script.
