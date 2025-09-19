import { supabase } from '../lib/supabase'

export async function listComments(issueId) {
  const { data, error } = await supabase.from('comments').select('*, user:users(id, full_name, user_type)').eq('issue_id', issueId).order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addComment(issueId, content) {
  const { data, error } = await supabase.from('comments').insert([{ issue_id: issueId, content }]).select('*, user:users(id, full_name, user_type)').single()
  if (error) throw error
  return data
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
