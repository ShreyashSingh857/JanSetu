import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateIssueProgress } from '../services/issues';
import { supabase } from '../lib/supabase';

export function useUpdateIssueProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage, status, notes }) => {
      const { data: { user } } = await supabase.auth.getUser();
      return updateIssueProgress({ id, stage, status, notes, actorId: user?.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    }
  });
}
