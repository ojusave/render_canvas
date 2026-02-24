'use client';

import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 rounded-lg border border-card-border bg-card-bg p-1 shadow-lg">
      <Tooltip content="Zoom In" position="right">
        <button
          onClick={() => zoomIn()}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </Tooltip>
      <Tooltip content="Zoom Out" position="right">
        <button
          onClick={() => zoomOut()}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </Tooltip>
      <div className="mx-1 border-t border-card-border" />
      <Tooltip content="Fit View" position="right">
        <button
          onClick={() => fitView({ padding: 0.2 })}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  );
}
