import { useQuery } from '@tanstack/react-query';
import { listIssues } from '../services/issues';

export function useIssues({ status, category, search, reportedBy, assignedTo, from = 0, to = 49 } = {}) {
  return useQuery({
    queryKey: ['issues', { status, category, search, reportedBy, assignedTo, from, to }],
    queryFn: () => listIssues({ status, category, search, reportedBy, assignedTo, from, to }),
    staleTime: 30_000
  });
}
