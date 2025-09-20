import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

// Subscribes to any insert/update/delete on issues and invalidates lists
export function useRealtimeIssues(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !supabase) return;
    const channel = supabase
      .channel('realtime-issues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, payload => {
        // For inserts we can optimistically prepend instead of full invalidate
        if (payload.eventType === 'INSERT') {
          const newIssue = payload.new;
          const lists = qc.getQueriesData({ queryKey: ['issues'] });
            lists.forEach(([key, data]) => {
              if (Array.isArray(data) && !data.find(i => i.id === newIssue.id)) {
                qc.setQueryData(key, [ { ...newIssue, upvote_count: 0, upvoted: false }, ...data ]);
              } else {
                qc.invalidateQueries({ queryKey: key });
              }
            });
        } else {
          qc.invalidateQueries({ queryKey: ['issues'] });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, qc]);
}