'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import type { EnvVar } from '@/types';
import { QUERY_KEYS } from '@/lib/constants';

export function useServiceEnvVars(serviceId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.envVars(serviceId || ''),
    queryFn: async () => {
      const data = await renderClient.get<Array<{ envVar: EnvVar; cursor: string }>>(
        `services/${serviceId}/env-vars`
      );
      return (data || []).map((item) => item.envVar);
    },
    enabled: !!serviceId,
  });
}

export function useUpdateEnvVars(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (envVars: EnvVar[]) =>
      renderClient.put<EnvVar[]>(`services/${serviceId}/env-vars`, envVars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.envVars(serviceId) });
    },
  });
}
