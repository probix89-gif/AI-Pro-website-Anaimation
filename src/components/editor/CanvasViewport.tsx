'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
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

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(10, editor.zoom * zoomFactor));

        // Adjust pan to zoom towards mouse position
        const panX = editor.pan.x - (mouseX - editor.pan.x) * (zoomFactor - 1);
        const panY = editor.pan.y - (mouseY - editor.pan.y) * (zoomFactor - 1);

        setZoom(newZoom);
        setPan({ x: panX, y: panY });
      } else if (e.shiftKey) {
        // Horizontal pan with shift + wheel
        e.preventDefault();
        setPanDelta({ x: -e.deltaY, y: 0 });
      }
    },
    [editor.zoom, editor.pan, setZoom, setPan, setPanDelta]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left click on canvas background
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('[data-element]')) return;

      if (e.altKey || editor.tool === 'hand') {
        // Pan mode
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      } else if (editor.tool === 'select') {
        // Selection box
        isSelectingRef.current = true;
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (rect) {
          selectionStartRef.current = {
            x: (e.clientX - rect.left - editor.pan.x) / editor.zoom,
            y: (e.clientY - rect.top - editor.pan.y) / editor.zoom,
          };
        }
        clearSelection();
      }
    },
    [editor.tool, editor.pan, editor.zoom, clearSelection]
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

  // Handle double click
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (editor.tool === 'select' && (e.target as HTMLElement) === canvasRef.current) {
        // Create text element on double click
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - editor.pan.x) / editor.zoom;
          const y = (e.clientY - rect.top - editor.pan.y) / editor.zoom;

          const newElement: CanvasElement = {
            id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'text',
            name: 'Text',
            transform: {
              position: { x, y },
              rotation: 0,
              scale: { x: 1, y: 1 },
              opacity: 1,
            },
            style: {
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: '400',
              color: '#ffffff',
              textAlign: 'left',
            },
            locked: false,
            visible: true,
            zIndex: Date.now(),
            content: 'Double click to edit',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: '400',
            lineHeight: 1.5,
            letterSpacing: 0,
            textAlign: 'left',
            verticalAlign: 'top',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          addElement(newElement);
        }
      }
    },
    [editor.tool, editor.pan, editor.zoom, addElement]
  );

  // Handle key down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (editor.selectedElements.length > 0) {
            e.preventDefault();
            editor.selectedElements.forEach((id) => deleteElement(id));
          }
          break;
        case 'Escape':
          clearSelection();
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Select all elements
            if (currentProject) {
              const allIds = currentProject.elements.map((el) => el.id);
              // Would need a selectAll action
            }
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Group selected
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor.selectedElements, currentProject, deleteElement, clearSelection]);

  // Handle drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect || files.length === 0) return;

      const x = (e.clientX - rect.left - editor.pan.x) / editor.zoom;
      const y = (e.clientY - rect.top - editor.pan.y) / editor.zoom;

      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const newElement: CanvasElement = {
              id: `img_${Date.now()}_${index}`,
              type: 'image',
              name: file.name,
              transform: {
                position: { x: x + index * 20, y: y + index * 20 },
                rotation: 0,
                scale: { x: 1, y: 1 },
                opacity: 1,
              },
              style: {},
              locked: false,
              visible: true,
              zIndex: Date.now() + index,
              src: event.target?.result as string,
              naturalWidth: 800,
              naturalHeight: 600,
              fit: 'contain',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            addElement(newElement);
          };
          reader.readAsDataURL(file);
        }
      });
    },
    [editor.pan, editor.zoom, addElement]
  );

  if (!currentProject) {
    return (
      <div
        ref={wrapperRef}
        className="flex-1 flex items-center justify-center bg-background"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center text-muted-foreground p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Welcome to Anitom AI</h2>
          <p className="max-w-md mx-auto">Create a new project or open an existing one from the sidebar to start designing.</p>
        </div>
      </div>
    );
  }

  const canvasWidth = currentProject.canvasSize.width * editor.zoom;
  const canvasHeight = currentProject.canvasSize.height * editor.zoom;
  const canvasLeft = editor.pan.x + (containerSize.width - canvasWidth) / 2;
  const canvasTop = editor.pan.y + (containerSize.height - canvasHeight) / 2;

  return (
    <div
      ref={wrapperRef}
      className="flex-1 relative overflow-hidden bg-muted/50"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Rulers */}
      <Rulers
        zoom={editor.zoom}
        pan={editor.pan}
        containerSize={containerSize}
        canvasSize={currentProject.canvasSize}
      />

      {/* Canvas Wrapper */}
      <div
        ref={canvasRef}
        className={cn(
          'canvas-container relative',
          'transform',
          `translate-x-[${editor.pan.x}px] translate-y-[${editor.pan.y}px] scale-[${editor.zoom}]`,
          'transform-origin-top-left',
          'will-change-transform'
        )}
        style={{
          width: currentProject.canvasSize.width,
          height: currentProject.canvasSize.height,
        }}
        data-zoom={editor.zoom}
        data-pan-x={editor.pan.x}
        data-pan-y={editor.pan.y}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: currentProject.backgroundColor }}
        />

        {/* Grid Overlay */}
        {editor.gridEnabled && (
          <GridOverlay
            size={currentProject.canvasSize}
            gridSize={currentProject.settings.gridSize}
            zoom={editor.zoom}
          />
        )}

        {/* Elements */}
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

        {/* Selection Box */}
        {isSelectingRef.current && (
          <SelectionBox
            start={selectionStartRef.current}
            end={{
              x: (() => {
                const rect = wrapperRef.current?.getBoundingClientRect();
                if (!rect) return 0;
                return (lastPanRef.current.x - rect.left - editor.pan.x) / editor.zoom;
              })(),
              y: (() => {
                const rect = wrapperRef.current?.getBoundingClientRect();
                if (!rect) return 0;
                return (lastPanRef.current.y - rect.top - editor.pan.y) / editor.zoom;
              })(),
            }}
            onSelect={selectElement}
            elements={currentProject.elements}
          />
        )}
      </div>

      {/* Canvas Shadow/Frame */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: canvasLeft - 1,
          top: canvasTop - 1,
          width: canvasWidth + 2,
          height: canvasHeight + 2,
          boxShadow: '0 0 0 1px var(--border), 0 20px 40px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}