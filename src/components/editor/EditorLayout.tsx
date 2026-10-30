'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/lib/store';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { CanvasViewport } from './CanvasViewport';
import { BottomTimeline } from './BottomTimeline';
import { ChatPanel } from '../chat/ChatPanel';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles, X } from 'lucide-react';

export function EditorLayout() {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    bottomTimelineOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBottomTimeline,
    activeLeftTab,
    activeRightTab,
    setActiveLeftTab,
    setActiveRightTab,
  } = useEditorStore();

  const [chatOpen, setChatOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(300);
  const [timelineHeight, setTimelineHeight] = useState(190);

  // Resizing states
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);
  const isResizingTimeline = useRef(false);

  const startResizingLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingLeft.current = true;
  }, []);

  const startResizingRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRight.current = true;
  }, []);

  const startResizingTimeline = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingTimeline.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft.current) {
        const newWidth = Math.max(64, Math.min(460, e.clientX));
        setLeftWidth(newWidth);
      } else if (isResizingRight.current) {
        const newWidth = Math.max(240, Math.min(480, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      } else if (isResizingTimeline.current) {
        const newHeight = Math.max(100, Math.min(380, window.innerHeight - e.clientY));
        setTimelineHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isResizingLeft.current = false;
      isResizingRight.current = false;
      isResizingTimeline.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090d] text-[#f4f4f7] overflow-hidden select-none">
      {/* Top Bar Header */}
      <TopBar
        onToggleLeft={toggleLeftSidebar}
        onToggleRight={toggleRightSidebar}
        onToggleBottom={toggleBottomTimeline}
        onToggleChat={() => setChatOpen((prev) => !prev)}
        leftOpen={leftSidebarOpen}
        rightOpen={rightSidebarOpen}
        bottomOpen={bottomTimelineOpen}
        chatOpen={chatOpen}
      />

      {/* Main Studio Viewport Grid */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* LEFT TOOL RAIL: Resizable & Collapsible */}
        {leftSidebarOpen && (
          <div
            className="relative flex shrink-0 border-r border-white/[0.07] bg-[#0c0c14] z-20 transition-[width] duration-75"
            style={{ width: `${leftWidth}px` }}
          >
            <div className="w-full h-full overflow-hidden flex flex-col">
              <LeftSidebar
                activeTab={activeLeftTab}
                onTabChange={setActiveLeftTab}
              />
            </div>

            {/* Drag Handle on Right Edge of Left Sidebar */}
            <div
              onMouseDown={startResizingLeft}
              className="absolute -right-1 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-violet-500/30 transition-colors z-30"
              title="Drag to resize sidebar"
            />
          </div>
        )}

        {/* CENTER STAGE: Canvas Viewport + Bottom Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 relative z-10 bg-[#09090d]">
          {/* Canvas Viewport */}
          <div className="flex-1 relative overflow-hidden min-h-0">
            <CanvasViewport />
          </div>

          {/* BOTTOM TIMELINE: Resizable & Collapsible */}
          {bottomTimelineOpen && (
            <div
              className="relative shrink-0 border-t border-white/[0.08] bg-[#0c0c14] z-20 transition-[height] duration-75"
              style={{ height: `${timelineHeight}px` }}
            >
              {/* Drag Handle on Top Edge of Timeline */}
              <div
                onMouseDown={startResizingTimeline}
                className="absolute left-0 right-0 -top-1 h-2.5 cursor-row-resize hover:bg-violet-500/30 transition-colors z-30"
                title="Drag to resize timeline"
              />

              <div className="w-full h-full overflow-hidden flex flex-col">
                <BottomTimeline />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR: Properties, Layers, Animation, Style */}
        {rightSidebarOpen && (
          <div
            className="relative flex shrink-0 border-l border-white/[0.07] bg-[#0c0c14] z-20 transition-[width] duration-75"
            style={{ width: `${rightWidth}px` }}
          >
            {/* Drag Handle on Left Edge of Right Sidebar */}
            <div
              onMouseDown={startResizingRight}
              className="absolute -left-1 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-violet-500/30 transition-colors z-30"
              title="Drag to resize inspector"
            />

            <div className="w-full h-full overflow-hidden flex flex-col">
              <RightSidebar
                activeTab={activeRightTab}
                onTabChange={setActiveRightTab}
                onClose={toggleRightSidebar}
              />
            </div>
          </div>
        )}

        {/* CONTEXTUAL AI CO-PILOT CHAT PANEL (Slide-over / Docked) */}
        {chatOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-[#10101a] border-l border-white/[0.1] shadow-2xl z-40 flex flex-col animate-slide-in-right">
            <div className="h-10 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-violet-950/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-white">AI Studio Assistant</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}