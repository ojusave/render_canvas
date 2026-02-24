'use client';

import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useUIStore } from '@/store/ui-store';
import { useCanvasStore } from '@/store/canvas-store';
import { useHistoryStore } from '@/store/history-store';

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts() {
  const { fitView } = useReactFlow();
  const setNodes = useCanvasStore((s) => s.setNodes);
  const nodes = useCanvasStore((s) => s.nodes);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+K or / → open command palette
      if ((isMod && e.key === 'k') || (e.key === '/' && !isMod)) {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
        return;
      }

      // Escape → cascade close: command palette → context menu → detail panel
      if (e.key === 'Escape') {
        const ui = useUIStore.getState();
        if (ui.commandPaletteOpen) {
          ui.closeCommandPalette();
          return;
        }
        if (ui.contextMenuOpen) {
          ui.closeContextMenu();
          return;
        }
        if (ui.detailPanelOpen) {
          ui.setDetailPanelOpen(false);
          useCanvasStore.getState().setSelectedNodeId(null);
          return;
        }
        return;
      }

      // Delete/Backspace → open delete confirmation for selected node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = useCanvasStore.getState().selectedNodeId;
        if (!id) return;
        const node = useCanvasStore.getState().nodes.find((n) => n.id === id);
        if (node) {
          e.preventDefault();
          useUIStore.getState().openDeleteConfirm(node.data.serviceId, node.data.name);
        }
        return;
      }

      // Cmd+Z → undo, Cmd+Shift+Z → redo
      if (isMod && e.key === 'z') {
        e.preventDefault();
        const history = useHistoryStore.getState();
        if (e.shiftKey) {
          const snapshot = history.redo();
          if (snapshot) {
            const currentNodes = useCanvasStore.getState().nodes;
            useCanvasStore.getState().setNodes(
              currentNodes.map((n) => ({
                ...n,
                position: snapshot.positions[n.id] || n.position,
              }))
            );
          }
        } else {
          const snapshot = history.undo();
          if (snapshot) {
            const currentNodes = useCanvasStore.getState().nodes;
            useCanvasStore.getState().setNodes(
              currentNodes.map((n) => ({
                ...n,
                position: snapshot.positions[n.id] || n.position,
              }))
            );
          }
        }
        return;
      }

      // Space → fit view
      if (e.key === ' ') {
        e.preventDefault();
        fitView({ padding: 0.2 });
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [fitView, setNodes, nodes, selectedNodeId]);
}
