import { supabase } from '../lib/supabase'

// Issue functions
export const issueService = {
  getIssues: async (filters = {}) => {
    let query = supabase
      .from('issues')
      .select(`
        *,
        reported_by:users!reported_by(id, user_type, phone_number, full_name),
        assigned_to:users!assigned_to(id, user_type, phone_number, full_name)
      `)
    
    if (filters.status && filters.status !== 'All') {
      query = query.eq('status', filters.status)
    }
    
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
  
  getIssue: async (id) => {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        reported_by:users!reported_by(id, user_type, phone_number, full_name),
        assigned_to:users!assigned_to(id, user_type, phone_number, full_name),
        progress:issue_progress(*),
        comments:comments(*, user:users(id, user_type, phone_number, full_name))
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  createIssue: async (issueData) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('issues')
      .insert([
        {
          ...issueData,
          reported_by: user.id
        }
      ])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  updateIssue: async (id, updates) => {
    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  deleteIssue: async (id) => {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },
  
  upvoteIssue: async (issueId) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if user already upvoted
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('issue_id', issueId)
      .eq('user_id', user.id)
      .single()
    
    if (existingUpvote) {
      // Remove upvote
      await supabase
        .from('upvotes')
        .delete()
        .eq('id', existingUpvote.id)
      
      await supabase.rpc('decrement_upvote', { issue_id: issueId })
    } else {
      // Add upvote
      await supabase
        .from('upvotes')
        .insert([{ issue_id: issueId, user_id: user.id }])
      
      await supabase.rpc('increment_upvote', { issue_id: issueId })
    }
  }
}

// Progress functions
export const progressService = {
  getProgress: async (issueId) => {
    const { data, error } = await supabase
      .from('issue_progress')
      .select('*')
      .eq('issue_id', issueId)
      .order('stage', { ascending: true })
    
    if (error) throw error
    return data
  },
  
  addProgress: async (progressData) => {
    const { data, error } = await supabase
      .from('issue_progress')
      .insert([progressData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  updateProgress: async (id, updates) => {
    const { data, error } = await supabase
      .from('issue_progress')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Comment functions
export const commentService = {
  getComments: async (issueId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:users(id, user_type, phone_number, full_name)')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },
  
  addComment: async (issueId, content) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          issue_id: issueId,
          user_id: user.id,
          content: content
        }
      ])
      .select('*, user:users(id, user_type, phone_number, full_name)')
      .single()
    
    if (error) throw error
    
    // Update comment count on the issue
    await supabase.rpc('increment_comment', { issue_id: issueId })
    
    return data
  },
  
  deleteComment: async (id) => {
    // First get the comment to know which issue it belongs to
    const { data: comment } = await supabase
      .from('comments')
      .select('issue_id')
      .eq('id', id)
      .single()
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // Update comment count on the issue
    await supabase.rpc('decrement_comment', { issue_id: comment.issue_id })
  }
}

// User functions
export const userService = {
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return { ...user, ...data }
  },
  
  updateUser: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  getUserById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Storage functions for media upload
export const storageService = {
  uploadMedia: async (file, folder = 'issue-media') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(folder)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(folder)
      .getPublicUrl(filePath)

    return publicUrl
  },
  
  deleteMedia: async (filePath, folder = 'issue-media') => {
    const { error } = await supabase.storage
      .from(folder)
      .remove([filePath])
    
    if (error) throw error
  }
}