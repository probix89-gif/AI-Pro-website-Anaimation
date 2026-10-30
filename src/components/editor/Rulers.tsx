'use client';

import { cn } from '@/lib/utils';

interface RulersProps {
  zoom: number;
  pan: { x: number; y: number };
  containerSize: { width: number; height: number };
  canvasSize: { width: number; height: number };
}

export function Rulers({ zoom, pan, containerSize, canvasSize }: RulersProps) {
  const canvasLeft = pan.x + (containerSize.width - canvasSize.width * zoom) / 2;
  const canvasTop = pan.y + (containerSize.height - canvasSize.height * zoom) / 2;
  const canvasWidth = canvasSize.width * zoom;
  const canvasHeight = canvasSize.height * zoom;

  // Only show rulers when zoomed in enough
  if (zoom < 0.3) return null;

  const majorTick = 100;
  const minorTick = 10;

  return (
    <div className="absolute top-0 left-0 pointer-events-none z-20">
      {/* Horizontal Ruler */}
      <div
        className="absolute h-6 bg-secondary/90 border-b border-border backdrop-blur-sm"
        style={{
          left: canvasLeft,
          top: canvasTop - 6,
          width: canvasWidth,
        }}
      >
        {Array.from({ length: Math.ceil(canvasSize.width / majorTick) + 1 }).map((_, i) => {
          const x = i * majorTick * zoom;
          return (
            <div
              key={i}
              className="absolute top-0 w-px bg-border"
              style={{
                left: x,
                height: i % 5 === 0 ? '100%' : '50%',
              }}
            >
              {i % 5 === 0 && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap"
                  style={{ transform: 'translateX(-50%) translateY(2px)' }}
                >
                  {i * majorTick}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical Ruler */}
      <div
        className="absolute w-6 bg-secondary/90 border-r border-border backdrop-blur-sm"
        style={{
          top: canvasTop,
          left: canvasLeft - 6,
          height: canvasHeight,
        }}
      >
        {Array.from({ length: Math.ceil(canvasSize.height / majorTick) + 1 }).map((_, i) => {
          const y = i * majorTick * zoom;
          return (
            <div
              key={i}
              className="absolute left-0 h-px bg-border"
              style={{
                top: y,
                width: i % 5 === 0 ? '100%' : '50%',
              }}
            >
              {i % 5 === 0 && (
                <span
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground whitespace-nowrap pr-1"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {i * majorTick}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Corner */}
      <div
        className="absolute w-6 h-6 bg-secondary/90 border-b border-r border-border backdrop-blur-sm"
        style={{
          top: canvasTop - 6,
          left: canvasLeft - 6,
        }}
      />
    </div>
  );
}