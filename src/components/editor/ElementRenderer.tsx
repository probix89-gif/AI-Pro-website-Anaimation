'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { CanvasElement, Vector2D } from '@/types';
import { getElementBounds } from '@/lib/utils';
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
  const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const b = getElementBounds(element);
    setBounds(b);
  }, [element]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id, e.shiftKey);
  };

  const handleMouseEnter = () => onHover(element.id);
  const handleMouseLeave = () => onHover(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text') {
      // Enter text edit mode
    }
  };

  const transformStyle = {
    transform: `
      translate(${element.transform.position.x}px, ${element.transform.position.y}px)
      rotate(${element.transform.rotation}deg)
      scale(${element.transform.scale.x}, ${element.transform.scale.y})
    `,
    transformOrigin: 'center center',
    opacity: element.transform.opacity,
    pointerEvents: element.visible ? 'auto' : 'none',
  } as React.CSSProperties;

  const commonStyle = {
    position: 'absolute' as const,
    left: bounds.x,
    top: bounds.y,
    width: bounds.width,
    height: bounds.height,
    boxSizing: 'border-box' as const,
    userSelect: 'none' as const,
  };

  // Render based on element type
  const renderElement = () => {
    const style = element.style || {};

    switch (element.type) {
      case 'rectangle': {
        const cornerRadius = (element as any).cornerRadius || 0;
        return (
          <div
            style={{
              ...commonStyle,
              backgroundColor: style.fill || 'transparent',
              border: style.stroke ? `${style.strokeWidth || 1}px solid ${style.stroke}` : 'none',
              borderRadius: cornerRadius,
            }}
          />
        );
      }

      case 'ellipse': {
        return (
          <div
            style={{
              ...commonStyle,
              backgroundColor: style.fill || 'transparent',
              border: style.stroke ? `${style.strokeWidth || 1}px solid ${style.stroke}` : 'none',
              borderRadius: '50%',
            }}
          />
        );
      }

      case 'text': {
        const textEl = element as any;
        return (
          <div
            style={{
              ...commonStyle,
              color: style.color || '#ffffff',
              fontSize: textEl.fontSize || style.fontSize || 16,
              fontFamily: textEl.fontFamily || style.fontFamily || 'Inter',
              fontWeight: textEl.fontWeight || style.fontWeight || '400',
              lineHeight: textEl.lineHeight || style.lineHeight || 1.5,
              letterSpacing: textEl.letterSpacing || style.letterSpacing || 0,
              textAlign: textEl.textAlign || style.textAlign || 'left',
              display: 'flex',
              alignItems: textEl.verticalAlign === 'top' ? 'flex-start' : textEl.verticalAlign === 'bottom' ? 'flex-end' : 'center',
              justifyContent: textEl.textAlign === 'left' ? 'flex-start' : textEl.textAlign === 'right' ? 'flex-end' : 'center',
              padding: 4,
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {textEl.content || 'Text'}
          </div>
        );
      }

      case 'image': {
        const imgEl = element as any;
        return (
          <div style={{ ...commonStyle, overflow: 'hidden' }}>
            {imgEl.src && (
              <img
                src={imgEl.src}
                alt={imgEl.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: imgEl.fit || 'contain',
                  objectPosition: 'center',
                }}
              />
            )}
          </div>
        );
      }

      case 'frame': {
        const frameEl = element as any;
        return (
          <div
            style={{
              ...commonStyle,
              backgroundColor: frameEl.backgroundColor || 'transparent',
              border: '1px dashed var(--border)',
              overflow: frameEl.clipsContent ? 'hidden' : 'visible',
            }}
          >
            {frameEl.children?.map((childId: string) => (
              <div key={childId} className="frame-child" />
            ))}
          </div>
        );
      }

      case 'group': {
        return (
          <div style={{ ...commonStyle, border: '1px dashed var(--primary)' }}>
            <div className="absolute top-1 left-1 px-1 py-0.5 text-xs bg-primary/80 text-primary-foreground rounded">
              Group
            </div>
          </div>
        );
      }

      case 'line':
      case 'arrow': {
        const lineEl = element as any;
        const startX = lineEl.startPoint?.x || 0;
        const startY = lineEl.startPoint?.y || 0;
        const endX = lineEl.endPoint?.x || bounds.width;
        const endY = lineEl.endPoint?.y || bounds.height;

        return (
          <svg style={{ ...commonStyle, overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {lineEl.endArrow && (
                <marker
                  id={`arrowhead-${element.id}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill={style.stroke || '#ffffff'} />
                </marker>
              )}
              {lineEl.startArrow && (
                <marker
                  id={`arrowhead-start-${element.id}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="1"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M9,0 L9,6 L0,3 z" fill={style.stroke || '#ffffff'} />
                </marker>
              )}
            </defs>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={style.stroke || '#ffffff'}
              strokeWidth={style.strokeWidth || 2}
              strokeDasharray={style.strokeDasharray || 'none'}
              markerEnd={lineEl.endArrow ? `url(#arrowhead-${element.id})` : undefined}
              markerStart={lineEl.startArrow ? `url(#arrowhead-start-${element.id})` : undefined}
            />
          </svg>
        );
      }

      case 'chart': {
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <span>📊 Chart: {element.chartType}</span>
          </div>
        );
      }

      case 'diagram': {
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <span>📐 Diagram: {element.diagramType}</span>
          </div>
        );
      }

      case 'mindmap': {
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <span>🧠 Mindmap</span>
          </div>
        );
      }

      case 'flowchart': {
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <span>⟳ Flowchart</span>
          </div>
        );
      }

      case 'animation': {
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', border: '2px dashed var(--primary)' }}>
            <span>✨ Animation</span>
          </div>
        );
      }

      default:
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
            <span>Unknown Element</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={ref}
      data-element={element.id}
      data-type={element.type}
      style={{
        ...transformStyle,
        zIndex: element.zIndex,
        cursor: element.locked ? 'not-allowed' : 'move',
      }}
      className={cn(
        'transition-all duration-100',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isHovered && !isSelected && 'ring-1 ring-primary/50 ring-offset-1 ring-offset-background',
        element.locked && 'opacity-70',
        !element.visible && 'opacity-30'
      )}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement()}

      {/* Selection Handles */}
      {isSelected && !element.locked && (
        <>
          <ResizeHandle
            element={element}
            position="top-left"
            onResize={(delta) => onUpdate(element.id, { transform: { ...element.transform, position: { x: element.transform.position.x + delta.x / 2, y: element.transform.position.y + delta.y / 2 }, scale: { x: element.transform.scale.x - delta.x / bounds.width, y: element.transform.scale.y - delta.y / bounds.height } } })}
          />
          <ResizeHandle
            element={element}
            position="top-right"
            onResize={(delta) => onUpdate(element.id, { transform: { ...element.transform, position: { x: element.transform.position.x - delta.x / 2, y: element.transform.position.y + delta.y / 2 }, scale: { x: element.transform.scale.x + delta.x / bounds.width, y: element.transform.scale.y - delta.y / bounds.height } } })}
          />
          <ResizeHandle
            element={element}
            position="bottom-left"
            onResize={(delta) => onUpdate(element.id, { transform: { ...element.transform, position: { x: element.transform.position.x + delta.x / 2, y: element.transform.position.y - delta.y / 2 }, scale: { x: element.transform.scale.x - delta.x / bounds.width, y: element.transform.scale.y + delta.y / bounds.height } } })}
          />
          <ResizeHandle
            element={element}
            position="bottom-right"
            onResize={(delta) => onUpdate(element.id, { transform: { ...element.transform, position: { x: element.transform.position.x - delta.x / 2, y: element.transform.position.y - delta.y / 2 }, scale: { x: element.transform.scale.x + delta.x / bounds.width, y: element.transform.scale.y + delta.y / bounds.height } } })}
          />

          <RotationHandle
            element={element}
            onRotate={(rotation) => onUpdate(element.id, { transform: { ...element.transform, rotation } })}
          />
        </>
      )}

      {/* Element Name Label */}
      {isSelected && (
        <div className="absolute -top-6 left-0 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded whitespace-nowrap">
          {element.name}
        </div>
      )}
    </div>
  );
}