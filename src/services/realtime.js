import { supabase } from '../lib/supabase'

export function subscribeIssues(handler) {
  const channel = supabase.channel('rt-issues')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, payload => handler(payload))
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export function subscribeComments(issueId, handler) {
  const channel = supabase.channel(`rt-comments-${issueId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `issue_id=eq.${issueId}` }, payload => handler(payload))
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export function subscribeProgress(issueId, handler) {
  const channel = supabase.channel(`rt-progress-${issueId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_progress', filter: `issue_id=eq.${issueId}` }, payload => handler(payload))
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
