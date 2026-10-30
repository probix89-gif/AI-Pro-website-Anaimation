'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  element: any;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onResize: (delta: { x: number; y: number }) => void;
}

export function ResizeHandle({ element, position, onResize }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startScaleRef = useRef({ x: 1, y: 1 });

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isResizingRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startScaleRef.current = { x: element.transform.scale.x, y: element.transform.scale.y };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      onResize({ x: dx, y: dy });
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [element, position, onResize]);

  const cursorMap = {
    'top-left': 'nwse-resize',
    'top-right': 'nesw-resize',
    'bottom-left': 'nesw-resize',
    'bottom-right': 'nwse-resize',
  };

  const positionStyles = {
    'top-left': { top: -4, left: -4 },
    'top-right': { top: -4, right: -4 },
    'bottom-left': { bottom: -4, left: -4 },
    'bottom-right': { bottom: -4, right: -4 },
  };

  return (
    <div
      ref={handleRef}
      className={cn(
        'absolute w-8 h-8 bg-primary border-2 border-primary-foreground rounded',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'hover:opacity-100 hover:scale-110'
      )}
      style={{
        ...positionStyles[position],
        cursor: cursorMap[position],
        transform: 'translate(-50%, -50%)',
      }}
      data-resize-handle={position}
    />
  );
}