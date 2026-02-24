'use client';

import { useServiceDeploys } from '@/hooks/use-service-deploys';
import { useTriggerDeploy } from '@/hooks/use-trigger-deploy';
import { useUIStore } from '@/store/ui-store';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { Rocket, GitCommit, RotateCcw } from 'lucide-react';

interface DeploysTabProps {
  serviceId: string;
  isDatabase?: boolean;
}

export function DeploysTab({ serviceId, isDatabase }: DeploysTabProps) {
  const { data: deploys, isLoading } = useServiceDeploys(isDatabase ? null : serviceId);
  const triggerDeploy = useTriggerDeploy();
  const openRedeployDialog = useUIStore((s) => s.openRedeployDialog);
  const { success, error: showError } = useToast();

  const handleTriggerDeploy = async () => {
    try {
      await triggerDeploy.mutateAsync(serviceId);
      success('Deploy triggered successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to trigger deploy');
    }
  };

  if (isDatabase) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-gray-500">Deploys are not available for databases</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={handleTriggerDeploy} loading={triggerDeploy.isPending} size="sm">
        <Rocket className="h-4 w-4" />
        Trigger Deploy
      </Button>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {deploys && Array.isArray(deploys) && (
        <div className="flex flex-col gap-2">
          {deploys.map((deploy) => {
            const isActive = deploy.status === 'live';
            const canRedeploy = deploy.commit && !isActive;

            return (
              <div
                key={deploy.id}
                className="rounded-lg border border-card-border bg-gray-800/50 p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <StatusBadge status={deploy.status} />
                  <div className="flex items-center gap-2">
                    {canRedeploy && (
                      <button
                        onClick={() =>
                          openRedeployDialog(
                            serviceId,
                            deploy.commit!.id,
                            deploy.commit!.message
                          )
                        }
                        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        title="Redeploy this commit"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Redeploy
                      </button>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(deploy.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {deploy.commit && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <GitCommit className="h-3 w-3" />
                    <span className="truncate">{deploy.commit.message}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Trigger: {deploy.trigger}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
