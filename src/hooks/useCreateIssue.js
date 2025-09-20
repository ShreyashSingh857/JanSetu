import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIssueWithMedia } from '../services/issues';
import { supabase } from '../lib/supabase';

export function useCreateIssue() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, files }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const issueData = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        category: formData.category || 'General',
        status: 'Reported',
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        reported_by: user.id,
      };
      return createIssueWithMedia({ files: files || [], issueData });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    }
  });
}
