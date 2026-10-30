'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Magnet,
  Layers,
  Bot,
  Settings,
  Sparkles,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/lib/store';
import { useEditorContext } from './EditorProvider';
import { ExportModal } from '../ui/ExportModal';
import { SettingsModal } from '../ui/SettingsModal';
import { NewProjectModal } from '../ui/NewProjectModal';

interface TopBarProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleBottom: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
  isMobile: boolean;
}

export function TopBar({
  onToggleLeft,
  onToggleRight,
  onToggleBottom,
  leftOpen,
  rightOpen,
  bottomOpen,
  isMobile,
}: TopBarProps) {
  const {
    currentProject,
    createProject,
    editor,
    timeline,
    canUndo,
    canRedo,
    undo,
    redo,
    setZoom,
    setPan,
    resetViewport,
    toggleGrid,
    toggleSnapToGrid,
    saveProject,
    exportProject,
  } = useEditorStore();

  const { initializeProject } = useEditorContext();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setZoomLevel(Math.round(editor.zoom * 100));
  }, [editor.zoom]);

  const handleZoomChange = (value: number) => {
    const newZoom = value / 100;
    setZoom(newZoom);
    setZoomLevel(value);
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const { importProject } = useEditorStore.getState();
    importProject(text);
    event.target.value = '';
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleSave = () => {
    saveProject();
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleUndo = () => {
    if (canUndo()) undo();
  };

  const handleRedo = () => {
    if (canRedo()) redo();
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(editor.zoom + 0.1, 10);
    setZoom(newZoom);
    setZoomLevel(Math.round(newZoom * 100));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(editor.zoom - 0.1, 0.1);
    setZoom(newZoom);
    setZoomLevel(Math.round(newZoom * 100));
  };

  const handleResetView = () => {
    resetViewport();
    setZoomLevel(100);
  };

  return (
    <header className="h-14 bg-secondary/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-50 sticky top-0">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={onToggleLeft}
            aria-label="Toggle menu"
          >
            {leftOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        {/* Logo / Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:block">Anitom AI</span>
        </div>

        {/* Project Name & Actions */}
        <div className="flex items-center gap-2 ml-2 border-l border-border pl-4 hidden md:flex">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
            onClick={handleNewProject}
            title="New Project (Ctrl+N)"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
            onClick={handleSave}
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
            onClick={handleUndo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
            onClick={handleRedo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Project Info & Zoom */}
      <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl mx-4">
        {/* Project Title */}
        <div className="flex items-center gap-2">
          {currentProject ? (
            <span className="font-medium truncate max-w-[200px]">{currentProject.name}</span>
          ) : (
            <span className="text-muted-foreground">No project open</span>
          )}
          {currentProject && (
            <span className="px-2 py-0.5 text-xs rounded bg-primary/20 text-primary">
              v{currentProject.version}
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 border-l border-border pl-4 ml-4">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="flex items-center px-2">
            <input
              type="range"
              min="10"
              max="500"
              value={zoomLevel}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="w-32 h-2 appearance-none bg-muted rounded-lg slider-thumb"
              aria-label="Zoom level"
            />
            <span className="w-16 text-right text-sm text-muted-foreground font-mono">
              {zoomLevel}%
            </span>
          </div>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors ml-1"
            onClick={handleResetView}
            title="Reset View (Shift+1)"
            aria-label="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* View Options */}
        <div className="flex items-center gap-1 border-r border-border pr-4 mr-4 hidden lg:flex">
          <button
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-1',
              editor.gridEnabled
                ? 'bg-accent text-foreground'
                : 'hover:bg-accent'
            )}
            onClick={toggleGrid}
            title="Toggle Grid (G)"
            aria-label="Toggle grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-1',
              editor.snapToGrid
                ? 'bg-accent text-foreground'
                : 'hover:bg-accent'
            )}
            onClick={toggleSnapToGrid}
            title="Snap to Grid (Shift+G)"
            aria-label="Snap to grid"
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Toggles */}
        <div className="flex items-center gap-1">
          <button
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-1',
              leftOpen
                ? 'bg-accent text-foreground'
                : 'hover:bg-accent'
            )}
            onClick={onToggleLeft}
            title="Toggle Project Panel"
            aria-label="Toggle project panel"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-1',
              rightOpen
                ? 'bg-accent text-foreground'
                : 'hover:bg-accent'
            )}
            onClick={onToggleRight}
            title="Toggle Properties Panel"
            aria-label="Toggle properties panel"
          >
            <Bot className="w-4 h-4" />
          </button>

          <button
            className={cn(
              'p-2 rounded-lg transition-colors flex items-center gap-1',
              bottomOpen
                ? 'bg-accent text-foreground'
                : 'hover:bg-accent'
            )}
            onClick={onToggleBottom}
            title="Toggle Timeline"
            aria-label="Toggle timeline"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Export / Import / Settings */}
        <div className="flex items-center gap-1 border-l border-border pl-4 ml-4">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
            onClick={handleExport}
            title="Export"
            aria-label="Export project"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1 relative"
            onClick={handleImportProject}
            title="Import"
            aria-label="Import project"
          >
            <Upload className="w-4 h-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileImport}
            />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1"
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-1 ml-1"
            title="Share"
            aria-label="Share project"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <NewProjectModal isOpen={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} />
    </header>
  );
}