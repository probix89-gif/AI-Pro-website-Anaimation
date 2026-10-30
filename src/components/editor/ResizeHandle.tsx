'use client';

import { useRef, useEffect } from 'react';

interface ResizeHandleProps {
  element: any;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onResize: (delta: { x: number; y: number }) => void;
}

export function ResizeHandle({ element, position, onResize }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isResizingRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingRef.current) return;
        const dx = moveEvent.clientX - startPosRef.current.x;
        const dy = moveEvent.clientY - startPosRef.current.y;
        startPosRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
        onResize({ x: dx, y: dy });
      };

      const onMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
    };
  }, [onResize]);

  const cursorMap = {
    'top-left': 'nwse-resize',
    'top-right': 'nesw-resize',
    'bottom-left': 'nesw-resize',
    'bottom-right': 'nwse-resize',
  };

  const positionStyles = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 },
  };

  return (
    <div
      ref={handleRef}
      className="absolute w-2.5 h-2.5 bg-white border-2 border-violet-600 rounded-[2px] shadow-sm z-30 hover:scale-125 transition-transform"
      style={{
        ...positionStyles[position],
        cursor: cursorMap[position],
        transform: 'translate(-50%, -50%)',
      }}
      data-resize-handle={position}
    />
  );
}