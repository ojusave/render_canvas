'use client';

import { create } from 'zustand';

interface Group {
  id: string;
  label: string;
  collapsed: boolean;
  childNodeIds: string[];
}

interface GroupState {
  groups: Record<string, Group>;
  createGroup: (label: string) => string;
  deleteGroup: (id: string) => void;
  renameGroup: (id: string, label: string) => void;
  toggleCollapsed: (id: string) => void;
  addNodeToGroup: (groupId: string, nodeId: string) => void;
  removeNodeFromGroup: (groupId: string, nodeId: string) => void;
  setGroups: (groups: Record<string, Group>) => void;
}

let nextGroupId = 1;

export const useGroupStore = create<GroupState>()((set, get) => ({
  groups: {},

  createGroup: (label) => {
    const id = `group-${nextGroupId++}`;
    set((state) => ({
      groups: {
        ...state.groups,
        [id]: { id, label, collapsed: false, childNodeIds: [] },
      },
    }));
    return id;
  },

  deleteGroup: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.groups;
      return { groups: rest };
    }),

  renameGroup: (id, label) =>
    set((state) => ({
      groups: {
        ...state.groups,
        [id]: { ...state.groups[id], label },
      },
    })),

  toggleCollapsed: (id) =>
    set((state) => ({
      groups: {
        ...state.groups,
        [id]: { ...state.groups[id], collapsed: !state.groups[id].collapsed },
      },
    })),

  addNodeToGroup: (groupId, nodeId) =>
    set((state) => {
      const group = state.groups[groupId];
      if (!group || group.childNodeIds.includes(nodeId)) return state;
      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            childNodeIds: [...group.childNodeIds, nodeId],
          },
        },
      };
    }),

  removeNodeFromGroup: (groupId, nodeId) =>
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            childNodeIds: group.childNodeIds.filter((id) => id !== nodeId),
          },
        },
      };
    }),

  setGroups: (groups) => set({ groups }),
}));
