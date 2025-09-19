# Supabase Storage Setup (Images & Videos)

This guide sets up two buckets:
- `issue-media`: photos/videos attached to reported issues (private, access via signed URLs)
- `avatars`: optional user profile images (public-read or signed, choose policy)

## 1. Create Buckets
In the Supabase Dashboard > Storage > Create bucket:
1. Name: `issue-media` (Uncheck Public)  
2. Name: `avatars` (You may check Public if you want simple direct delivery; instructions below assume private + signed URLs for consistency.)

Alternatively via SQL (SQL Editor):
```sql
-- Create buckets idempotently
insert into storage.buckets (id, name, public) values ('issue-media','issue-media', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars','avatars', false)
  on conflict (id) do nothing;
```

## 2. Policies for issue-media
Users can:
- Upload their own issue files
- Read only media belonging to issues they can view (reporter, assignee, government role)
- Generate signed URLs through backend (client can call) to display

```sql
-- Allow authenticated users to upload to issue-media under a path prefix of their user id
create policy if not exists "issue-media-insert-owner" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'issue-media'
    and (auth.uid()::text || '/') = split_part(name, '/', 1) || '/'
  );

-- Allow owner delete (optional)
create policy if not exists "issue-media-delete-owner" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'issue-media'
    and (auth.uid()::text || '/') = split_part(name, '/', 1) || '/'
  );

-- Read policy: allow if bucket and (owner path OR user can see the underlying issue)
-- Simpler first version: only allow read for any authenticated user (then rely on signed URLs if you want to restrict further)
create policy if not exists "issue-media-read-auth" on storage.objects
  for select to authenticated
  using ( bucket_id = 'issue-media' );
```

If you want stricter RLS tying to the `issues` table (needs naming convention `userId/issueId/filename`):
```sql
-- Replace the broad read policy above with this stricter one
drop policy if exists "issue-media-read-auth" on storage.objects;
create policy "issue-media-read-linked-issue" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'issue-media' and
    -- Extract issue_id (2nd path segment) and check visibility
    (
      exists (
        select 1 from issues i
        where i.id::text = split_part(name, '/', 2)
          and (
            i.reporter_id = auth.uid()
            or i.assigned_to = auth.uid()
            or (auth.jwt() ->> 'user_type') = 'government'
          )
      )
    )
  );
```

## 3. Policies for avatars
Simpler: everyone can read; only owner can write/delete.
```sql
-- Insert/update (owner path userId/filename)
create policy if not exists "avatars-upsert-owner" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (auth.uid()::text || '/') = split_part(name, '/', 1) || '/'
  );

-- Allow update if owner
create policy if not exists "avatars-update-owner" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (auth.uid()::text || '/') = split_part(name, '/', 1) || '/')
  with check (bucket_id = 'avatars' and (auth.uid()::text || '/') = split_part(name, '/', 1) || '/');

-- Delete if owner
create policy if not exists "avatars-delete-owner" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (auth.uid()::text || '/') = split_part(name, '/', 1) || '/');

-- Public read (if you decide to keep bucket private, you can remove this and use signed URLs instead)
create policy if not exists "avatars-read-all" on storage.objects
  for select
  using (bucket_id = 'avatars');
```

If you make the `avatars` bucket truly public (dashboard toggle), you don't need the read policy.

## 4. Recommended Path Conventions
Issue media upload path: `${userId}/${issueId}/${timestamp}_${originalName}`  
Avatar upload path: `${userId}/avatar.${ext}`

## 5. Generating Signed URLs (client)
Use an existing helper or add one:
```js
// example usage
const { data, error } = await supabase
  .storage
  .from('issue-media')
  .createSignedUrl(path, 60 * 60); // 1 hour
```

## 6. Example Upload (Issue Creation Flow)
```js
async function uploadIssueFiles(userId, issueId, files) {
  const bucket = supabase.storage.from('issue-media');
  const uploads = [];
  for (const f of files) {
    const path = `${userId}/${issueId}/${Date.now()}_${f.name}`;
    const { error } = await bucket.upload(path, f, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    uploads.push({ path });
  }
  return uploads;
}
```

## 7. Performance Tips
- Use `cacheControl` for static assets (e.g., 3600 or more for avatars)
- Store generated signed URL in component state, not DB
- Batch create signed URLs if listing many items

## 8. Cleanup / Lifecycle
- When deleting an issue, optionally list and delete its folder objects
```sql
-- Optionally a function to cascade delete storage objects for an issue
-- (Triggered manually before deleting issue rows)
```

## 9. Security Review Checklist
- Confirm no public bucket contains sensitive data
- Ensure RLS conditions match business logic
- Rotate anon key if accidentally exposed in public repo history

## 10. Next Steps
- Integrate `createIssueWithMedia` to call upload first, then store returned paths in `issues.media_paths` (array)
- Render images by generating signed URLs on demand
- Optionally add background image resizing (Edge Function) later
