'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useAuth } from '@/hooks/use-auth';
import { useRenderServices } from '@/hooks/use-render-services';
import { useRenderDatabases } from '@/hooks/use-render-databases';
import { useCanvasPersistence } from '@/hooks/use-canvas-persistence';
import { useGroupPersistence } from '@/hooks/use-group-persistence';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { useCanvasStore } from '@/store/canvas-store';
import { useUIStore } from '@/store/ui-store';
import { useGroupStore } from '@/store/group-store';
import { useSuspendService, useResumeService } from '@/hooks/use-suspend-service';
import { useTriggerDeploy } from '@/hooks/use-trigger-deploy';
import { mapServicesToNodes } from '@/lib/service-mapper';
import { detectConnections } from '@/lib/connection-detector';
import { autoLayout } from '@/lib/auto-layout';
import { ServicePalette } from '@/components/sidebar/ServicePalette';
import { RenderCanvas } from '@/components/canvas/RenderCanvas';
import { DetailPanel } from '@/components/detail-panel/DetailPanel';
import { CreateServiceDialog } from '@/components/dialogs/CreateServiceDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { RedeployConfirmDialog } from '@/components/dialogs/RedeployConfirmDialog';
import { CreateGroupDialog } from '@/components/dialogs/CreateGroupDialog';
import { StagedChangesReviewDialog } from '@/components/dialogs/StagedChangesReviewDialog';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { ContextMenu } from '@/components/canvas/ContextMenu';
import { CanvasErrorBoundary } from '@/components/canvas/CanvasErrorBoundary';
import { CanvasEmptyState } from '@/components/canvas/CanvasEmptyState';
import { CanvasErrorState } from '@/components/canvas/CanvasErrorState';
import { CanvasLoadingSkeleton } from '@/components/canvas/CanvasLoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

