'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { CanvasElement } from '@/types';
import { ResizeHandle } from './ResizeHandle';
import { RotationHandle } from './RotationHandle';

interface ElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onHover: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
}

export function ElementRenderer({
  element,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onUpdate,
  onDelete,
}: ElementRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [textContent, setTextContent] = useState('');

  const baseWidth = element.type === 'text' ? 240 : 160;
  const baseHeight = element.type === 'text' ? 60 : 120;

  useEffect(() => {
    if (element.type === 'text' && (element as any).content !== undefined) {
      setTextContent((element as any).content || '');
    }
  }, [element]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked) return;
    if (isEditingText) return;
    e.stopPropagation();

    onSelect(element.id, e.shiftKey);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: element.transform.position.x, y: element.transform.position.y });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const zoom = (ref.current?.closest('[data-zoom]')?.getAttribute('data-zoom')
        ? parseFloat(ref.current.closest('[data-zoom]')!.getAttribute('data-zoom')!)
        : 1) || 1;

      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;

      onUpdate(element.id, {
        transform: {
          ...element.transform,
          position: {
            x: Math.round(elementStart.x + dx),
            y: Math.round(elementStart.y + dy),
          },
        },
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, elementStart, element.id, element.transform, onUpdate]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text' && !element.locked) {
      setIsEditingText(true);
    }
  };

  const handleTextBlur = () => {
    setIsEditingText(false);
    onUpdate(element.id, { content: textContent } as any);
  };

  const renderContent = () => {
    const style = element.style || {};

    switch (element.type) {
      case 'rectangle': {
        const cornerRadius = (element as any).cornerRadius || style.borderRadius || 12;
        return (
          <div
            className="w-full h-full transition-colors"
            style={{
              backgroundColor: style.fill || '#7c3aed',
              border: style.stroke ? `${style.strokeWidth || 1.5}px solid ${style.stroke}` : 'none',
              borderRadius: `${cornerRadius}px`,
              boxShadow: style.shadow
                ? `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`
                : undefined,
            }}
          />
        );
      }

      case 'ellipse': {
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: style.fill || '#6366f1',
              border: style.stroke ? `${style.strokeWidth || 1.5}px solid ${style.stroke}` : 'none',
              borderRadius: '50%',
              boxShadow: style.shadow
                ? `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`
                : undefined,
            }}
          />
        );
      }

      case 'text': {
        const textEl = element as any;
        if (isEditingText) {
          return (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              onBlur={handleTextBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleTextBlur();
              }}
              autoFocus
              className="w-full h-full bg-transparent resize-none outline-none border border-violet-400 p-2 rounded"
              style={{
                color: style.color || '#ffffff',
                fontSize: `${textEl.fontSize || 24}px`,
                fontFamily: textEl.fontFamily || 'Inter',
                fontWeight: textEl.fontWeight || '600',
                textAlign: textEl.textAlign || 'left',
                lineHeight: textEl.lineHeight || 1.3,
              }}
            />
          );
        }

        return (
          <div
            className="w-full h-full p-2 flex flex-col justify-center whitespace-pre-wrap select-none overflow-hidden"
            style={{
              color: style.color || '#ffffff',
              fontSize: `${textEl.fontSize || 24}px`,
              fontFamily: textEl.fontFamily || 'Inter',
              fontWeight: textEl.fontWeight || '600',
              textAlign: textEl.textAlign || 'left',
              lineHeight: textEl.lineHeight || 1.3,
              letterSpacing: `${textEl.letterSpacing || 0}px`,
            }}
          >
            {textEl.content || 'Double-click to edit text'}
          </div>
        );
      }

      case 'image': {
        const imgEl = element as any;
        return (
          <div
            className="w-full h-full overflow-hidden"
            style={{ borderRadius: `${style.borderRadius || 12}px` }}
          >
            {imgEl.src ? (
              <img
                src={imgEl.src}
                alt={imgEl.name || 'Canvas Image'}
                className="w-full h-full"
                style={{ objectFit: imgEl.fit || 'contain' }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/30 text-xs">
                No Image
              </div>
            )}
          </div>
        );
      }

      case 'chart': {
        const chartEl = element as any;
        const labels = chartEl.data?.labels || ['Q1', 'Q2', 'Q3', 'Q4'];
        const values = chartEl.data?.datasets?.[0]?.data || [40, 75, 60, 95];
        const colors = chartEl.data?.datasets?.[0]?.backgroundColor || [
          '#6366f1',
          '#8b5cf6',
          '#a855f7',
          '#d946ef',
        ];
        const maxVal = Math.max(...values, 100);

        return (
          <div className="w-full h-full bg-[#13131f] border border-white/[0.08] rounded-xl p-3 flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-white/70 tracking-wide uppercase">
              {chartEl.name || 'Bar Chart'}
            </div>
            <div className="flex-1 flex items-end gap-2 pt-2 pb-1">
              {values.map((val: number, i: number) => {
                const heightPercent = Math.max(15, (val / maxVal) * 100);
                const col = Array.isArray(colors) ? colors[i % colors.length] : colors;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full rounded-t-md transition-all duration-300"
                      style={{ height: `${heightPercent}%`, backgroundColor: col }}
                    />
                    <span className="text-[9px] text-white/40 font-mono">
                      {labels[i] || `P${i}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="w-full h-full bg-violet-600/30 border border-violet-400 rounded-lg p-2 text-xs text-white/80 flex items-center justify-center">
            {element.name}
          </div>
        );
    }
  };

  return (
    <div
      ref={ref}
      data-element={element.id}
      data-type={element.type}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => onHover(element.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'absolute group select-none transition-shadow',
        isSelected ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-transparent' : '',
        isHovered && !isSelected ? 'ring-1 ring-violet-400/50' : '',
        element.locked ? 'cursor-not-allowed opacity-60' : 'cursor-move'
      )}
      style={{
        left: `${element.transform.position.x}px`,
        top: `${element.transform.position.y}px`,
        width: `${baseWidth * element.transform.scale.x}px`,
        height: `${baseHeight * element.transform.scale.y}px`,
        transform: `translate(-50%, -50%) rotate(${element.transform.rotation}deg)`,
        transformOrigin: 'center center',
        opacity: element.transform.opacity ?? 1,
        zIndex: element.zIndex,
      }}
    >
      {renderContent()}

      {/* Selection Handles (Resize + Rotate) */}
      {isSelected && !element.locked && (
        <>
          <ResizeHandle
            element={element}
            position="top-left"
            onResize={(delta) => {
              onUpdate(element.id, {
                transform: {
                  ...element.transform,
                  scale: {
                    x: Math.max(0.3, element.transform.scale.x - delta.x / baseWidth),
                    y: Math.max(0.3, element.transform.scale.y - delta.y / baseHeight),
                  },
                },
              });
            }}
          />
          <ResizeHandle
            element={element}
            position="top-right"
            onResize={(delta) => {
              onUpdate(element.id, {
                transform: {
                  ...element.transform,
                  scale: {
                    x: Math.max(0.3, element.transform.scale.x + delta.x / baseWidth),
                    y: Math.max(0.3, element.transform.scale.y - delta.y / baseHeight),
                  },
                },
              });
            }}
          />
          <ResizeHandle
            element={element}
            position="bottom-left"
            onResize={(delta) => {
              onUpdate(element.id, {
                transform: {
                  ...element.transform,
                  scale: {
                    x: Math.max(0.3, element.transform.scale.x - delta.x / baseWidth),
                    y: Math.max(0.3, element.transform.scale.y + delta.y / baseHeight),
                  },
                },
              });
            }}
          />
          <ResizeHandle
            element={element}
            position="bottom-right"
            onResize={(delta) => {
              onUpdate(element.id, {
                transform: {
                  ...element.transform,
                  scale: {
                    x: Math.max(0.3, element.transform.scale.x + delta.x / baseWidth),
                    y: Math.max(0.3, element.transform.scale.y + delta.y / baseHeight),
                  },
                },
              });
            }}
          />

          <RotationHandle
            element={element}
            onRotate={(rotation) => {
              onUpdate(element.id, {
                transform: {
                  ...element.transform,
                  rotation: Math.round(rotation),
                },
              });
            }}
          />

          {/* Name Badge */}
          <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-violet-600 text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none shadow-md">
            {element.name}
          </div>
        </>
      )}
    </div>
  );
}