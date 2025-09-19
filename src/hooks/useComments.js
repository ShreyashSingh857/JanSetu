import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listComments, addComment, deleteComment } from '../services/comments'
import { subscribeComments } from '../services/realtime'

export function useComments(issueId) {
  const queryKey = ['comments', issueId]
  const qc = useQueryClient()

  const query = useQuery({
    queryKey,
    enabled: !!issueId,
    queryFn: () => listComments(issueId)
  })

  React.useEffect(() => {
    if (!issueId) return
    const unsub = subscribeComments(issueId, payload => {
      if (payload.eventType === 'INSERT') {
        qc.setQueryData(queryKey, old => old ? [...old, payload.new] : [payload.new])
      } else if (payload.eventType === 'DELETE') {
        qc.setQueryData(queryKey, old => old?.filter(c => c.id !== payload.old.id) || [])
      }
    })
    return () => unsub()
  }, [issueId])

  const add = async (content) => addComment(issueId, content)
  const remove = async (id) => deleteComment(id)

  return { ...query, add, remove }
}
