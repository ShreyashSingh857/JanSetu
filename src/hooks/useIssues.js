import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listIssues, toggleUpvote } from '../services/issues'
import { subscribeIssues } from '../services/realtime'

export function useIssues(filters) {
  const queryKey = ['issues', filters]
  const qc = useQueryClient()

  const query = useQuery({
    queryKey,
    queryFn: () => listIssues(filters || {}),
  })

  // realtime sync
  React.useEffect(() => {
    const unsub = subscribeIssues(payload => {
      if (payload.eventType === 'INSERT') {
        qc.setQueryData(queryKey, old => old ? [payload.new, ...old] : [payload.new])
      } else if (payload.eventType === 'UPDATE') {
        qc.setQueryData(queryKey, old => old?.map(i => i.id === payload.new.id ? payload.new : i) || [])
      } else if (payload.eventType === 'DELETE') {
        qc.setQueryData(queryKey, old => old?.filter(i => i.id !== payload.old.id) || [])
      }
    })
    return () => unsub()
  }, [JSON.stringify(filters)])

  const upvote = async (issueId) => {
    await toggleUpvote(issueId)
  }

  return { ...query, upvote }
}
