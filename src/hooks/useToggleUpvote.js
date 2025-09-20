import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleUpvote } from '../services/issues';

export function useToggleUpvote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (issueId) => {
      return { issueId, ...(await toggleUpvote(issueId)) };
    },
    onMutate: async (issueId) => {
      const lists = qc.getQueriesData({ queryKey: ['issues'] });
      const prev = lists.map(([key, data]) => [key, data]);
      lists.forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        qc.setQueryData(key, data.map(i => i.id === issueId ? {
          ...i,
          upvoted: !i.upvoted,
          upvote_count: (i.upvote_count || 0) + (i.upvoted ? -1 : 1)
        } : i));
      });
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: (res) => {
      const lists = qc.getQueriesData({ queryKey: ['issues'] });
      lists.forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        qc.setQueryData(key, data.map(i => i.id === res.issueId ? { ...i, upvoted: res.upvoted, upvote_count: res.total } : i));
      });
    }
  });
}