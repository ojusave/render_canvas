'use client';

import { useMemo } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useStagedChangesStore } from '@/store/staged-changes-store';
import { useApplyStagedChanges } from '@/hooks/use-apply-staged-changes';
import type { StagedChange } from '@/types';

export function StagedChangesReviewDialog() {
  const open = useStagedChangesStore((s) => s.reviewDialogOpen);
  const close = useStagedChangesStore((s) => s.closeReviewDialog);
  const changes = useStagedChangesStore((s) => s.changes);
  const removeChange = useStagedChangesStore((s) => s.removeChange);
  const { apply, isApplying } = useApplyStagedChanges();

  // Group changes by service
  const grouped = useMemo(() => {
    const map = new Map<string, StagedChange[]>();
    for (const c of changes) {
      const existing = map.get(c.serviceId) || [];
      existing.push(c);
      map.set(c.serviceId, existing);
    }
    return map;
  }, [changes]);

  const handleApply = async () => {
    await apply();
    if (useStagedChangesStore.getState().changes.length === 0) {
      close();
    }
  };

  return (
    <Dialog open={open} onClose={close} title="Review Staged Changes" className="max-w-xl">
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        {changes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No pending changes</p>
        ) : (
          Array.from(grouped.entries()).map(([serviceId, serviceChanges]) => (
            <div key={serviceId} className="rounded-lg border border-card-border bg-gray-800/50 p-3">
              <p className="text-sm font-medium text-white mb-2">
                {serviceChanges[0].serviceName}
              </p>
              {serviceChanges.map((change) => (
                <div key={change.id} className="flex items-start justify-between gap-2 mb-2 last:mb-0">
                  <div className="flex-1 min-w-0">
                    {change.type === 'env_var' && change.envVars && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">Environment Variables</p>
                        {change.envVars.map((env, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-green-400">+</span>
                            <span className="text-white">{env.key}</span>
                            <span className="text-gray-600">=</span>
                            <span className="text-gray-400 truncate">{env.value || '***'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {change.type === 'config' && change.config && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">Configuration</p>
                        {change.config.name && (
                          <ConfigDiff field="Name" value={change.config.name} />
                        )}
                        {change.config.branch && (
                          <ConfigDiff field="Branch" value={change.config.branch} />
                        )}
                        {change.config.autoDeploy && (
                          <ConfigDiff field="Auto-Deploy" value={change.config.autoDeploy} />
                        )}
                        {change.config.serviceDetails?.buildCommand && (
                          <ConfigDiff field="Build Command" value={change.config.serviceDetails.buildCommand} />
                        )}
                        {change.config.serviceDetails?.startCommand && (
                          <ConfigDiff field="Start Command" value={change.config.serviceDetails.startCommand} />
                        )}
                        {change.config.serviceDetails?.plan && (
                          <ConfigDiff field="Plan" value={change.config.serviceDetails.plan} />
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeChange(change.id)}
                    className="rounded p-1 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    title="Remove this change"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {changes.length > 0 && (
        <div className="flex justify-end gap-3 pt-4 border-t border-card-border mt-4">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleApply} loading={isApplying}>
            Apply All ({changes.length})
          </Button>
        </div>
      )}
    </Dialog>
  );
}

function ConfigDiff({ field, value }: { field: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-yellow-400">~</span>
      <span className="text-gray-500">{field}:</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
