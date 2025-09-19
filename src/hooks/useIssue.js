import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getIssue } from '../services/issues'
import { subscribeIssues } from '../services/realtime'

export function useIssue(id) {
  const queryKey = ['issue', id]
  const qc = useQueryClient()

  const query = useQuery({
    queryKey,
    enabled: !!id,
    queryFn: () => getIssue(id)
  })

  React.useEffect(() => {
    if (!id) return
    const unsub = subscribeIssues(payload => {
      if (payload.new?.id === id) {
        qc.setQueryData(queryKey, payload.new)
      }
    })
    return () => unsub()
  }, [id])

  return query
}
