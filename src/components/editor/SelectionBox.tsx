'use client';

import { cn } from '@/lib/utils';
import type { CanvasElement, Vector2D } from '@/types';
import { getElementBounds } from '@/lib/utils';

interface SelectionBoxProps {
  start: Vector2D;
  end: Vector2D;
  onSelect: (id: string, multi?: boolean) => void;
  elements: CanvasElement[];
}

export function SelectionBox({ start, end, onSelect, elements }: SelectionBoxProps) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  // Check which elements are within the selection box
  const selectedElements = elements.filter((el) => {
    const bounds = getElementBounds(el);
    return (
      bounds.x >= x &&
      bounds.y >= y &&
      bounds.x + bounds.width <= x + width &&
      bounds.y + bounds.height <= y + height
    );
  });

  // Auto-select elements when selection box is large enough
  if (width > 10 && height > 10 && selectedElements.length > 0) {
    selectedElements.forEach((el, index) => {
      onSelect(el.id, index > 0);
    });
  }

  return (
    <div
      className={cn(
        'absolute pointer-events-none border-2 border-primary/50 bg-primary/10',
        'selection-box'
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    />
  );
}