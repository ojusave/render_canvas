'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import { useStagedChangesStore } from '@/store/staged-changes-store';
import { QUERY_KEYS } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';

interface ApplyResult {
  serviceId: string;
  serviceName: string;
  success: boolean;
  error?: string;
}

export function useApplyStagedChanges() {
  const [isApplying, setIsApplying] = useState(false);
  const [results, setResults] = useState<ApplyResult[]>([]);
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const apply = async () => {
    const changes = useStagedChangesStore.getState().changes;
    if (changes.length === 0) return;

    setIsApplying(true);
    const applyResults: ApplyResult[] = [];

    for (const change of changes) {
      try {
        if (change.type === 'env_var' && change.envVars) {
          await renderClient.put(
            `services/${change.serviceId}/env-vars`,
            change.envVars
          );
        } else if (change.type === 'config' && change.config) {
          await renderClient.patch(
            `services/${change.serviceId}`,
            change.config
          );
        }
        applyResults.push({
          serviceId: change.serviceId,
          serviceName: change.serviceName,
          success: true,
        });
      } catch (err) {
        applyResults.push({
          serviceId: change.serviceId,
          serviceName: change.serviceName,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    setResults(applyResults);

    const successCount = applyResults.filter((r) => r.success).length;
    const failCount = applyResults.filter((r) => !r.success).length;

    if (failCount === 0) {
      useStagedChangesStore.getState().clearAll();
      success(`All ${successCount} changes applied successfully`);
    } else {
      // Remove only successful changes
      const failedIds = new Set(
        applyResults.filter((r) => !r.success).map((r) => r.serviceId)
      );
      const remaining = changes.filter((c) => failedIds.has(c.serviceId));
      useStagedChangesStore.setState({ changes: remaining });
      showError(`${failCount} change(s) failed. ${successCount} succeeded.`);
    }

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
    for (const change of changes) {
      if (change.type === 'env_var') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.envVars(change.serviceId) });
      }
    }

    setIsApplying(false);
  };

  return { apply, isApplying, results };
}
