'use client';

import { useUIStore } from '@/store/ui-store';
import { useRedeploy } from '@/hooks/use-redeploy';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { RotateCcw, GitCommit } from 'lucide-react';

export function RedeployConfirmDialog() {
  const open = useUIStore((s) => s.redeployDialogOpen);
  const serviceId = useUIStore((s) => s.redeployServiceId);
  const commitId = useUIStore((s) => s.redeployCommitId);
  const commitMessage = useUIStore((s) => s.redeployCommitMessage);
  const closeDialog = useUIStore((s) => s.closeRedeployDialog);
  const redeploy = useRedeploy();
  const { success, error: showError } = useToast();

  const handleRedeploy = async () => {
    if (!serviceId || !commitId) return;
    try {
      await redeploy.mutateAsync({ serviceId, commitId });
      success('Redeploy triggered successfully');
      closeDialog();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to trigger redeploy');
    }
  };

  return (
    <Dialog open={open} onClose={closeDialog} title="Redeploy">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
          <RotateCcw className="h-6 w-6 text-amber-400" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-300">
            Are you sure you want to redeploy to this commit?
          </p>
          {commitId && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-card-border bg-gray-800/50 px-3 py-2">
              <GitCommit className="h-3.5 w-3.5 text-gray-500" />
              <code className="text-xs text-render-blue">{commitId.slice(0, 7)}</code>
              {commitMessage && (
                <span className="text-xs text-gray-400 truncate max-w-[200px]">{commitMessage}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={closeDialog}>Cancel</Button>
          <Button variant="danger" onClick={handleRedeploy} loading={redeploy.isPending}>
            <RotateCcw className="h-3.5 w-3.5" />
            Redeploy
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
