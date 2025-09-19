import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listProgress, addProgress, updateProgress } from '../services/progress'
import { subscribeProgress } from '../services/realtime'

export function useIssueProgress(issueId) {
  const queryKey = ['progress', issueId]
  const qc = useQueryClient()

  const query = useQuery({
    queryKey,
    enabled: !!issueId,
    queryFn: () => listProgress(issueId)
  })

  React.useEffect(() => {
    if (!issueId) return
    const unsub = subscribeProgress(issueId, payload => {
      if (payload.eventType === 'INSERT') {
        qc.setQueryData(queryKey, old => old ? [...old, payload.new].sort((a,b)=>a.stage-b.stage) : [payload.new])
      } else if (payload.eventType === 'UPDATE') {
        qc.setQueryData(queryKey, old => old?.map(p => p.id === payload.new.id ? payload.new : p) || [])
      } else if (payload.eventType === 'DELETE') {
        qc.setQueryData(queryKey, old => old?.filter(p => p.id !== payload.old.id) || [])
      }
    })
    return () => unsub()
  }, [issueId])

  const add = (entry) => addProgress({ ...entry, issue_id: issueId })
  const update = (id, updates) => updateProgress(id, updates)

  return { ...query, add, update }
}
