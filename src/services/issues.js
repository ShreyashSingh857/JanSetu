import { supabase } from '../lib/supabase';

const BUCKET = 'issue-media';

// Build a PostgREST filter chain dynamically
export async function listIssues({ status, category, search, reportedBy, assignedTo, from = 0, to = 24 } = {}) {
  if (!supabase) throw new Error('Supabase client not configured');
  // Select * to include progress fields (progress_stage, progress_notes, progress_history, resolved_at)
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

// Persist progress update: stage, status, notes, and append history event.
// params: { id, stage, status, notes, actorId }
export async function updateIssueProgress({ id, stage, status, notes, actorId }) {
  if (!supabase) throw new Error('Supabase client not configured');
  if (!id) throw new Error('Issue id required');

  // Fetch current issue to read existing history & fields
  const { data: current, error: curErr } = await supabase.from('issues').select('progress_history, progress_stage, progress_notes, status, resolved_at').eq('id', id).single();
  if (curErr) throw curErr;

  const history = Array.isArray(current?.progress_history) ? current.progress_history : [];
  const nowIso = new Date().toISOString();
  const events = [];
  if (stage && stage !== current.progress_stage) {
    events.push({ ts: nowIso, type: 'stage', from: current.progress_stage, to: stage, actor: actorId || null });
  }
  if (status && status !== current.status) {
    events.push({ ts: nowIso, type: 'status', from: current.status, to: status, actor: actorId || null });
  }
  if (notes && notes !== current.progress_notes) {
    events.push({ ts: nowIso, type: 'notes', actor: actorId || null });
  }
  const newHistory = history.concat(events);

  const payload = {
    progress_stage: stage ?? current.progress_stage,
    progress_notes: notes !== undefined ? notes : current.progress_notes,
    progress_history: newHistory,
    status: status ?? current.status,
    updated_at: nowIso,
    resolved_at: (status === 'Resolved' && !current.resolved_at) ? nowIso : current.resolved_at
  };

  // First attempt: update returning row (requires SELECT + UPDATE RLS policies)
  let updated;
  let updErr;
  try {
    const resp = await supabase
      .from('issues')
      .update(payload)
      .eq('id', id)
      .select('id, progress_stage, progress_notes, progress_history, status, resolved_at')
      .single();
    updated = resp.data;
    updErr = resp.error;
  } catch (e) {
    updErr = e;
  }
  // If permission error (likely missing SELECT policy), retry without returning row
  if (updErr && /permission denied|RLS|row-level security/i.test(updErr.message || '')) {
    const { error: updErr2 } = await supabase
      .from('issues')
      .update(payload)
      .eq('id', id);
    if (updErr2) {
      console.error('updateIssueProgress fallback failed', updErr2);
      throw updErr2;
    }
    // Return optimistic merge (no fresh server data)
    return { ...current, ...payload };
  }
  if (updErr) {
    console.error('updateIssueProgress failed', updErr);
    throw updErr;
  }
  return { ...current, ...updated };
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
