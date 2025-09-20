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
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data: issues, error } = await query;
  if (error) throw error;
  if (!issues?.length) return [];

  const issueIds = issues.map(i => i.id);
  const { data: upvotesData, error: upErr } = await supabase
    .from('issue_upvotes')
    .select('issue_id, user_id')
    .in('issue_id', issueIds);
  if (upErr) {
    console.warn('Failed to load upvotes', upErr.message);
    return issues.map(i => ({ ...i, upvote_count: 0, upvoted: false }));
  }
  const counts = {};
  const userUpvoted = new Set();
  const { data: { user } } = await supabase.auth.getUser();
  upvotesData.forEach(row => {
    counts[row.issue_id] = (counts[row.issue_id] || 0) + 1;
    if (user && row.user_id === user.id) userUpvoted.add(row.issue_id);
  });
  return issues.map(i => ({
    ...i,
    upvote_count: counts[i.id] || 0,
    upvoted: userUpvoted.has(i.id)
  }));
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

export async function toggleUpvote(issueId) {
  if (!supabase) throw new Error('Supabase client not configured');
  const { data, error } = await supabase.rpc('toggle_upvote', { p_issue: issueId });
  if (error) throw error;
  // RPC returns array with one row (Supabase JS <2) or object depending; normalize
  const row = Array.isArray(data) ? data[0] : data;
  return { upvoted: row?.upvoted, total: row?.total };
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
