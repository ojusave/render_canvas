'use client';

import { create } from 'zustand';
import type { StagedChange } from '@/types';

interface StagedChangesState {
  changes: StagedChange[];
  reviewDialogOpen: boolean;

  addChange: (change: StagedChange) => void;
  removeChange: (id: string) => void;
  clearAll: () => void;
  getChangeCount: () => number;
  getChangesForService: (serviceId: string) => StagedChange[];
  openReviewDialog: () => void;
  closeReviewDialog: () => void;
}

export const useStagedChangesStore = create<StagedChangesState>()((set, get) => ({
  changes: [],
  reviewDialogOpen: false,

  addChange: (change) =>
    set((state) => {
      // Replace existing change for same service+type
      const filtered = state.changes.filter(
        (c) => !(c.serviceId === change.serviceId && c.type === change.type)
      );
      return { changes: [...filtered, change] };
    }),

  removeChange: (id) =>
    set((state) => ({
      changes: state.changes.filter((c) => c.id !== id),
    })),

  clearAll: () => set({ changes: [] }),

  getChangeCount: () => get().changes.length,

  getChangesForService: (serviceId) =>
    get().changes.filter((c) => c.serviceId === serviceId),

  openReviewDialog: () => set({ reviewDialogOpen: true }),
  closeReviewDialog: () => set({ reviewDialogOpen: false }),
}));
