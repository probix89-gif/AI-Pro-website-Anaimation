'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Magnet,
  Layers,
  Settings,
  Sparkles,
  Download,
  Upload,
  Play,
  Pause,
  Maximize2,
  FileText,
  Sliders,
  Clock,
  Check,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/lib/store';
import { ExportModal } from '../ui/ExportModal';
import { SettingsModal } from '../ui/SettingsModal';
import { NewProjectModal } from '../ui/NewProjectModal';

interface TopBarProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleBottom: () => void;
  onToggleChat?: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
  chatOpen?: boolean;
}

export function TopBar({
  onToggleLeft,
  onToggleRight,
  onToggleBottom,
  onToggleChat,
  leftOpen,
  rightOpen,
  bottomOpen,
  chatOpen,
}: TopBarProps) {
  const {
    currentProject,
    setCurrentProject,
    updateProject,
    editor,
    timeline,
    canUndo,
    canRedo,
    undo,
    redo,
    setZoom,
    resetViewport,
    toggleGrid,
    toggleSnapToGrid,
    setPlaying,
    saveProject,
  } = useEditorStore();

  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(currentProject?.name || 'Untitled Project');
  const [isSaved, setIsSaved] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentProject) {
      setProjectTitle(currentProject.name);
    }
  }, [currentProject?.name]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (projectTitle.trim() && currentProject) {
      updateProject({ name: projectTitle.trim() });
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(5, Math.round((editor.zoom + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.2, Math.round((editor.zoom - 0.1) * 10) / 10));
  };

  const handleZoomReset = () => {
    resetViewport();
  };

  const handleSave = () => {
    saveProject();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { importProject } = useEditorStore.getState();
        importProject(text);
      } catch (err) {
        console.error('Failed to import project:', err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <header className="h-12 bg-[#0c0c14] border-b border-white/[0.08] flex items-center justify-between px-3 shrink-0 z-40 select-none text-white">
        {/* LEFT SECTION: Back to Studio, Logo, and Project Name */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setCurrentProject(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-violet-600/20 hover:text-violet-300 text-white/70 text-xs font-medium transition-colors shrink-0 border border-white/[0.06] hover:border-violet-500/30"
            title="Return to Creative Studio (Auto-saved)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <div className="h-4 w-px bg-white/[0.08] mx-0.5 shrink-0" />

          {/* Project Title with Inline Rename */}
          <div className="flex items-center gap-1.5 min-w-0 max-w-[160px] sm:max-w-xs">
            {isEditingTitle ? (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setProjectTitle(currentProject?.name || 'Untitled Project');
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="bg-[#161622] px-2 py-0.5 rounded text-xs font-semibold text-white border border-violet-500/50 outline-none w-full"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="px-2 py-1 rounded-md hover:bg-white/[0.06] text-xs font-medium text-white/90 truncate text-left transition-colors flex items-center gap-1.5 group"
                title="Click to rename project"
              >
                <span className="truncate">{currentProject?.name || 'Untitled Project'}</span>
                <span className="text-[10px] text-white/30 group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎
                </span>
              </button>
            )}

            {currentProject?.canvasSize && (
              <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 border border-white/[0.04] shrink-0">
                {currentProject.canvasSize.width}×{currentProject.canvasSize.height}
              </span>
            )}
          </div>
        </div>

        {/* CENTER SECTION: Undo/Redo, Zoom, Grid, Snap, Playback */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/[0.08] mx-1 hidden sm:block" />

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Zoom Out (Ctrl -)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-0.5 text-[11px] font-mono text-white/70 hover:text-white hover:bg-white/[0.08] rounded transition-colors min-w-[42px] text-center"
              title="Reset Zoom to 100% (Ctrl 0)"
            >
              {Math.round(editor.zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Zoom In (Ctrl +)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/[0.08] mx-1 hidden md:block" />

          {/* Grid and Snapping Toggles */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
            <button
              onClick={toggleGrid}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                editor.gridEnabled
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
              )}
              title="Toggle Grid (G)"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleSnapToGrid}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                editor.snapToGrid
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
              )}
              title="Toggle Snap to Grid (Shift+G)"
            >
              <Magnet className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/[0.08] mx-1 hidden lg:block" />

          {/* Timeline Playback Quick Control */}
          <button
            onClick={() => setPlaying(!timeline.playing)}
            className={cn(
              'hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
              timeline.playing
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
            )}
            title="Play/Pause Timeline (Space)"
          >
            {timeline.playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px]">{timeline.currentTime.toFixed(1)}s</span>
          </button>
        </div>

        {/* RIGHT SECTION: AI Assistant, Panel Toggles, Export & Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* AI Assistant Co-pilot Toggle */}
          <button
            onClick={onToggleChat}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              chatOpen
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25'
                : 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30'
            )}
            title="Toggle AI Co-Pilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">AI Co-Pilot</span>
          </button>

          {/* Sidebar Layout View Toggles */}
          <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-lg p-0.5">
            <button
              onClick={onToggleLeft}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                leftOpen
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              )}
              title="Toggle Left Tool Rail"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleBottom}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                bottomOpen
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              )}
              title="Toggle Bottom Timeline"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleRight}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                rightOpen
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              )}
              title="Toggle Right Inspector"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/[0.08] mx-0.5" />

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium transition-colors border border-white/[0.08]"
            title="Export Project (PNG, SVG, MP4, JSON)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MODALS */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showNewProjectModal && (
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      )}
    </>
  );
}