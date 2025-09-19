import { supabase } from '../lib/supabase'

export async function listIssues({ status, category, search, reportedBy, assignedTo, from = 0, to = 24 }) {
  let q = supabase.from('issues').select('*').order('created_at', { ascending: false }).range(from, to)
  if (status && status !== 'All') q = q.eq('status', status)
  if (category && category !== 'All') q = q.eq('category', category)
  if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (reportedBy) q = q.eq('reported_by', reportedBy)
  if (assignedTo) q = q.eq('assigned_to', assignedTo)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getIssue(id) {
  const { data, error } = await supabase.from('issues').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createIssue(payload) {
  const { data, error } = await supabase.from('issues').insert([payload]).select().single()
  if (error) throw error
  return data
}

export async function updateIssue(id, updates) {
  const { data, error } = await supabase.from('issues').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function toggleUpvote(issueId) {
  const { error } = await supabase.rpc('toggle_upvote', { issue_uuid: issueId })
  if (error) throw error
}

// Upload media first, then create issue referencing media array
export async function createIssueWithMedia({ files = [], issueData }) {
  const media = []
  for (const file of files) {
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from('issue-media').upload(path, file)
    if (upErr) throw upErr
    const { data: { publicUrl } } = supabase.storage.from('issue-media').getPublicUrl(path)
    media.push({ type: file.type.startsWith('video') ? 'video':'image', url: publicUrl, path })
  }
  return createIssue({ ...issueData, media })
}
