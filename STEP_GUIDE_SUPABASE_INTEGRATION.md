# Step-by-Step Supabase Integration Code Added

Follow these steps to adopt the new modular Supabase backend.

## 1. Install New Dependency
Run:
```bash
npm install @tanstack/react-query
```
(Already added to `package.json`.)

## 2. Query Client Provider
`src/main.jsx` now wraps `<App />` with `QueryClientProvider` using `src/lib/queryClient.js`.

## 3. Modular Service Layer
Created in `src/services/`:
- `issues.js`: list, get, create, update, toggleUpvote
- `comments.js`: list/add/delete comments
- `progress.js`: list/add/update progress stages
- `users.js`: current user profile helpers
- `storage.js`: media upload/delete helpers
- `realtime.js`: subscription helpers (issues, comments, progress)

## 4. React Query Hooks
Located in `src/hooks/`:
- `useIssues.js`
- `useIssue.js`
- `useComments.js`
- `useIssueProgress.js`

Each hook performs realtime cache syncing via Supabase channels.

## 5. How To Use In Components
Example (issues list):
```jsx
import { useIssues } from '../hooks/useIssues'

function IssuesList() {
  const { data: issues, isLoading, error, upvote } = useIssues({ status: 'All' })
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return issues.map(i => (
    <div key={i.id}>
      <h3>{i.title}</h3>
      <button onClick={() => upvote(i.id)}>👍 {i.upvotes_count}</button>
    </div>
  ))
}
```

Issue detail with comments:
```jsx
import { useIssue } from '../hooks/useIssue'
import { useComments } from '../hooks/useComments'

function IssueDetail({ id }) {
  const issueQ = useIssue(id)
  const commentsQ = useComments(id)
  if (issueQ.isLoading) return 'Loading issue...'
  return (
    <div>
      <h2>{issueQ.data.title}</h2>
      {commentsQ.data?.map(c => <p key={c.id}>{c.user?.full_name}: {c.content}</p>)}
    </div>
  )
}
```

## 6. Media Upload Pattern
```js
import { uploadIssueMedia } from '../services/storage'
import { createIssue } from '../services/issues'

async function createIssueWithMedia(form) {
  const mediaEntries = []
  for (const file of form.files) {
    const m = await uploadIssueMedia(form.tempIssueId, file) // or upload first then create issue
    mediaEntries.push({ type: m.type, url: m.url })
  }
  return createIssue({
    title: form.title,
    description: form.description,
    category: form.category,
    urgency: form.urgency,
    latitude: form.lat,
    longitude: form.lng,
    location_text: form.address,
    media: mediaEntries
  })
}
```

## 7. Replacing Fake Data
- Remove imports from `src/data/fakeData.js`
- Use `useIssues` (government dashboard) with filters instead of array filtering.

## 8. Upvote Toggle
Call `toggleUpvote(issue.id)` or via hook's `upvote` method; realtime subscription updates counts.

## 9. Progress Timeline
Use `useIssueProgress(issueId)`; call `add({ stage: 3, label: 'Assigned', notes: 'Team dispatched' })`.

## 10. Auth Considerations
Ensure users table row exists after signup. After Supabase email/password sign-up, insert row if absent (can do via edge function or client check once). Replace Firebase auth gradually.

## 11. Realtime Setup Reminder
Enable replication for tables: issues, comments, issue_progress, upvotes.

## 12. Next Enhancements
- Add optimistic updates for upvotes/comments
- Add signed URL retrieval if storage becomes private
- Add categories/urgency enums

Ask if you want me to refactor a specific existing component next.
