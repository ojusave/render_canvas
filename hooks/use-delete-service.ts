'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import { QUERY_KEYS } from '@/lib/constants';

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, isDatabase, dbType }: { serviceId: string; isDatabase?: boolean; dbType?: 'postgres' | 'key_value' }) => {
      if (isDatabase) {
        const endpoint = dbType === 'key_value' ? `key-value/${serviceId}` : `postgres/${serviceId}`;
        return renderClient.delete(endpoint);
      }
      return renderClient.delete(`services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postgres });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.keyValue });
    },
  });
}
