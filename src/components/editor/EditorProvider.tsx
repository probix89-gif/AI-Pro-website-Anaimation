'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useEditorStore } from '@/lib/store';
import type { Project } from '@/types';

interface EditorContextType {
  initializeProject: (project?: Project) => void;
  isInitialized: boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    currentProject,
    setCurrentProject,
    undo,
    redo,
    canUndo,
    canRedo,
    copyElements,
    pasteElements,
    deleteElements,
    clearSelection,
    editor,
    setTool,
    toggleGrid,
    toggleSnapToGrid,
    setPlaying,
    timeline,
    setZoom,
  } = useEditorStore();

  const initializeProject = useCallback((project?: Project) => {
    if (project) {
      setCurrentProject(project);
    }
    setIsInitialized(true);
  }, [setCurrentProject]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[data-modal-container]')
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo()) redo();
        } else {
          if (canUndo()) undo();
        }
        return;
      }

      // Redo (Ctrl+Y)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
        return;
      }

      // Copy
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        if (editor.selectedElements.length > 0) {
          e.preventDefault();
          copyElements(editor.selectedElements);
        }
        return;
      }

      // Paste
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteElements({ x: 20, y: 20 });
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editor.selectedElements.length > 0) {
          e.preventDefault();
          deleteElements(editor.selectedElements);
        }
        return;
      }

      // Deselect on Escape
      if (e.key === 'Escape') {
        clearSelection();
        setTool('select');
        return;
      }

      // Space: Toggle Play / Pause in timeline
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setPlaying(!timeline.playing);
        return;
      }

      // Tool shortcuts (when not holding Ctrl)
      if (!isCmdOrCtrl) {
        if (e.key.toLowerCase() === 'v') setTool('select');
        else if (e.key.toLowerCase() === 'h') setTool('hand');
        else if (e.key.toLowerCase() === 't') setTool('text');
        else if (e.key.toLowerCase() === 'r') setTool('rectangle');
        else if (e.key.toLowerCase() === 'o') setTool('ellipse');
        else if (e.key.toLowerCase() === 'l') setTool('line');
        else if (e.key.toLowerCase() === 'g') toggleGrid();
      }

      // Zoom shortcuts
      if (isCmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(Math.min(5, editor.zoom + 0.1));
      }
      if (isCmdOrCtrl && e.key === '-') {
        e.preventDefault();
        setZoom(Math.max(0.2, editor.zoom - 0.1));
      }
      if (isCmdOrCtrl && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    },
    [
      canUndo,
      undo,
      canRedo,
      redo,
      editor.selectedElements,
      editor.zoom,
      copyElements,
      pasteElements,
      deleteElements,
      clearSelection,
      setTool,
      setPlaying,
      timeline.playing,
      toggleGrid,
      setZoom,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <EditorContext.Provider value={{ initializeProject, isInitialized }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}