'use client';

import { useRef, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

interface RotationHandleProps {
  element: any;
  onRotate: (rotation: number) => void;
}

export function RotationHandle({ element, onRotate }: RotationHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isRotatingRef = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });
  const startAngleRef = useRef(0);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      isRotatingRef.current = true;

      const parent = handle.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }

      startAngleRef.current =
        Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x) * (180 / Math.PI);

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isRotatingRef.current) return;
        const currentAngle =
          Math.atan2(moveEvent.clientY - centerRef.current.y, moveEvent.clientX - centerRef.current.x) *
          (180 / Math.PI);
        const delta = currentAngle - startAngleRef.current;
        startAngleRef.current = currentAngle;
        let newRot = (element.transform.rotation + delta) % 360;
        if (moveEvent.shiftKey) {
          newRot = Math.round(newRot / 15) * 15;
        }
        onRotate(newRot);
      };

      const onMouseUp = () => {
        isRotatingRef.current = false;
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
  }, [element.transform?.rotation, onRotate]);

  return (
    <div
      ref={handleRef}
      className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-violet-600 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md z-30 hover:scale-110 transition-transform"
      title="Rotate element (Hold Shift for 15° increments)"
      data-rotation-handle
    >
      <RotateCw className="w-2.5 h-2.5 text-violet-600" />
      {/* Connector stem */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-2 bg-violet-500 pointer-events-none" />
    </div>
  );
}