'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type OnNodeDrag,
  type NodeMouseHandler,
  useReactFlow,
} from '@xyflow/react';
import { useCanvasStore } from '@/store/canvas-store';
import { useUIStore } from '@/store/ui-store';
import { useHistoryStore } from '@/store/history-store';
import { useGroupStore } from '@/store/group-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { nodeTypes } from '@/components/nodes';
import { ConnectionEdge } from './ConnectionEdge';
import { CanvasControls } from './CanvasControls';
import { StagedChangesBanner } from './StagedChangesBanner';

const edgeTypes = {
  connectionEdge: ConnectionEdge,
};

interface RenderCanvasProps {
  onSavePositions?: () => void;
}

export function RenderCanvas({ onSavePositions }: RenderCanvasProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);
  const setDetailPanelOpen = useUIStore((s) => s.setDetailPanelOpen);
  const openCreateDialog = useUIStore((s) => s.openCreateDialog);
  const openContextMenu = useUIStore((s) => s.openContextMenu);
  const { screenToFlowPosition } = useReactFlow();

  // Capture position snapshot on drag start for undo history
  const dragStartPositions = useRef<Record<string, { x: number; y: number }>>({});

  useKeyboardShortcuts();

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
      setDetailPanelOpen(true);
    },
    [setSelectedNodeId, setDetailPanelOpen]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setDetailPanelOpen(false);
    useUIStore.getState().closeContextMenu();
  }, [setSelectedNodeId, setDetailPanelOpen]);

  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    // Capture current positions for undo
    const currentNodes = useCanvasStore.getState().nodes;
    const positions: Record<string, { x: number; y: number }> = {};
    for (const node of currentNodes) {
      positions[node.id] = { ...node.position };
    }
    dragStartPositions.current = positions;
  }, []);

  const onNodeDragStop: OnNodeDrag = useCallback(() => {
    // Push to undo history
    if (Object.keys(dragStartPositions.current).length > 0) {
      useHistoryStore.getState().pushSnapshot(dragStartPositions.current);
      dragStartPositions.current = {};
    }
    onSavePositions?.();
  }, [onSavePositions]);

  // Group drop-target detection during drag
  const onNodeDrag: OnNodeDrag = useCallback((_event, draggedNode) => {
    const allNodes = useCanvasStore.getState().nodes;
    const groups = useGroupStore.getState().groups;

    // Check if dragged node center is inside a group node
    const cx = draggedNode.position.x + 100; // approximate center
    const cy = draggedNode.position.y + 35;

    for (const node of allNodes) {
      if (node.type !== 'groupNode' || node.id === draggedNode.id) continue;
      const gw = 300;
      const gh = 200;
      const inside =
        cx > node.position.x &&
        cx < node.position.x + gw &&
        cy > node.position.y &&
        cy < node.position.y + gh;

      useCanvasStore.getState().updateNodeData(node.id, { isDropTarget: inside });
    }
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/rendercanvas');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      openCreateDialog(type as any, position);
    },
    [screenToFlowPosition, openCreateDialog]
  );

  // Right-click on node
  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      openContextMenu(
        { x: event.clientX, y: event.clientY },
        { type: 'node', nodeId: node.id }
      );
    },
    [openContextMenu]
  );

  // Right-click on canvas
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      openContextMenu(
        { x: event.clientX, y: event.clientY },
        { type: 'canvas' }
      );
    },
    [openContextMenu]
  );

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        colorMode="dark"
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'connectionEdge' }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#374151" />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
          className="!bg-sidebar-bg !border-card-border"
        />
      </ReactFlow>
      <CanvasControls />
      <StagedChangesBanner />
    </div>
  );
}
