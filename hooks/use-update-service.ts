'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import { QUERY_KEYS } from '@/lib/constants';
import type { UpdateServiceForm } from '@/types';

export function useUpdateService(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceForm) =>
      renderClient.patch(`services/${serviceId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
    },
  });
}
