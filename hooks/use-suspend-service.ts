'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import { QUERY_KEYS } from '@/lib/constants';

export function useSuspendService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) =>
      renderClient.post(`services/${serviceId}/suspend`),
    onSuccess: (_data, serviceId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deploys(serviceId) });
    },
  });
}

export function useResumeService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) =>
      renderClient.post(`services/${serviceId}/resume`),
    onSuccess: (_data, serviceId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deploys(serviceId) });
    },
  });
}
