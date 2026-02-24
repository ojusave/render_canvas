'use client';

import { create } from 'zustand';

interface PositionSnapshot {
  positions: Record<string, { x: number; y: number }>;
}

interface HistoryState {
  past: PositionSnapshot[];
  future: PositionSnapshot[];
  pushSnapshot: (positions: Record<string, { x: number; y: number }>) => void;
  undo: () => PositionSnapshot | null;
  redo: () => PositionSnapshot | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  past: [],
  future: [],

  pushSnapshot: (positions) =>
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), { positions }],
      future: [],
    })),

  undo: () => {
    const { past } = get();
    if (past.length === 0) return null;
    const snapshot = past[past.length - 1];
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [...state.future, snapshot],
    }));
    return snapshot;
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return null;
    const snapshot = future[future.length - 1];
    set((state) => ({
      future: state.future.slice(0, -1),
      past: [...state.past, snapshot],
    }));
    return snapshot;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