export default function CanvasPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, workspaceName, workspaceId, logout } = useAuth();
  const {
    data: services,
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesErr,
    refetch: refetchServices,
  } = useRenderServices(workspaceId);
  const {
    postgres,
    keyValues,
    isLoading: dbLoading,
    isError: dbError,
    error: dbErr,
    refetch: refetchDatabases,
  } = useRenderDatabases(workspaceId);

  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const nodes = useCanvasStore((s) => s.nodes);
  const pendingPositions = useCanvasStore((s) => s.pendingPositions);
  const setWorkspace = useUIStore((s) => s.setWorkspace);
  const createGroup = useGroupStore((s) => s.createGroup);

  const { savePositions, loadPositions } = useCanvasPersistence(workspaceId);
  useGroupPersistence(workspaceId);
  const hasInitialized = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const { success: toastSuccess } = useToast();

  const suspendService = useSuspendService();
  const resumeService = useResumeService();
  const triggerDeploy = useTriggerDeploy();

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !workspaceId)) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, workspaceId, router]);

  // Set workspace in UI store
  useEffect(() => {
    if (workspaceId && workspaceName) {
      setWorkspace(workspaceId, workspaceName);
    }
  }, [workspaceId, workspaceName, setWorkspace]);

  // Reconciliation: merge API data with saved positions or auto-layout
  useEffect(() => {
    if (!services || servicesLoading || dbLoading) return;

    const savedPositions = loadPositions();
    const currentPositionMap: Record<string, { x: number; y: number }> = {};

    for (const node of nodes) {
      currentPositionMap[node.id] = node.position;
    }

    const positionMap = hasInitialized.current
      ? currentPositionMap
      : savedPositions || undefined;

    let newNodes = mapServicesToNodes(services, postgres, keyValues, positionMap || undefined, pendingPositions);

    if (!hasInitialized.current && !savedPositions) {
      newNodes = autoLayout(newNodes, []);
    }

    setNodes(newNodes);
    hasInitialized.current = true;

    const serviceIds = services.map((s) => s.id);
    const serviceNames = new Map<string, string>();
    for (const svc of services) {
      serviceNames.set(svc.id, svc.name);
    }

    detectConnections(serviceIds, postgres, keyValues, serviceNames)
      .then((edges) => {
        setEdges(edges);
        if (!savedPositions && edges.length > 0 && !positionMap) {
          const layoutedNodes = autoLayout(newNodes, edges);
          setNodes(layoutedNodes);
        }
      })
      .catch(() => {});
  }, [services, postgres, keyValues, servicesLoading, dbLoading, loadPositions, setNodes, setEdges]);

  const handleSavePositions = useCallback(() => {
    savePositions(nodes);
  }, [savePositions, nodes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchServices(), refetchDatabases()]);
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace('/');
  };

  const handleAutoLayout = useCallback(() => {
    const currentNodes = useCanvasStore.getState().nodes;
    const currentEdges = useCanvasStore.getState().edges;
    const layoutedNodes = autoLayout(currentNodes, currentEdges);
    setNodes(layoutedNodes);
    handleSavePositions();
  }, [setNodes, handleSavePositions]);

  const handleFitView = useCallback(() => {
    // fitView will be called from inside ReactFlow via useReactFlow
    // This is handled by keyboard shortcuts and command palette through useReactFlow
  }, []);

  const handleTriggerDeploy = useCallback(async (serviceId: string) => {
    try {
      await triggerDeploy.mutateAsync(serviceId);
      toastSuccess('Deploy triggered');
    } catch {}
  }, [triggerDeploy, toastSuccess]);

  const handleSuspend = useCallback(async (serviceId: string) => {
    try {
      const node = useCanvasStore.getState().nodes.find((n) => n.data.serviceId === serviceId);
      if (node) useCanvasStore.getState().updateNodeData(node.id, { status: 'suspended' });
      await suspendService.mutateAsync(serviceId);
      toastSuccess('Service suspended');
    } catch {}
  }, [suspendService, toastSuccess]);

  const handleResume = useCallback(async (serviceId: string) => {
    try {
      const node = useCanvasStore.getState().nodes.find((n) => n.data.serviceId === serviceId);
      if (node) useCanvasStore.getState().updateNodeData(node.id, { status: 'deploying' });
      await resumeService.mutateAsync(serviceId);
      toastSuccess('Service resumed');
    } catch {}
  }, [resumeService, toastSuccess]);

  const handleCreateGroup = useCallback(() => {
    setCreateGroupOpen(true);
  }, []);

  const handleGroupCreated = useCallback((label: string) => {
    const id = createGroup(label);
    // Add a group node to the canvas
    useCanvasStore.getState().addNode({
      id,
      type: 'groupNode',
      position: { x: 200, y: 200 },
      data: {
        label,
        collapsed: false,
        childCount: 0,
      } as any,
      style: { width: 300, height: 200 },
    });
  }, [createGroup]);

  // Command palette integration
  const commandPaletteProps = useCommandPalette({
    onFitView: handleFitView,
    onAutoLayout: handleAutoLayout,
    onRefresh: handleRefresh,
    onDisconnect: handleLogout,
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isDataLoading = servicesLoading || dbLoading;
  const hasError = servicesError || dbError;
  const error = servicesErr || dbErr;
  const isEmpty = !isDataLoading && !hasError && services && services.length === 0 && (!postgres || postgres.length === 0) && (!keyValues || keyValues.length === 0);

  return (
    <div className="flex h-screen flex-col bg-canvas-bg">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-card-border bg-sidebar-bg px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-render-blue flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <circle cx="15" cy="15" r="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">Render Canvas</span>
          </div>
          {workspaceName && (
            <>
              <span className="text-gray-600">/</span>
              <span className="text-sm text-gray-400">{workspaceName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDataLoading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <ServicePalette />
        <CanvasErrorBoundary>
          {isDataLoading && !hasInitialized.current ? (
            <CanvasLoadingSkeleton />
          ) : hasError && error ? (
            <div className="flex-1">
              <CanvasErrorState error={error as Error} onRetry={handleRefresh} />
            </div>
          ) : isEmpty ? (
            <div className="flex-1">
              <CanvasEmptyState />
            </div>
          ) : (
            <RenderCanvas onSavePositions={handleSavePositions} />
          )}
        </CanvasErrorBoundary>
        <DetailPanel />
      </div>

      {/* Overlay dialogs */}
      <CreateServiceDialog />
      <DeleteConfirmDialog />
      <RedeployConfirmDialog />
      <CommandPalette items={commandPaletteProps.items} />
      <ContextMenu
        onTriggerDeploy={handleTriggerDeploy}
        onSuspend={handleSuspend}
        onResume={handleResume}
        onAutoLayout={handleAutoLayout}
        onFitView={handleFitView}
        onRefresh={handleRefresh}
        onCreateGroup={handleCreateGroup}
      />
      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onCreate={handleGroupCreated}
      />
      <StagedChangesReviewDialog />
    </div>
  );
}
