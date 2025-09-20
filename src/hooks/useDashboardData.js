import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../services/dashboard';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    refetchInterval: 60_000 // refresh every minute
  });
}