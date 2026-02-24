'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Node } from '@xyflow/react';
import type { CanvasSchema, ServiceNodeData } from '@/types';

const STORAGE_KEY = 'render-canvas-positions';
const SCHEMA_VERSION = 1;

export function useCanvasPersistence(workspaceId: string | null) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePositions = useCallback(
    (nodes: Node<ServiceNodeData>[]) => {
      if (!workspaceId) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const positions: Record<string, { x: number; y: number }> = {};
        for (const node of nodes) {
          positions[node.id] = { x: node.position.x, y: node.position.y };
        }

        const schema: CanvasSchema = {
          version: SCHEMA_VERSION,
          workspaceId,
          positions,
          timestamp: Date.now(),
        };

        try {
          localStorage.setItem(`${STORAGE_KEY}-${workspaceId}`, JSON.stringify(schema));
        } catch {
          // localStorage might be full
        }
      }, 500);
    },
    [workspaceId]
  );

  const loadPositions = useCallback((): Record<string, { x: number; y: number }> | null => {
    if (!workspaceId) return null;

    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-${workspaceId}`);
      if (!raw) return null;

      const schema: CanvasSchema = JSON.parse(raw);
      if (schema.version !== SCHEMA_VERSION || schema.workspaceId !== workspaceId) return null;

      return schema.positions;
    } catch {
      return null;
    }
  }, [workspaceId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { savePositions, loadPositions };
}
