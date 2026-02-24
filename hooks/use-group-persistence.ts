'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGroupStore } from '@/store/group-store';

const STORAGE_KEY = 'render-canvas-groups';

export function useGroupPersistence(workspaceId: string | null) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const groups = useGroupStore((s) => s.groups);
  const setGroups = useGroupStore((s) => s.setGroups);

  // Save groups with debounce
  useEffect(() => {
    if (!workspaceId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          `${STORAGE_KEY}-${workspaceId}`,
          JSON.stringify(groups)
        );
      } catch {
        // localStorage might be full
      }
    }, 500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [groups, workspaceId]);

  // Load groups on mount
  const loadGroups = useCallback(() => {
    if (!workspaceId) return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${workspaceId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setGroups(parsed);
      }
    } catch {
      // ignore
    }
  }, [workspaceId, setGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);
}
