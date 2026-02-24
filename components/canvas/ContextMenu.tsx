'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Rocket, Pause, Play, ScrollText, ExternalLink, Trash2,
  Plus, Group, LayoutGrid, Maximize, RefreshCw,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCanvasStore } from '@/store/canvas-store';
import { ContextMenuItem, ContextMenuSeparator } from './ContextMenuItem';

interface ContextMenuProps {
  onTriggerDeploy: (serviceId: string) => void;
  onSuspend: (serviceId: string) => void;
  onResume: (serviceId: string) => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onRefresh: () => void;
  onCreateGroup: () => void;
}

export function ContextMenu({
  onTriggerDeploy,
  onSuspend,
  onResume,
  onAutoLayout,
  onFitView,
  onRefresh,
  onCreateGroup,
}: ContextMenuProps) {
  const isOpen = useUIStore((s) => s.contextMenuOpen);
  const position = useUIStore((s) => s.contextMenuPosition);
  const target = useUIStore((s) => s.contextMenuTarget);
  const close = useUIStore((s) => s.closeContextMenu);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  // Viewport edge flipping
  useEffect(() => {
    if (!isOpen || !menuRef.current) {
      setAdjustedPos(position);
      return;
    }
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { x, y } = position;
    if (x + rect.width > vw - 8) x = vw - rect.width - 8;
    if (y + rect.height > vh - 8) y = vh - rect.height - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    setAdjustedPos({ x, y });
  }, [isOpen, position]);

  // Close on click outside, scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    const handleScroll = () => close();
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, close]);

  const runAndClose = useCallback(
    (fn: () => void) => () => {
      fn();
      close();
    },
    [close]
  );

  if (!isOpen) return null;

  const node = target?.type === 'node'
    ? useCanvasStore.getState().nodes.find((n) => n.id === target.nodeId)
    : null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[55] min-w-[180px] rounded-lg border border-card-border bg-card-bg py-1.5 shadow-xl animate-fade-in"
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
    >
      {target?.type === 'node' && node ? (
        <>
          {!node.data.isDatabase && (
            <ContextMenuItem
              icon={Rocket}
              label="Trigger Deploy"
              onClick={runAndClose(() => onTriggerDeploy(node.data.serviceId))}
            />
          )}
          {!node.data.isDatabase && node.data.status !== 'suspended' && (
            <ContextMenuItem
              icon={Pause}
              label="Suspend"
              onClick={runAndClose(() => onSuspend(node.data.serviceId))}
            />
          )}
          {!node.data.isDatabase && node.data.status === 'suspended' && (
            <ContextMenuItem
              icon={Play}
              label="Resume"
              onClick={runAndClose(() => onResume(node.data.serviceId))}
            />
          )}
          <ContextMenuItem
            icon={ScrollText}
            label="Open Logs"
            onClick={runAndClose(() => {
              useCanvasStore.getState().setSelectedNodeId(node.id);
              useUIStore.getState().setDetailPanelOpen(true);
              useUIStore.getState().setDetailPanelTab('logs');
            })}
          />
          <ContextMenuItem
            icon={ExternalLink}
            label="Open in Dashboard"
            onClick={runAndClose(() => {
              window.open(node.data.dashboardUrl, '_blank');
            })}
          />
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={Trash2}
            label="Delete"
            danger
            shortcut="Del"
            onClick={runAndClose(() => {
              useUIStore.getState().openDeleteConfirm(node.data.serviceId, node.data.name);
            })}
          />
        </>
      ) : (
        <>
          <ContextMenuItem
            icon={Plus}
            label="Create Service"
            onClick={runAndClose(() => {
              useUIStore.getState().openCreateDialog('web_service');
            })}
          />
          <ContextMenuItem
            icon={Group}
            label="Create Group"
            onClick={runAndClose(onCreateGroup)}
          />
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={LayoutGrid}
            label="Auto Layout"
            onClick={runAndClose(onAutoLayout)}
          />
          <ContextMenuItem
            icon={Maximize}
            label="Fit View"
            shortcut="Space"
            onClick={runAndClose(onFitView)}
          />
          <ContextMenuItem
            icon={RefreshCw}
            label="Refresh"
            onClick={runAndClose(onRefresh)}
          />
        </>
      )}
    </div>,
    document.body
  );
}
