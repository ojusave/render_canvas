'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderClient } from '@/lib/render-client';
import type { RenderService, CreateServiceForm, RenderPostgres, RenderKeyValue } from '@/types';
import { QUERY_KEYS } from '@/lib/constants';
import { useUIStore } from '@/store/ui-store';

function buildCreatePayload(form: CreateServiceForm, ownerId: string) {
  if (form.type === 'postgres') {
    return {
      endpoint: 'postgres',
      body: {
        ownerId,
        name: form.name,
        plan: form.plan || 'free',
        region: form.region || 'oregon',
        version: form.version || '18',
        databaseName: form.databaseName || undefined,
        databaseUser: form.databaseUser || undefined,
      },
    };
  }

  if (form.type === 'key_value') {
    return {
      endpoint: 'key-value',
      body: {
        ownerId,
        name: form.name,
        plan: form.plan || 'free',
        region: form.region || 'oregon',
        maxmemoryPolicy: form.maxMemoryPolicy || 'allkeys_lru',
      },
    };
  }

  // Compute services
  const details: Record<string, unknown> = {};

  if (form.runtime) details.env = form.runtime;
  if (form.plan) details.plan = form.plan;
  if (form.region) details.region = form.region;
  if (form.buildCommand) details.buildCommand = form.buildCommand;
  if (form.startCommand) details.startCommand = form.startCommand;
  if (form.schedule) details.schedule = form.schedule;
  if (form.publishPath) details.publishPath = form.publishPath;
  if (form.healthCheckPath) details.healthCheckPath = form.healthCheckPath;
  if (form.numInstances) details.numInstances = form.numInstances;

  const body: Record<string, unknown> = {
    ownerId,
    type: form.type,
    name: form.name,
    autoDeploy: form.autoDeploy !== false ? 'yes' : 'no',
    repo: form.repo,
    branch: form.branch || 'main',
    serviceDetails: details,
  };

  if (form.envVars && form.envVars.length > 0) {
    body.envVars = form.envVars;
  }

  return { endpoint: 'services', body };
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const workspaceId = useUIStore((s) => s.workspaceId);

  return useMutation({
    mutationFn: async (form: CreateServiceForm) => {
      if (!workspaceId) throw new Error('No workspace selected');
      const { endpoint, body } = buildCreatePayload(form, workspaceId);
      return renderClient.post<RenderService | RenderPostgres | RenderKeyValue>(endpoint, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.postgres });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.keyValue });
    },
  });
}
