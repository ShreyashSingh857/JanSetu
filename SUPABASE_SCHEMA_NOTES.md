# Supabase Schema Notes (For Future Rebuild)

This document summarizes the previously recommended JanSetu schema and policies so you can reintroduce them cleanly later.

## Core Tables

### users (1:1 with auth.users)
- id (uuid, PK, references auth.users.id on delete cascade)
- full_name text
- user_type text check (user_type in ('citizen','government'))
- avatar_url text
- created_at timestamptz default now()

RLS (when re-enabled):
- Allow select for authenticated
- Allow insert for authenticated with condition (auth.uid() = id)
- Allow update for owner only (auth.uid() = id)

### issues
- id uuid PK default gen_random_uuid()
- title text
- description text
- category text
- latitude double precision
- longitude double precision
- status text check (status in ('open','in_progress','resolved')) default 'open'
- media jsonb default '[]'::jsonb  (array of {type,url})
- upvotes_count integer default 0
- comments_count integer default 0
- reported_by uuid references users(id) on delete set null
- created_at timestamptz default now()

RLS:
- Select: authenticated true
- Insert: auth.uid() = reported_by
- Update: either owner (auth.uid() = reported_by) or government user (EXISTS user_type=government) depending on fields. (Simplest: owner or government)
- Delete: owner only (optional) or restrict

### comments
- id uuid PK default gen_random_uuid()
- issue_id uuid references issues(id) on delete cascade
- user_id uuid references users(id) on delete cascade
- content text
- created_at timestamptz default now()

RLS:
- Select: authenticated
- Insert: auth.uid() = user_id
- Delete/Update: owner only (auth.uid() = user_id)

### issue_progress
- id uuid PK default gen_random_uuid()
- issue_id uuid references issues(id) on delete cascade
- stage integer (0..N)
- description text
- created_by uuid references users(id)
- created_at timestamptz default now()

RLS:
- Select: authenticated
- Insert: government only (check user_type)
- Update/Delete: government only AND created_by = auth.uid()

### upvotes
- user_id uuid references users(id) on delete cascade
- issue_id uuid references issues(id) on delete cascade
- created_at timestamptz default now()
PRIMARY KEY (user_id, issue_id)

Trigger-based maintenance recommended for increment/decrement of issues.upvotes_count OR a toggle RPC.

### notifications (optional)
- id uuid PK default gen_random_uuid()
- user_id uuid references users(id)
- type text
- payload jsonb
- read_at timestamptz null
- created_at timestamptz default now()

### enrichment_queue (optional future ML pipeline)
- id bigserial PK
- issue_id uuid references issues(id) on delete cascade
- status text check(status in ('pending','processing','done','error')) default 'pending'
- attempts int default 0
- last_error text
- created_at timestamptz default now()
- updated_at timestamptz default now()

## Helpful Functions (Optional)

Example toggle upvote (simplified):
```
create or replace function public.toggle_upvote(issue_uuid uuid)
returns void language plpgsql security definer as $$
begin
  if exists(select 1 from upvotes where user_id = auth.uid() and issue_id = issue_uuid) then
    delete from upvotes where user_id = auth.uid() and issue_id = issue_uuid;
    update issues set upvotes_count = upvotes_count - 1 where id = issue_uuid;
  else
    insert into upvotes(user_id, issue_id) values (auth.uid(), issue_uuid);
    update issues set upvotes_count = upvotes_count + 1 where id = issue_uuid;
  end if;
end;$$;
```
Grant execute to authenticated role after creation.

## Storage (If Reintroduced)
Bucket: `issue-media`
- Public read, authenticated write
Policy examples:
- Object insert: auth.role() = 'authenticated'
- Object read: true
(Or restrict read until approved and serve via signed URLs.)

## Realtime
Enable for: issues, comments, issue_progress, upvotes (optional) to support live UI updates.

## Minimal Recreation Order
1. Tables (users first, then issues, comments, issue_progress, upvotes)
2. RLS enable + policies
3. Functions (toggle_upvote, increment/decrement comment/upvote if using triggers)
4. Grants (if needed) to authenticated
5. Storage bucket + policies

---
Keep this file as a reference; it is not executed automatically.
