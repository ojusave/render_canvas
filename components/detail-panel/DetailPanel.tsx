'use client';

import { X, Pause, Play } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import { useUIStore } from '@/store/ui-store';
import { useSuspendService, useResumeService } from '@/hooks/use-suspend-service';
import { useToast } from '@/components/ui/Toast';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { OverviewTab } from './OverviewTab';
import { DeploysTab } from './DeploysTab';
import { LogsTab } from './LogsTab';
import { MetricsTab } from './MetricsTab';
import { EnvVarsTab } from './EnvVarsTab';
import { SettingsTab } from './SettingsTab';
import { cn } from '@/lib/utils';

export function DetailPanel() {
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen);
  const setDetailPanelOpen = useUIStore((s) => s.setDetailPanelOpen);
  const detailPanelTab = useUIStore((s) => s.detailPanelTab);
  const setDetailPanelTab = useUIStore((s) => s.setDetailPanelTab);

  const suspendService = useSuspendService();
  const resumeService = useResumeService();
  const { success, error: showError } = useToast();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const isOpen = detailPanelOpen && !!selectedNode;

  const handleClose = () => {
    setDetailPanelOpen(false);
    setSelectedNodeId(null);
  };

  const isSuspended = selectedNode?.data.status === 'suspended';
  const isDatabase = selectedNode?.data.isDatabase;

  const handleSuspendResume = async () => {
    if (!selectedNode) return;
    const sid = selectedNode.data.serviceId;
    try {
      if (isSuspended) {
        updateNodeData(selectedNode.id, { status: 'deploying' });
        await resumeService.mutateAsync(sid);
        success('Service resumed');
      } else {
        updateNodeData(selectedNode.id, { status: 'suspended' });
        await suspendService.mutateAsync(sid);
        success('Service suspended');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col border-l border-card-border bg-sidebar-bg transition-all duration-200 overflow-hidden',
        isOpen ? 'w-[360px]' : 'w-0'
      )}
    >
      {selectedNode && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border p-3">
            <h2 className="text-sm font-semibold text-white truncate">
              {selectedNode.data.name}
            </h2>
            <div className="flex items-center gap-1">
              {!isDatabase && (
                <button
                  onClick={handleSuspendResume}
                  disabled={suspendService.isPending || resumeService.isPending}
                  className={cn(
                    'rounded-lg px-2 py-1 text-xs font-medium transition-colors flex items-center gap-1',
                    isSuspended
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-amber-400 hover:bg-amber-500/10'
                  )}
                >
                  {isSuspended ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {isSuspended ? 'Resume' : 'Suspend'}
                </button>
              )}
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={detailPanelTab} onChange={setDetailPanelTab} className="flex flex-col flex-1 min-h-0">
            <TabList className="shrink-0 overflow-x-auto">
              <TabTrigger value="overview">Overview</TabTrigger>
              <TabTrigger value="deploys">Deploys</TabTrigger>
              <TabTrigger value="logs">Logs</TabTrigger>
              <TabTrigger value="metrics">Metrics</TabTrigger>
              <TabTrigger value="env">Env Vars</TabTrigger>
              <TabTrigger value="settings">Settings</TabTrigger>
            </TabList>

            <div className="flex-1 overflow-y-auto">
              <TabContent value="overview">
                <OverviewTab data={selectedNode.data} />
              </TabContent>
              <TabContent value="deploys">
                <DeploysTab serviceId={selectedNode.data.serviceId} isDatabase={selectedNode.data.isDatabase as boolean | undefined} />
              </TabContent>
              <TabContent value="logs">
                <LogsTab serviceId={selectedNode.data.serviceId} />
              </TabContent>
              <TabContent value="metrics">
                <MetricsTab serviceId={selectedNode.data.serviceId} isDatabase={selectedNode.data.isDatabase as boolean | undefined} />
              </TabContent>
              <TabContent value="env">
                <EnvVarsTab serviceId={selectedNode.data.serviceId} />
              </TabContent>
              <TabContent value="settings">
                <SettingsTab data={selectedNode.data} serviceId={selectedNode.data.serviceId} />
              </TabContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  );
}
