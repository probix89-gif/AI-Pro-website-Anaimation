'use client';

import { cn } from '@/lib/utils';

interface GridOverlayProps {
  size: { width: number; height: number };
  gridSize: number;
  zoom: number;
}

export function GridOverlay({ size, gridSize, zoom }: GridOverlayProps) {
  const effectiveGridSize = gridSize * zoom;
  const cols = Math.ceil(size.width / gridSize);
  const rows = Math.ceil(size.height / gridSize);

  if (effectiveGridSize < 10) return null; // Don't render grid when too small

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        opacity: zoom > 0.5 ? 0.3 : 0.15,
      }}
    >
      {/* Major grid lines (every 5th line) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize * 5}px ${gridSize * 5}px`,
          opacity: zoom > 0.5 ? 0.1 : 0.05,
        }}
      />
    </div>
  );
}