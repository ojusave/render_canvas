'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import type { Deploy } from '@/types';
import { QUERY_KEYS } from '@/lib/constants';

export function useRedeploy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, commitId }: { serviceId: string; commitId: string }) =>
      renderClient.post<Deploy>(`services/${serviceId}/deploys`, { commitId }),
    onSuccess: (_data, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deploys(serviceId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
    },
  });
}
