import { supabase } from '../lib/supabase'

export async function listProgress(issueId) {
  const { data, error } = await supabase.from('issue_progress').select('*').eq('issue_id', issueId).order('stage', { ascending: true })
  if (error) throw error
  return data
}

export async function addProgress(entry) {
  const { data, error } = await supabase.from('issue_progress').insert([entry]).select().single()
  if (error) throw error
  return data
}

export async function updateProgress(id, updates) {
  const { data, error } = await supabase.from('issue_progress').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
