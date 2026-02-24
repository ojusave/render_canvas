'use client';

import { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import { useUIStore } from '@/store/ui-store';
import { SERVICE_TYPE_CONFIG } from '@/lib/constants';
import {
  Globe, Rocket, RefreshCw, LayoutGrid, LogOut, Maximize, Plus,
  type LucideIcon,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  group: string;
  shortcut?: string;
  action: () => void;
}

interface UseCommandPaletteResult {
  items: CommandItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export function useCommandPalette({
  onFitView,
  onAutoLayout,
  onRefresh,
  onDisconnect,
}: {
  onFitView: () => void;
  onAutoLayout: () => void;
  onRefresh: () => void;
  onDisconnect: () => void;
}): UseCommandPaletteResult {
  const nodes = useCanvasStore((s) => s.nodes);
  const isOpen = useUIStore((s) => s.commandPaletteOpen);
  const open = useUIStore((s) => s.openCommandPalette);
  const close = useUIStore((s) => s.closeCommandPalette);

  const items = useMemo(() => {
    const result: CommandItem[] = [];

    // Services group — all canvas nodes
    for (const node of nodes) {
      const config = SERVICE_TYPE_CONFIG[node.data.type];
      result.push({
        id: `service-${node.id}`,
        label: node.data.name,
        description: config?.label || node.data.type,
        icon: config?.icon || Globe,
        group: 'Services',
        action: () => {
          useCanvasStore.getState().setSelectedNodeId(node.id);
          useUIStore.getState().setDetailPanelOpen(true);
          close();
        },
      });
    }

    // Actions group
    result.push({
      id: 'action-create',
      label: 'Create Service',
      description: 'Create a new service or database',
      icon: Plus,
      group: 'Actions',
      action: () => {
        useUIStore.getState().openCreateDialog('web_service');
        close();
      },
    });

    result.push({
      id: 'action-deploy',
      label: 'Trigger Deploy',
      description: 'Deploy the selected service',
      icon: Rocket,
      group: 'Actions',
      action: () => {
        close();
      },
    });

    result.push({
      id: 'action-refresh',
      label: 'Refresh',
      description: 'Reload all services',
      icon: RefreshCw,
      group: 'Actions',
      action: () => {
        onRefresh();
        close();
      },
    });

    result.push({
      id: 'action-autolayout',
      label: 'Auto Layout',
      description: 'Automatically arrange all nodes',
      icon: LayoutGrid,
      group: 'Actions',
      action: () => {
        onAutoLayout();
        close();
      },
    });

    result.push({
      id: 'action-disconnect',
      label: 'Disconnect',
      description: 'Sign out of Render',
      icon: LogOut,
      group: 'Actions',
      action: () => {
        onDisconnect();
        close();
      },
    });

    // Navigation group
    result.push({
      id: 'nav-fitview',
      label: 'Fit View',
      description: 'Zoom to fit all nodes',
      icon: Maximize,
      group: 'Navigation',
      shortcut: 'Space',
      action: () => {
        onFitView();
        close();
      },
    });

    return result;
  }, [nodes, close, onFitView, onAutoLayout, onRefresh, onDisconnect]);

  return { items, isOpen, open, close };
}
