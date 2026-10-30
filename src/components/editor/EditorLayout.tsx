'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  History,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Menu,
  X,
  Bot,
  Layers,
  Timeline,
  Palette,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/lib/store';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomTimeline } from './BottomTimeline';
import { CanvasViewport } from './CanvasViewport';
import { TopBar } from './TopBar';
import { ChatPanel } from '../chat/ChatPanel';

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
    currentProject,
    createProject,
  } = useEditorStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <TopBar
        onToggleLeft={toggleLeftSidebar}
        onToggleRight={toggleRightSidebar}
        onToggleBottom={toggleBottomTimeline}
        leftOpen={leftSidebarOpen}
        rightOpen={rightSidebarOpen}
        bottomOpen={bottomTimelineOpen}
        isMobile={isMobile}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {leftSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? 280 : 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(
                'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] bg-secondary border-r border-border flex flex-col',
                isMobile ? 'w-[280px] shadow-xl' : 'w-[320px]'
              )}
            >
              <LeftSidebar
                activeTab={activeLeftTab}
                onTabChange={setActiveLeftTab}
                onClose={isMobile ? toggleLeftSidebar : undefined}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Workspace */}
        <main
          className={cn(
            'flex-1 flex flex-col overflow-hidden transition-all duration-200',
            leftSidebarOpen && !isMobile ? 'lg:ml-[320px]' : '',
            rightSidebarOpen && !isMobile ? 'lg:mr-[320px]' : '',
            bottomTimelineOpen ? 'lg:mb-[200px]' : ''
          )}
        >
          <div className="flex-1 flex relative">
            {/* Chat Panel (Left side of workspace) */}
            <AnimatePresence mode="wait">
              {activeLeftTab === 'chat' && leftSidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 400, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:block w-[400px] border-r border-border bg-secondary flex flex-col"
                >
                  <ChatPanel />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
              <CanvasViewport />
            </div>

            {/* Properties Panel (Right side of workspace) */}
            <AnimatePresence mode="wait">
              {activeRightTab !== 'layers' && rightSidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden lg:block w-[320px] border-l border-border bg-secondary flex flex-col"
                >
                  <RightSidebar
                    activeTab={activeRightTab}
                    onTabChange={setActiveRightTab}
                    onClose={isMobile ? toggleRightSidebar : undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar (Layers) - Always on far right */}
        <AnimatePresence mode="wait">
          {(activeRightTab === 'layers' || !rightSidebarOpen) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightSidebarOpen ? 320 : 0, opacity: rightSidebarOpen ? 1 : 0 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn(
                'fixed right-0 top-14 z-40 h-[calc(100vh-3.5rem)] bg-secondary border-l border-border flex flex-col',
                rightSidebarOpen ? 'w-[320px] shadow-xl' : 'w-0'
              )}
            >
              <RightSidebar
                activeTab={activeRightTab}
                onTabChange={setActiveRightTab}
                onClose={isMobile ? toggleRightSidebar : undefined}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="fixed inset-0 top-14 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => {
              if (leftSidebarOpen) toggleLeftSidebar();
              if (rightSidebarOpen) toggleRightSidebar();
            }}
          />
        )}
      </div>

      {/* Bottom Timeline */}
      <AnimatePresence mode="wait">
        {bottomTimelineOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-border shadow-xl lg:static lg:shadow-none"
          >
            <BottomTimeline />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons for Mobile */}
      {isMobile && (
        <>
          {!leftSidebarOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-24 left-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
              onClick={toggleLeftSidebar}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}
          {!rightSidebarOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-24 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
              onClick={toggleRightSidebar}
              aria-label="Open properties"
            >
              <Layers className="w-5 h-5" />
            </motion.button>
          )}
          {!bottomTimelineOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
              onClick={toggleBottomTimeline}
              aria-label="Open timeline"
            >
              <Timeline className="w-5 h-5" />
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}