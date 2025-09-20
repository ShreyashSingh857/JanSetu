import { supabase } from '../lib/supabase';

const AVATAR_BUCKET = 'avatars';

export async function getCurrentProfile() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, user_type, avatar_url, bio')
    .eq('id', user.id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Only allow updating explicit, known columns to avoid silent failures if a field
// not present in the schema is passed (e.g., outdated frontend code).
const ALLOWED_PROFILE_FIELDS = new Set(['full_name', 'bio', 'avatar_url']);

export async function updateProfile(updates) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const filtered = Object.fromEntries(
    Object.entries(updates || {}).filter(([k,v]) => ALLOWED_PROFILE_FIELDS.has(k) && v !== undefined)
  );
  if (!Object.keys(filtered).length) {
    return getCurrentProfile(); // nothing to update
  }

  // Keep optimistic timestamp only if the column exists in DB. If schema lacks it, avoid failure by feature flag variable.
  const includeUpdatedAt = true; // set false if your users table lacks updated_at
  const payload = includeUpdatedAt ? { ...filtered, updated_at: new Date().toISOString() } : filtered;

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', user.id)
    .select('id, email, full_name, user_type, avatar_url, bio')
    .single();
  if (error) {
    console.warn('updateProfile error', error, { payload });
    throw error;
  }
  return data;
}

export async function uploadAvatar(file) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: false });
  if (upErr) throw upErr;
  const { data: { publicUrl } } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  await updateProfile({ avatar_url: publicUrl });
  return publicUrl;
}

// Ensure a profile row exists for the authenticated user. Optionally accepts a preferred role.
// Populates full_name from user metadata (full_name | name) or falls back to email prefix.
// Also stores avatar_url from Google metadata picture if present and not already set.
export async function ensureProfileFromAuthUser(preferredRole) {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, user_type, email')
    .eq('id', user.id)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.warn('ensureProfile fetch error', error);
    return;
  }
  const meta = user.user_metadata || {};
  const derivedName = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : null);
  const picture = meta.avatar_url || meta.picture; // provider-specific key alias
  if (!data) {
    const insertPayload = {
      id: user.id,
      email: user.email,
      full_name: derivedName,
      user_type: preferredRole || 'citizen',
      avatar_url: picture || null
    };
    const { error: insErr } = await supabase.from('users').insert(insertPayload);
    if (insErr && insErr.code !== '23505') console.warn('ensureProfile insert error', insErr);
    return;
  }
  // Patch missing fields (do not override existing explicit user choices)
  const patch = {};
  if (!data.full_name && derivedName) patch.full_name = derivedName;
  if (!data.avatar_url && picture) patch.avatar_url = picture;
  if (preferredRole && data.user_type !== preferredRole) {
    // Do not downgrade or escalate automatically; only set if empty
    if (!data.user_type) patch.user_type = preferredRole;
  }
  if (Object.keys(patch).length) {
    const { error: upErr } = await supabase.from('users').update(patch).eq('id', user.id);
    if (upErr) console.warn('ensureProfile patch error', upErr);
  }
}
