import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentProfile, updateProfile, uploadAvatar } from '../services/profile';

export function useProfile() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['profile'], queryFn: getCurrentProfile });

  const update = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] })
  });

  const upload = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] })
  });

  return { ...query, update, upload };
}
