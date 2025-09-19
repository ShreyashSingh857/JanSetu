import { supabase } from '../lib/supabase'

export async function uploadIssueMedia(issueId, file) {
  const ext = file.name.split('.').pop()
  const path = `${issueId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('issue-media').upload(path, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('issue-media').getPublicUrl(path)
  return { url: publicUrl, path, type: file.type.startsWith('video') ? 'video' : 'image' }
}

export async function deleteIssueMedia(path) {
  const { error } = await supabase.storage.from('issue-media').remove([path])
  if (error) throw error
}
