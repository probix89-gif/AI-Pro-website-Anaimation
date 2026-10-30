'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn, generateId } from '@/lib/utils';
import { useEditorStore } from '@/lib/store';
import type { CanvasElement } from '@/types';
import { SelectionBox } from './SelectionBox';
import { ElementRenderer } from './ElementRenderer';
import { GridOverlay } from './GridOverlay';
import { Rulers } from './Rulers';

export function CanvasViewport() {
  const {
    currentProject,
    editor,
    setPan,
    setPanDelta,
    setZoom,
    setTool,
    selectElement,
    clearSelection,
    addElement,
    updateElement,
    deleteElement,
    setHoveredElement,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const isPanningRef = useRef(false);
  const isSelectingRef = useRef(false);
  const selectionStartRef = useRef({ x: 0, y: 0 });
  const lastPanRef = useRef({ x: 0, y: 0 });

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle wheel zoom and pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;

        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.15, Math.min(5, Math.round((editor.zoom + zoomDelta) * 10) / 10));
        setZoom(newZoom);
      } else {
        // Pan with trackpad or mouse wheel
        setPanDelta({ x: -e.deltaX, y: -e.deltaY });
      }
    },
    [editor.zoom, setZoom, setPanDelta]
  );

  // Canvas coordinates converter
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!wrapperRef.current || !currentProject) return { x: 0, y: 0 };
      const rect = wrapperRef.current.getBoundingClientRect();
      const canvasWidth = currentProject.canvasSize.width * editor.zoom;
      const canvasHeight = currentProject.canvasSize.height * editor.zoom;
      const canvasLeft = editor.pan.x + (rect.width - canvasWidth) / 2;
      const canvasTop = editor.pan.y + (rect.height - canvasHeight) / 2;

      const x = (clientX - rect.left - canvasLeft) / editor.zoom;
      const y = (clientY - rect.top - canvasTop) / editor.zoom;
      return { x, y };
    },
    [editor.pan, editor.zoom, currentProject]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle click or hand tool: pan
      if (e.button === 1 || e.altKey || editor.tool === 'hand') {
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        return;
      }

      // Left click only on canvas background
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('[data-element]')) return;

      const coords = getCanvasCoords(e.clientX, e.clientY);

      // Creating elements directly with active tool
      if (editor.tool === 'rectangle' || editor.tool === 'ellipse' || editor.tool === 'text') {
        const timestamp = Date.now();
        let newEl: CanvasElement;

        if (editor.tool === 'text') {
          newEl = {
            id: generateId('el'),
            type: 'text',
            name: 'Text',
            content: 'Double-click to edit',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: '600',
            lineHeight: 1.3,
            letterSpacing: 0,
            textAlign: 'left',
            verticalAlign: 'top',
            transform: {
              position: { x: Math.round(coords.x), y: Math.round(coords.y) },
              rotation: 0,
              scale: { x: 1.5, y: 1 },
              opacity: 1,
            },
            style: { color: '#ffffff' },
            locked: false,
            visible: true,
            zIndex: (currentProject?.elements.length || 0) + 1,
            createdAt: timestamp,
            updatedAt: timestamp,
          } as CanvasElement;
        } else if (editor.tool === 'ellipse') {
          newEl = {
            id: generateId('el'),
            type: 'ellipse',
            name: 'Circle',
            transform: {
              position: { x: Math.round(coords.x), y: Math.round(coords.y) },
              rotation: 0,
              scale: { x: 1.5, y: 1.5 },
              opacity: 1,
            },
            style: { fill: '#6366f1', stroke: '#a5b4fc', strokeWidth: 1.5 },
            locked: false,
            visible: true,
            zIndex: (currentProject?.elements.length || 0) + 1,
            createdAt: timestamp,
            updatedAt: timestamp,
          } as CanvasElement;
        } else {
          newEl = {
            id: generateId('el'),
            type: 'rectangle',
            name: 'Rectangle',
            cornerRadius: 12,
            transform: {
              position: { x: Math.round(coords.x), y: Math.round(coords.y) },
              rotation: 0,
              scale: { x: 2, y: 1.5 },
              opacity: 1,
            },
            style: { fill: '#7c3aed', stroke: '#c084fc', strokeWidth: 1.5 },
            locked: false,
            visible: true,
            zIndex: (currentProject?.elements.length || 0) + 1,
            createdAt: timestamp,
            updatedAt: timestamp,
          } as CanvasElement;
        }

        addElement(newEl);
        setTool('select');
        return;
      }

      // Selection box
      if (editor.tool === 'select') {
        isSelectingRef.current = true;
        selectionStartRef.current = coords;
        if (!e.shiftKey) {
          clearSelection();
        }
      }
    },
    [editor.tool, getCanvasCoords, currentProject, addElement, setTool, clearSelection]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastPanRef.current.x;
        const dy = e.clientY - lastPanRef.current.y;
        setPanDelta({ x: dx, y: dy });
        lastPanRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [setPanDelta]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    isSelectingRef.current = false;
  }, []);

  if (!currentProject) return null;

  const canvasWidth = currentProject.canvasSize.width * editor.zoom;
  const canvasHeight = currentProject.canvasSize.height * editor.zoom;
  const canvasLeft = editor.pan.x + (containerSize.width - canvasWidth) / 2;
  const canvasTop = editor.pan.y + (containerSize.height - canvasHeight) / 2;

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full relative overflow-hidden bg-[#09090d] select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: editor.tool === 'hand' || isPanningRef.current ? 'grab' : 'default',
      }}
    >
      {/* Rulers */}
      {currentProject.settings?.showRulers && (
        <Rulers
          zoom={editor.zoom}
          pan={editor.pan}
          containerSize={containerSize}
          canvasSize={currentProject.canvasSize}
        />
      )}

      {/* CENTRAL SCALED CANVAS STAGE */}
      <div
        ref={canvasRef}
        data-zoom={editor.zoom}
        className="canvas-container absolute origin-top-left transition-transform duration-75"
        style={{
          width: `${currentProject.canvasSize.width}px`,
          height: `${currentProject.canvasSize.height}px`,
          transform: `translate(${canvasLeft}px, ${canvasTop}px) scale(${editor.zoom})`,
          backgroundColor: currentProject.backgroundColor || '#0e0e16',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1), 0 30px 80px -15px rgba(0, 0, 0, 0.85)',
        }}
      >
        {/* Grid Overlay */}
        {editor.gridEnabled && (
          <GridOverlay
            size={currentProject.canvasSize}
            gridSize={currentProject.settings?.gridSize || 20}
            zoom={editor.zoom}
          />
        )}

        {/* Elements List */}
        {currentProject.elements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            isSelected={editor.selectedElements.includes(element.id)}
            isHovered={editor.hoveredElement === element.id}
            onSelect={(id, multi) => selectElement(id, multi)}
            onHover={setHoveredElement}
            onUpdate={updateElement}
            onDelete={deleteElement}
          />
        ))}
      </div>
    </div>
  );
}