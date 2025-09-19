import { supabase } from '../lib/supabase'

export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (error) throw error
  return { ...user, ...data }
}

export async function updateCurrentUser(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select().single()
  if (error) throw error
  return data
}
