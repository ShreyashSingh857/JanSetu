import { supabase } from '../lib/supabase';

const BUCKET = 'issue-media';

// Build a PostgREST filter chain dynamically
export async function listIssues({ status, category, search, reportedBy, assignedTo, from = 0, to = 24 } = {}) {
  if (!supabase) throw new Error('Supabase client not configured');
  let query = supabase.from('issues').select('*').order('created_at', { ascending: false }).range(from, to);
  if (status && status !== 'All') query = query.eq('status', status);
  if (category && category !== 'All') query = query.eq('category', category);
  if (reportedBy) query = query.eq('reported_by', reportedBy);
  if (assignedTo) query = query.eq('assigned_to', assignedTo);
  if (search) {
    // Basic ILIKE filter on title OR description via PostgREST orFilter
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getIssue(id) {
  if (!supabase) throw new Error('Supabase client not configured');
  const { data, error } = await supabase.from('issues').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createIssue(issue) {
  if (!supabase) throw new Error('Supabase client not configured');
  const { data, error } = await supabase.from('issues').insert(issue).select().single();
  if (error) throw error;
  return data;
}

export async function updateIssue(id, updates) {
  if (!supabase) throw new Error('Supabase client not configured');
  const { data, error } = await supabase.from('issues').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Placeholder toggleUpvote – real implementation will use upvotes table / RPC later
export async function toggleUpvote(issueId) {
  console.warn('toggleUpvote not implemented against backend yet', issueId);
}

export async function createIssueWithMedia({ files = [], issueData }) {
  if (!supabase) throw new Error('Supabase client not configured');
  const media = [];
  // Insert issue first (without media) to get id (or generate client side?)
  // We generate client-side and pass id? For simplicity: insert after uploads.
  // Perform uploads (sequential to simplify; optimize later)
  for (const file of files) {
    const ext = file.name.split('.').pop();
    const path = `${issueData.reported_by}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (uploadErr) throw uploadErr;
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
    media.push({ type: file.type.startsWith('video') ? 'video' : 'image', url: publicUrl });
  }
  const payload = { ...issueData, media };
  return createIssue(payload);
}
