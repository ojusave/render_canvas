'use client';

import { create } from 'zustand';
import { type Node, type Edge, applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange } from '@xyflow/react';
import type { ServiceNodeData, ConnectionEdgeData } from '@/types';

interface CanvasState {
  nodes: Node<ServiceNodeData>[];
  edges: Edge<ConnectionEdgeData>[];
  selectedNodeId: string | null;
  pendingPositions: Record<string, { x: number; y: number }>;

  setNodes: (nodes: Node<ServiceNodeData>[]) => void;
  setEdges: (edges: Edge<ConnectionEdgeData>[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange<Node<ServiceNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge<ConnectionEdgeData>>[]) => void;
  updateNodeData: (nodeId: string, data: Partial<ServiceNodeData>) => void;
  addPendingPosition: (id: string, position: { x: number; y: number }) => void;
  consumePendingPosition: (id: string) => { x: number; y: number } | undefined;
  addNode: (node: Node<ServiceNodeData>) => void;
  removeNode: (nodeId: string) => void;
  setNodeParent: (nodeId: string, parentId: string | null) => void;
  restorePositions: (posMap: Record<string, { x: number; y: number }>) => void;
}

export const useCanvasStore = create<CanvasState>()((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  pendingPositions: {},

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),

  addPendingPosition: (id, position) =>
    set((state) => ({
      pendingPositions: { ...state.pendingPositions, [id]: position },
    })),

  consumePendingPosition: (id) => {
    const pos = get().pendingPositions[id];
    if (pos) {
      set((state) => {
        const { [id]: _, ...rest } = state.pendingPositions;
        return { pendingPositions: rest };
      });
    }
    return pos;
  },

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })),

  setNodeParent: (nodeId, parentId) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, parentId: parentId ?? undefined, extent: parentId ? 'parent' as const : undefined }
          : node
      ),
    })),

  restorePositions: (posMap) =>
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        position: posMap[node.id] || node.position,
      })),
    })),
}));
