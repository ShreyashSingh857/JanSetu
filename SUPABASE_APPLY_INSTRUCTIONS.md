# Applying the JanSetu Supabase Schema

## 1. Backup (If Existing Data Matters)
If you already have data you care about, export tables before running the rebuild script (`supabase_schema.sql`). The script **drops** existing tables.

## 2. Open Supabase SQL Editor
Copy the entire contents of `supabase_schema.sql` and paste into the SQL editor.

## 3. Review Transaction
The script wraps everything in a single transaction (`begin; ... commit;`). If any failure occurs, nothing is applied. For stepwise debugging you can comment out `begin;` and `commit;`.

## 4. Run Script
Click `RUN`. Confirm tables & functions appear after success.

## 5. Seed Minimal Users (Optional)
After schema load, create at least one government/admin user:
```sql
-- Replace with a real auth user UUID (after a user signs up via your app)
insert into public.users(id, email, full_name, user_type)
values('00000000-0000-0000-0000-000000000000','admin@example.com','Admin','admin');
```
You cannot invent UUIDs arbitrarily for real auth flows; they must match `auth.users.id` entries. Use the Auth dashboard to create/sign in users first, then insert the matching profile rows.

## 6. Storage Buckets
Create these buckets manually in Storage UI:
- `issue-media` (private)
- `avatars` (optional)

Set policies:
- Allow authenticated `INSERT` / `UPDATE`.
- Provide signed URLs for private object access.

## 7. Test RLS
Use the SQL editor with a user JWT (Auth -> Settings -> generate) and attempt:
```sql
select * from issues; -- should return rows
update issues set title = 'X' where id = '...'; -- should fail unless reporter/assigned/gov
```

## 8. Realtime
Enable Realtime for the tables (`issues`, `comments`, `issue_progress`, `upvotes`) in Supabase dashboard (Database -> Replication -> configure). Then your frontend subscriptions will work.

## 9. RPC Calls
`toggle_upvote` is available via:
```js
await supabase.rpc('toggle_upvote', { issue_uuid: '<uuid>' });
```

## 10. Next Iterations
- Add more composite indexes as query patterns stabilize.
- Implement enrichment worker polling `issue_enrichment_queue`.
- Add Edge Functions for admin workflows if needed.

---
If you need a seed script or data migration helper next, ask and I can generate it.
