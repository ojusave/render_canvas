'use client';

import { create } from 'zustand';
import type { CreateServiceForm } from '@/types';

interface UIState {
  sidebarCollapsed: boolean;
  detailPanelOpen: boolean;
  detailPanelTab: string;
  workspaceId: string | null;
  workspaceName: string | null;

  // Create dialog
  createDialogOpen: boolean;
  createDialogType: CreateServiceForm['type'] | null;
  createDialogPosition: { x: number; y: number } | null;

  // Delete confirm
  deleteConfirmOpen: boolean;
  deleteConfirmServiceId: string | null;
  deleteConfirmServiceName: string | null;

  // Command palette
  commandPaletteOpen: boolean;

  // Context menu
  contextMenuOpen: boolean;
  contextMenuPosition: { x: number; y: number };
  contextMenuTarget: { type: 'node'; nodeId: string } | { type: 'canvas' } | null;

  // Redeploy dialog
  redeployDialogOpen: boolean;
  redeployServiceId: string | null;
  redeployCommitId: string | null;
  redeployCommitMessage: string | null;

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setDetailPanelOpen: (open: boolean) => void;
  setDetailPanelTab: (tab: string) => void;
  setWorkspace: (id: string | null, name: string | null) => void;

  openCreateDialog: (type: CreateServiceForm['type'], position?: { x: number; y: number }) => void;
  closeCreateDialog: () => void;

  openDeleteConfirm: (serviceId: string, serviceName: string) => void;
  closeDeleteConfirm: () => void;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  openContextMenu: (position: { x: number; y: number }, target: UIState['contextMenuTarget']) => void;
  closeContextMenu: () => void;

  openRedeployDialog: (serviceId: string, commitId: string, commitMessage: string) => void;
  closeRedeployDialog: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  detailPanelOpen: false,
  detailPanelTab: 'overview',
  workspaceId: null,
  workspaceName: null,

  createDialogOpen: false,
  createDialogType: null,
  createDialogPosition: null,

  deleteConfirmOpen: false,
  deleteConfirmServiceId: null,
  deleteConfirmServiceName: null,

  commandPaletteOpen: false,

  contextMenuOpen: false,
  contextMenuPosition: { x: 0, y: 0 },
  contextMenuTarget: null,

  redeployDialogOpen: false,
  redeployServiceId: null,
  redeployCommitId: null,
  redeployCommitMessage: null,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
  setDetailPanelTab: (tab) => set({ detailPanelTab: tab }),
  setWorkspace: (id, name) => set({ workspaceId: id, workspaceName: name }),

  openCreateDialog: (type, position) =>
    set({ createDialogOpen: true, createDialogType: type, createDialogPosition: position || null }),
  closeCreateDialog: () =>
    set({ createDialogOpen: false, createDialogType: null, createDialogPosition: null }),

  openDeleteConfirm: (serviceId, serviceName) =>
    set({ deleteConfirmOpen: true, deleteConfirmServiceId: serviceId, deleteConfirmServiceName: serviceName }),
  closeDeleteConfirm: () =>
    set({ deleteConfirmOpen: false, deleteConfirmServiceId: null, deleteConfirmServiceName: null }),

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  openContextMenu: (position, target) =>
    set({ contextMenuOpen: true, contextMenuPosition: position, contextMenuTarget: target }),
  closeContextMenu: () =>
    set({ contextMenuOpen: false, contextMenuTarget: null }),

  openRedeployDialog: (serviceId, commitId, commitMessage) =>
    set({ redeployDialogOpen: true, redeployServiceId: serviceId, redeployCommitId: commitId, redeployCommitMessage: commitMessage }),
  closeRedeployDialog: () =>
    set({ redeployDialogOpen: false, redeployServiceId: null, redeployCommitId: null, redeployCommitMessage: null }),
}));
