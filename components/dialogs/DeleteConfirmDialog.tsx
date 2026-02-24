'use client';

import { useUIStore } from '@/store/ui-store';
import { useDeleteService } from '@/hooks/use-delete-service';
import { useCanvasStore } from '@/store/canvas-store';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export function DeleteConfirmDialog() {
  const open = useUIStore((s) => s.deleteConfirmOpen);
  const serviceId = useUIStore((s) => s.deleteConfirmServiceId);
  const serviceName = useUIStore((s) => s.deleteConfirmServiceName);
  const closeConfirm = useUIStore((s) => s.closeDeleteConfirm);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const deleteService = useDeleteService();
  const { success, error: showError } = useToast();

  const node = nodes.find((n) => n.data.serviceId === serviceId);
  const isDatabase = node?.data.isDatabase;
  const dbType = node?.data.type as 'postgres' | 'key_value' | undefined;

  const handleDelete = async () => {
    if (!serviceId) return;
    try {
      await deleteService.mutateAsync({ serviceId, isDatabase, dbType });
      success(`${serviceName} deleted successfully`);
      setSelectedNodeId(null);
      closeConfirm();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  return (
    <Dialog open={open} onClose={closeConfirm} title="Delete Service">
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-300">
            Are you sure you want to delete <span className="font-semibold text-white">{serviceName}</span>?
          </p>
          <p className="mt-1 text-xs text-gray-500">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={closeConfirm}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteService.isPending}>
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
