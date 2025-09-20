import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIssueWithMedia } from '../services/issues';
import { supabase } from '../lib/supabase';

export function useCreateIssue() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ files = [], title, description, category, urgency, latitude, longitude }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prepare issue data to match DB schema fields
      const issueData = {
        title,
        description,
        category,
        urgency,
        reporter_id: user.id,
        latitude,
        longitude,
        status: 'open'
      };

      return createIssueWithMedia({ files, issueData });
    },
    onSuccess: (created) => {
      // Invalidate list queries
      qc.invalidateQueries({ queryKey: ['issues'] });
      // Optionally seed cache for single issue
      qc.setQueryData(['issue', created.id], created);
    }
  });
}
