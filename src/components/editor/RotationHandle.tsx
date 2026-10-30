'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

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

      const rect = handle.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      startAngleRef.current = Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x);

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isRotatingRef.current) return;
      const currentAngle = Math.atan2(e.clientY - centerRef.current.y, e.clientX - centerRef.current.x);
      const deltaAngle = currentAngle - startAngleRef.current;
      const newRotation = element.transform.rotation + (deltaAngle * 180) / Math.PI;
      onRotate(newRotation);
    };

    const onMouseUp = () => {
      isRotatingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [element, onRotate]);

  // Position rotation handle above the element
  const bounds = element.getBoundingClientRect?.() || { width: 100, height: 100 };

  return (
    <div
      ref={handleRef}
      className={cn(
        'absolute w-8 h-8 bg-primary border-2 border-primary-foreground rounded-full flex items-center justify-center',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'hover:opacity-100 hover:scale-110',
        'cursor-crosshair'
      )}
      style={{
        top: -30,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      data-rotation-handle
    >
      <RotateCcw className="w-4 h-4" />
    </div>
  );
}