import { useQuery } from '@tanstack/react-query';
import { fetchGovernmentDashboard } from '../services/govDashboard';

export function useGovDashboard() {
  return useQuery({
    queryKey: ['gov-dashboard'],
    queryFn: fetchGovernmentDashboard,
    refetchInterval: 60_000
  });
}
