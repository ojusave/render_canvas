'use client';

const skeletonNodes = [
  { x: 100, y: 80, w: 200, h: 70 },
  { x: 380, y: 60, w: 200, h: 70 },
  { x: 660, y: 100, w: 200, h: 70 },
  { x: 200, y: 220, w: 200, h: 70 },
  { x: 520, y: 240, w: 200, h: 70 },
];

export function CanvasLoadingSkeleton() {
  return (
    <div className="flex-1 relative overflow-hidden bg-canvas-bg">
      {/* Dot pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <pattern id="skeleton-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#374151" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#skeleton-dots)" />
      </svg>

      {/* Skeleton nodes */}
      {skeletonNodes.map((node, i) => (
        <div
          key={i}
          className="absolute rounded-xl border border-card-border bg-card-bg animate-pulse"
          style={{
            left: node.x,
            top: node.y,
            width: node.w,
            height: node.h,
          }}
        >
          <div className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-700" />
            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-gray-700 mb-2" />
              <div className="h-2 w-16 rounded bg-gray-800" />
            </div>
          </div>
        </div>
      ))}

      {/* Skeleton edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="300" y1="115" x2="380" y2="95" stroke="#374151" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
        <line x1="580" y1="95" x2="660" y2="135" stroke="#374151" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
        <line x1="300" y1="125" x2="300" y2="220" stroke="#374151" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
      </svg>
    </div>
  );
}
